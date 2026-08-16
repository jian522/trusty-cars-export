// 从二手车之家(che168.com)为库存车辆抓取同车实拍照片。
//
// 流程：按品牌页(拼音URL)分页拉取车源 → 按车型+年份匹配 → 打开详情页
//       → 提取该车画廊图片(同一台车的6-9张) → 下载到 public/cars/{车辆id}/
// 之后运行 `node scripts/import-images.mjs` 生成图片映射。
//
// 用法：node scripts/scrape-che168.mjs [--limit N] [--resume]

import https from "node:https";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { TextDecoder } from "node:util";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "cars");

// ---------- WAF ----------
const WAF_PHASE1 = {
  __tst_status: (798389790 + 675874714 + 2055574560) + "#",
  EO_Bot_Ssid: "986644480",
};

function solveChallenge(html) {
  const wtkkn = html.match(/WTKkN:(\d+)/);
  const boydu = html.match(/bOYDu:(\d+)/);
  const wyecn = html.match(/wyeCN:(\d+)/);
  if (!wtkkn || !boydu || !wyecn) return null;
  const offset = html.match(/case"3":t=a\[[^\]]+\]\(t,(\d+)\);continue/);
  return {
    __tst_status: (parseInt(wtkkn[1]) + parseInt(boydu[1]) + parseInt(wyecn[1])) + "#",
    EO_Bot_Ssid: offset ? offset[1] : String(Math.floor(Math.random() * 999999999)),
  };
}

function rawFetch(url, cookieStr, retries) {
  return new Promise((resolve) => {
    const u = new URL(url);
    const mod = u.protocol === "https:" ? https : http;
    const opts = {
      host: u.hostname,
      path: u.pathname + u.search,
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "Cookie": cookieStr,
        "Referer": "https://www.che168.com/",
      },
    };
    let attempts = 0;
    function doFetch() {
      const req = mod.request(opts, (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const buf = Buffer.concat(chunks);
          let html;
          try { html = new TextDecoder("gbk", { fatal: false }).decode(buf); } catch { html = buf.toString("utf8"); }
          resolve({ html, bodyLength: html.length, statusCode: res.statusCode });
        });
      });
      req.on("error", () => {
        if (++attempts < retries) setTimeout(doFetch, 800);
        else resolve({ html: "", bodyLength: 0, statusCode: 0 });
      });
      req.setTimeout(20000, () => { req.destroy(); if (++attempts < retries) setTimeout(doFetch, 800); });
      req.end();
    }
    doFetch();
  });
}

async function fetchPage(url) {
  let cookieStr = Object.entries(WAF_PHASE1).map(([k, v]) => `${k}=${v}`).join("; ");
  let result = await rawFetch(url, cookieStr, 3);
  if (result.bodyLength < 2000 && result.html.includes("WTKkN")) {
    const solved = solveChallenge(result.html);
    if (solved) {
      cookieStr = Object.entries(solved).map(([k, v]) => `${k}=${v}`).join("; ");
      result = await rawFetch(url, cookieStr, 3);
    }
  }
  return result;
}

// ---------- 解析 ----------
function parseListings(html) {
  const listings = [];
  const blocks = html.split('<li class="cards-li');
  for (const block of blocks.slice(1)) {
    const infoid = block.match(/infoid="(\d+)"/);
    const dealerid = block.match(/dealerid="(\d+)"/);
    const carname = block.match(/carname="([^"]+)"/);
    if (infoid && dealerid) {
      listings.push({ infoid: infoid[1], dealerid: dealerid[1], carname: carname ? carname[1] : "" });
    }
  }
  return listings;
}

function extractImages(html) {
  const re = /\/\/2sc2\.autoimg\.cn\/escimg\/[^"'\s]+720x540[^"'\s]*/g;
  const m = html.match(re) || [];
  const unique = [...new Set(m)];
  return unique.map((u) => (u.startsWith("https:") ? u : "https:" + u));
}

function downloadImage(url, filepath) {
  return new Promise((resolve) => {
    const u = new URL(url);
    const req = https.request(
      {
        host: u.hostname,
        path: u.pathname + u.search,
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
          "Referer": "https://www.che168.com/",
        },
      },
      (res) => {
        if (res.statusCode !== 200) {
          res.resume();
          return resolve(false);
        }
        const file = fs.createWriteStream(filepath);
        res.pipe(file);
        file.on("finish", () => file.close(() => resolve(true)));
        file.on("error", () => resolve(false));
      }
    );
    req.on("error", () => resolve(false));
    req.setTimeout(30000, () => req.destroy());
    req.end();
  });
}

