// che168 抓取可行性测试 v2：带 WAF challenge 处理
import https from "node:https";
import { TextDecoder } from "node:util";

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
    const opts = {
      host: u.hostname,
      path: u.pathname + u.search,
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "zh-CN,zh;q=0.9",
        "Cookie": cookieStr,
        "Referer": "https://www.che168.com/",
      },
    };
    let attempts = 0;
    function doFetch() {
      const req = https.request(opts, (res) => {
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
        if (++attempts < retries) setTimeout(doFetch, 1000);
        else resolve({ html: "", bodyLength: 0, statusCode: 0 });
      });
      req.setTimeout(20000, () => { req.destroy(); if (++attempts < retries) setTimeout(doFetch, 1000); });
      req.end();
    }
    doFetch();
  });
}

async function fetchPage(url, cookies) {
  let cookieStr = Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join("; ");
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

async function main() {
  for (const path of ["china/biyadi/", "china/fengtian/"]) {
    const url = `https://www.che168.com/${path}`;
    const r = await fetchPage(url, WAF_PHASE1);
    const list = parseListings(r.html);
    console.log(`\n=== ${path} status=${r.statusCode} len=${r.bodyLength} listings=${list.length} ===`);
    if (list.length === 0 && r.bodyLength < 5000) {
      console.log("RAW:", r.html.slice(0, 400).replace(/\s+/g, " "));
    }
    list.slice(0, 8).forEach((l) => console.log(`  ${l.infoid} | ${l.carname.slice(0, 30)}`));
  }

  // 详情页图片测试
  const r0 = await fetchPage("https://www.che168.com/china/fengtian/", WAF_PHASE1);
  const list0 = parseListings(r0.html);
  if (list0.length > 0) {
    const first = list0[0];
    const detailUrl = `https://www.che168.com/dealer/${first.dealerid}/${first.infoid}.html`;
    console.log(`\n=== 详情页: ${detailUrl} (${first.carname.slice(0, 30)}) ===`);
    const rd = await fetchPage(detailUrl, WAF_PHASE1);
    console.log(`status=${rd.statusCode} len=${rd.bodyLength}`);
    const imgs = extractImages(rd.html);
    console.log(`escimg 图片数: ${imgs.length}`);
    imgs.slice(0, 10).forEach((u, i) => console.log(`  ${i + 1}. ${u}`));
  }
}

main().catch((e) => console.error("Error:", e.message));
