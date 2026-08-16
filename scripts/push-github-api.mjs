// 通过 GitHub Git Database API 推送整个仓库（github.com 直连被墙时的替代方案）
// 用法：node scripts/push-github-api.mjs
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import https from "node:https";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const TOKEN = process.env.GH_TOKEN || ""; // 通过环境变量 GH_TOKEN 提供（勿硬编码）
const REPO = "jian522/trusty-cars-export";
const BRANCH = "main";
const COMMIT_MSG =
  "feat: Trusty Used Cars export site - 100-car inventory, 90 real che168 photos, i18n (zh/en/ar/ru), SQLite admin, GitHub Actions CI";

/** 计算 git blob 的对象 SHA（sha1("blob <len>\\0" + content)），用于引用已存在的 blob */
function gitBlobSha(buf) {
  const header = `blob ${buf.length}\0`;
  return createHash("sha1").update(header, "utf8").update(buf).digest("hex");
}

function api(method, url, body, retries = 3) {
  return new Promise((resolve, reject) => {
    const u = new URL("https://api.github.com" + url);
    const data = body ? JSON.stringify(body) : null;
    const req = https.request(
      {
        host: u.hostname,
        path: u.pathname + u.search,
        method,
        headers: {
          Authorization: `token ${TOKEN}`,
          "User-Agent": "dsh-agent",
          "Content-Type": "application/json",
          Accept: "application/vnd.github+json",
          ...(data ? { "Content-Length": Buffer.byteLength(data) } : {}),
        },
      },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf8");
          if (res.statusCode >= 300) {
            const err = new Error(`${method} ${url} -> ${res.statusCode}: ${text.slice(0, 300)}`);
            err.status = res.statusCode;
            return reject(err);
          }
          resolve(text ? JSON.parse(text) : null);
        });
      }
    );
    req.on("error", reject);
    req.setTimeout(60000, () => req.destroy(new Error("timeout")));
    if (data) req.write(data);
    req.end();
  }).catch(async (err) => {
    // 限流/5xx 重试（403 视为二级限流，等待 60s）
    if (retries > 0 && (err.status === 429 || err.status === 403 || err.status >= 500 || /timeout|hang up/i.test(err.message))) {
      const wait = err.status === 429 || err.status === 403 ? 60000 : 3000;
      console.log(`  ${method} ${url} 失败(${err.message.slice(0, 80)}), ${wait / 1000}s 后重试...`);
      await new Promise((r) => setTimeout(r, wait));
      return api(method, url, body, retries - 1);
    }
    throw err;
  });
}

async function main() {
  const args = process.argv.slice(2);
  const excludePrefix = args.indexOf("--exclude-prefix") >= 0 ? args[args.indexOf("--exclude-prefix") + 1] : null;

  // 1) 文件清单（尊重 .gitignore，可选排除目录）
  let files = execSync("git ls-files", { cwd: ROOT, encoding: "utf8" })
    .split("\n")
    .filter(Boolean);
  if (excludePrefix) {
    files = files.filter((f) => !f.startsWith(excludePrefix));
    console.log(`排除 ${excludePrefix}* 后，剩 ${files.length} 个文件`);
  }
  console.log(`共 ${files.length} 个文件待推送`);

  // 2) 并发建 blob（3 并发 + 节流，避免触发二级限流；创建后引用其 SHA）
  const tree = [];
  let done = 0;
  let lastRequestAt = 0;
  const CONCURRENCY = 3;
  const MIN_INTERVAL = 350;

  async function rateLimited() {
    const wait = Math.max(0, lastRequestAt + MIN_INTERVAL - Date.now());
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastRequestAt = Date.now();
  }

  const worker = async (i) => {
    if (i >= files.length) return;
    const f = files[i];
    const full = path.join(ROOT, f);
    if (fs.existsSync(full)) {
      const buf = fs.readFileSync(full);
      const isBinary = buf.includes(0);
      await rateLimited();
      const blob = await api("POST", `/repos/${REPO}/git/blobs`, {
        content: isBinary ? buf.toString("base64") : buf.toString("utf8"),
        encoding: isBinary ? "base64" : "utf-8",
      });
      tree[i] = { path: f, mode: "100644", type: "blob", sha: blob.sha };
    }
    done++;
    if (done % 50 === 0 || done === files.length) console.log(`  blobs ${done}/${files.length}`);
    await worker(i + CONCURRENCY);
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, (_, k) => worker(k)));

  // 3) 递归分组构建 tree（单次 tree 太大易超时，按目录分层建子树）
  console.log("构建 tree（递归分组）...");
  async function buildTree(entries) {
    // entries: [{path, mode, type, sha}]
    if (entries.length <= 80) {
      const r = await api("POST", `/repos/${REPO}/git/trees`, { tree: entries });
      return r.sha;
    }
    // 按第一段路径分组
    const groups = new Map(); // dir -> [{rel, mode, type, sha}]
    const files = []; // 根级文件
    for (const e of entries) {
      const slash = e.path.indexOf("/");
      if (slash === -1) { files.push(e); continue; }
      const dir = e.path.slice(0, slash);
      const rel = e.path.slice(slash + 1);
      if (!groups.has(dir)) groups.set(dir, []);
      groups.get(dir).push({ ...e, path: rel });
    }
    // 递归建子树
    const treeEntries = [];
    for (const [dir, subEntries] of groups) {
      const subSha = await buildTree(subEntries);
      treeEntries.push({ path: dir, mode: "040000", type: "tree", sha: subSha });
    }
    treeEntries.push(...files);
    const r = await api("POST", `/repos/${REPO}/git/trees`, { tree: treeEntries });
    return r.sha;
  }
  const rootSha = await buildTree(tree.filter(Boolean));

  // 4) 建 commit
  console.log("创建 commit...");
  const commit = await api("POST", `/repos/${REPO}/git/commits`, {
    message: COMMIT_MSG,
    tree: rootSha,
    author: { name: "Jinba Auto", email: "jian5222@gmail.com" },
    committer: { name: "Jinba Auto", email: "jian5222@gmail.com" },
  });

  // 5) 更新/创建 ref
  console.log("更新 ref...");
  try {
    await api("PATCH", `/repos/${REPO}/git/refs/heads/${BRANCH}`, {
      sha: commit.sha,
      force: true,
    });
  } catch (e) {
    if (e.status === 404) {
      await api("POST", `/repos/${REPO}/git/refs`, {
        ref: `refs/heads/${BRANCH}`,
        sha: commit.sha,
      });
    } else {
      throw e;
    }
  }

  console.log(`✅ 推送完成: ${commit.sha}`);
  console.log(`仓库: https://github.com/${REPO}`);
  console.log(`Actions: https://github.com/${REPO}/actions`);
}

main().catch((e) => {
  console.error("Fatal:", e.message);
  process.exit(1);
});