// ---------- 品牌→che168 拼音（已在品牌页导航中核实） ----------
const BRAND_SLUG = {
  丰田: "fengtian", 宝马: "baoma", 奔驰: "benchi", 雷克萨斯: "leikesasi",
  本田: "bentian", 奥迪: "aodi", 大众: "dazhong", 路虎: "luhu",
  比亚迪: "biyadi", 特斯拉: "tesila", 小鹏: "xiaopeng", 蔚来: "weilai",
  理想: "lixiangqiche", 广汽埃安: "aian", 吉利: "jili", 长安: "changan",
  哪吒: "nazhaqiche", 零跑: "lingpaoqiche", 凯迪拉克: "kaidilake",
  高合: "gaoheqiche", 腾势: "tengshi", 智己: "zhijiqiche", 小米: "xiaomiqiche",
  阿维塔: "aweita", 极越: "jiyue", 昊铂: "guangqihaobo",
  深蓝: "shenlanqiche", 岚图: "lantuqiche", 飞凡: null, // 无独立页，走通用列表回退
};

// 部分车型挂在独立子品牌页
const MODEL_SLUG_OVERRIDE = {
  极氪001: "jike", 极氪007: "jike",
  飞凡F7: null, 飞凡R7: null, // 无独立页 → 通用列表
  岚图FREE: "lantuqiche", 岚图追光: "lantuqiche",
  深蓝SL03: "shenlanqiche", 深蓝S7: "shenlanqiche",
};

// 部分车型 che168 用英文/拉丁名，补充匹配关键词
const MODEL_ALIAS = {
  极氪001: ["zeekr 001", "001"],
  极氪007: ["zeekr 007", "007"],
  飞凡F7: ["feifan f7", "rising f7", "f7"],
  飞凡R7: ["rising r7", "r7"],
  岚图FREE: ["voyah free", "free"],
  岚图追光: ["voyah passion", "passion", "追光"],
  深蓝SL03: ["deepal sl03", "深蓝sl03"],
  深蓝S7: ["deepal s7", "深蓝s7"],
  汉: ["han"],
  海豹: ["seal"],
  秦PLUS: ["qin plus", "qin"],
  宋PLUS: ["song plus", "song"],
  元PLUS: ["yuan plus", "yuan"],
  "唐DM-p": ["tang dm-p", "tang"],
  "Model 3": ["model 3"],
  "Model Y": ["model y"],
  "AION Y": ["aion y"],
  "AION V": ["aion v"],
  SU7: ["su7"],
  "HiPhi Y": ["hiphi y"],
  Z: ["hiphi z"],
  D9: ["d9"],
  N7: ["n7"],
  LS6: ["ls6"],
  L6: ["l6"],
  HT: ["hyper ht", "ht"],
  GT: ["hyper gt", "gt"],
  海狮: ["seal lion", "sea lion", "sealion", "海狮07", "hiace"],
  Fortuner: ["fortuner", "穿越者", "奔跑者"],
  凌放: ["harrier"],
  "ID.6": ["id.6"],
  LYRIQ: ["lyriq", "锐歌"],
  "i3": ["i3"],
  iX3: ["ix3"],
  EQE: ["eqe"],
  EQB: ["eqb"],
  "Q4 e-tron": ["q4 e-tron"],
};

// 变体排除：匹配到这些子串说明是另一款车，直接判负
const MODEL_EXCLUDE = {
  "e-tron": ["q2l", "q4", "sportback"],
  X5: ["x5 m"],
  "1系": ["进口"],
  P7: ["p7+"],
  ET5: ["et5t"],
  发现: ["发现运动"],
  UX: ["ux300e", "ux新能源"],
  思域: ["进口"],
  皇冠: ["sportcross"],
  海狮: ["海狮05", "海狮06"],
  "唐DM-p": ["dm-i", "dmi"],
  "Model 3": ["performance"],
  "Model Y": ["performance"],
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- 车辆清单（从 src/data/cars.ts 解析） ----------
function loadInventory() {
  const src = fs.readFileSync(path.join(ROOT, "src", "data", "cars.ts"), "utf8");
  const cars = [];
  const re = /id: '([^']+)', brand: '([^']+)', model: '([^']+)', year: (\d+)/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    cars.push({ id: m[1], brand: m[2], model: m[3], year: Number(m[4]) });
  }
  return cars;
}

function yearFromCarname(carname) {
  const m = carname.match(/(20\d{2})\s*款/);
  return m ? Number(m[1]) : null;
}

function scoreListing(carname, car, strictBrand = false) {
  const cn = carname.toLowerCase();

  // 变体排除：命中排除子串直接判负（如 X5 M、P7+、Q4 e-tron、发现运动）
  const exclusions = MODEL_EXCLUDE[car.model] || [];
  if (exclusions.some((x) => cn.includes(x))) return -999;

  let score = 0;

  // 品牌上下文：carname 里应包含品牌或其英文名
  const brandKw = car.brand;
  const brandEnMap = { 丰田: "toyota", 宝马: "bmw", 奔驰: "mercedes", 雷克萨斯: "lexus", 本田: "honda", 奥迪: "audi", 大众: "volkswagen|vw", 路虎: "land rover", 比亚迪: "byd", 特斯拉: "tesla", 小鹏: "xpeng", 蔚来: "nio", 理想: "li auto|ideal", 吉利: "geely|zeekr", 长安: "changan|deepal", 哪吒: "neta", 零跑: "leapmotor", 凯迪拉克: "cadillac", 高合: "hiphi", 腾势: "denza", 智己: "im motors|zhiji", 小米: "xiaomi", 阿维塔: "avatr", 极越: "jidu|jiyue", 昊铂: "hyper", 广汽埃安: "aion|埃安", 深蓝: "deepal", 岚图: "voyah" };
  const enKws = (brandEnMap[car.brand] || "").split("|");
  const brandMatched = cn.includes(brandKw.toLowerCase()) || enKws.some((k) => k && cn.includes(k));
  if (brandMatched) {
    score += 30;
  } else if (strictBrand) {
    // 通用列表严格模式：无品牌上下文不匹配（避免跨品牌误配）
    return 0;
  }

  // 车型关键词（含英文别名）
  const modelKw = car.model.toLowerCase();
  const aliases = MODEL_ALIAS[car.model] || [];
  const kwHit = cn.includes(modelKw) || aliases.some((a) => a && cn.includes(a));
  if (kwHit) {
    score += modelKw.length >= 2 ? 100 : 80;
    // 精确命中加分：车型关键词后紧跟 款/空格/数字/结尾（避免 X5 匹配 X5 M 等）
    const esc = modelKw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(`${esc}([款\\s\\d]|$)`).test(cn)) score += 30;
  }

  // 年份匹配
  const cy = yearFromCarname(carname);
  if (cy === car.year) score += 30;
  else if (cy && Math.abs(cy - car.year) === 1) score += 10;

  return score;
}

// 搜索最佳车源：baseUrl 为品牌页或通用列表页
async function findBestListing(car, baseUrl, maxPages, strictBrand = false) {
  let best = null;
  let emptyStreak = 0;
  for (let page = 1; page <= maxPages; page++) {
    const url = baseUrl.includes("?") ? `${baseUrl}&page=${page}` : `${baseUrl}?page=${page}`;
    let r = await fetchPage(url);
    // 空响应/过小页面视为 WAF 抖动，重试一次
    if (r.bodyLength < 5000) {
      await sleep(1500);
      r = await fetchPage(url);
    }
    const list = parseListings(r.html);
    if (list.length === 0) {
      emptyStreak++;
      if (emptyStreak >= 2) break; // 连续两页空则结束
      await sleep(800);
      continue;
    }
    emptyStreak = 0;
    for (const lis of list) {
      const s = scoreListing(lis.carname, car, strictBrand);
      if (s > 0 && (!best || s > best.score)) {
        best = { ...lis, score: s };
      }
    }
    await sleep(1200);
  }
  return best;
}

// ---------- 主流程 ----------
async function main() {
  const args = process.argv.slice(2);
  const limitIdx = args.indexOf("--limit");
  const limit = limitIdx >= 0 ? Number(args[limitIdx + 1]) : Infinity;
  const resume = args.includes("--resume");
  const onlyIdx = args.indexOf("--only");
  const only = onlyIdx >= 0 ? args[onlyIdx + 1].split(",") : null;

  const inventory = loadInventory();
  let targets = limit === Infinity ? inventory : inventory.slice(0, limit);
  if (only) {
    targets = inventory.filter((c) => only.includes(c.id));
    console.log(`--only 模式：处理 ${targets.length} 台: ${targets.map((c) => c.id).join(",")}`);
  }
  console.log(`库存 ${inventory.length} 台，本次处理 ${targets.length} 台`);

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const report = { ok: [], skip: [], fail: [] };

  for (const [i, car] of targets.entries()) {
    const carDir = path.join(OUT_DIR, car.id);
    const existing = fs.existsSync(carDir) ? fs.readdirSync(carDir).filter((f) => f.endsWith(".jpg")).length : 0;
    if (resume && existing >= 6) {
      report.skip.push(car.id);
      console.log(`[${i + 1}/${targets.length}] ${car.id} ${car.brand}${car.model} 已有 ${existing} 张，跳过`);
      continue;
    }

    const slug = MODEL_SLUG_OVERRIDE[car.model] !== undefined ? MODEL_SLUG_OVERRIDE[car.model] : BRAND_SLUG[car.brand];

    // 1) 品牌页搜索（最多 12 页）
    let best = null;
    if (slug) {
      best = await findBestListing(car, `https://www.che168.com/china/${slug}/`, 12);
    }

    // 2) 品牌页未找到 → 通用列表兜底（严格品牌过滤，最多 30 页）
    if (!best || best.score < 80) {
      best = await findBestListing(car, "https://www.che168.com/china/list/", 30, true);
    }

    if (!best || best.score < 80) {
      report.fail.push(car.id);
      console.log(`[${i + 1}/${targets.length}] ${car.id} ${car.brand}${car.model}: 未找到匹配车源 (best=${best ? best.score : "无"})`);
      await sleep(300);
      continue;
    }

    // 2) 详情页提取图片
    const detailUrl = `https://www.che168.com/dealer/${best.dealerid}/${best.infoid}.html`;
    const rd = await fetchPage(detailUrl);
    const images = extractImages(rd.html);
    await sleep(300);

    if (images.length < 6) {
      report.fail.push(car.id);
      console.log(`[${i + 1}/${targets.length}] ${car.id} ${car.brand}${car.model}: 匹配到 ${best.carname.slice(0, 25)} 但图片不足(${images.length})`);
      continue;
    }

    // 3) 下载 6-9 张
    fs.mkdirSync(carDir, { recursive: true });
    const count = Math.min(images.length, 9);
    let downloaded = 0;
    for (let k = 0; k < count; k++) {
      const fname = path.join(carDir, `${k + 1}.jpg`);
      if (fs.existsSync(fname)) { downloaded++; continue; }
      const ok = await downloadImage(images[k], fname);
      if (ok) {
        downloaded++;
        const size = fs.statSync(fname).size;
        if (size < 5000) { fs.unlinkSync(fname); downloaded--; }
      }
      await sleep(300);
    }

    if (downloaded >= 6) {
      report.ok.push(car.id);
      console.log(`[${i + 1}/${targets.length}] ✅ ${car.id} ${car.brand}${car.model} → ${best.carname.slice(0, 25)} | ${downloaded}张`);
    } else {
      report.fail.push(car.id);
      console.log(`[${i + 1}/${targets.length}] ❌ ${car.id} ${car.brand}${car.model} 仅下载 ${downloaded} 张`);
    }
  }

  console.log(`\n完成：成功 ${report.ok.length}，跳过 ${report.skip.length}，失败 ${report.fail.length}`);
  if (report.fail.length) console.log(`失败列表: ${report.fail.join(", ")}`);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
