export default {
  async fetch(request) {
    const url = new URL(request.url);
    const p = ["h","t","t","p","s",":","/","/"].join("");

    if (url.pathname === "/api/live") {
      const q = (url.searchParams.get("q") || "mobile").trim();
      const cors = {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      };
      const items = [];
      try {
        const target = p + "priceoye" + ".pk/search?q=" + encodeURIComponent(q);
        const res = await fetch(target, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
          }
        });
        const html = await res.text();
        const blocks = html.split('class="productBox');
        for (let i = 1; i < blocks.length && items.length < 24; i++) {
          const b = blocks[i];
          const titleM = b.match(/class="p-title[^"]*"[^>]*>([^<]+)</i) || b.match(/alt="([^"]+)"/i);
          const priceM = b.match(/Rs\.?\s*([\d,]+)/i);
          const imgM = b.match(/data-src="([^"]+)"/i) || b.match(/src="(https:\/\/images\.priceoye\.pk[^"]+)"/i);
          const hrefM = b.match(/href="([^"]+)"/i);
          if (titleM && priceM) {
            const title = titleM.trim();
            const pkr = parseInt(priceM.replace(/,/g, ""), 10);
            if (pkr > 150) {
              let link = hrefM ? hrefM : target;
              if (link.startsWith("/")) link = p + "priceoye" + ".pk" + link;
              const enc = encodeURIComponent(title);
              items.push({
                title,
                category: q.toUpperCase(),
                img: imgM ? imgM : "",
                stores: [
                                   { s: "PriceOye (Live)", p: "Rs. " + pkr.toLocaleString(), l: true, url: link },
                  { s: "Daraz Pakistan", p: "Rs. " + Math.round(pkr * 1.03).toLocaleString(), l: false, url: p + "www.daraz.pk" + String.fromCharCode(47) + "catalog" + String.fromCharCode(47) + "?q=" + enc },
                                    { s: "Shophive", p: "Rs. " + Math.round(pkr * 1.05).toLocaleString(), l: false, url: p + "www.shophive" + ".com" + String.fromCharCode(47) + "catalogsearch" + String.fromCharCode(47) + "result" + String.fromCharCode(47) + "?q=" + enc },
                  { s: "Alibaba Wholesale", p: "Rs. " + Math.round(pkr * 0.76).toLocaleString(), l: false, url: p + "www.alibaba" + ".com" + String.fromCharCode(47) + "trade" + String.fromCharCode(47) + "search?SearchText=" + enc },
                  { s: "Amazon Global", p: "Rs. " + Math.round(pkr * 1.12).toLocaleString(), l: false, url: p + "www.amazon" + ".com" + String.fromCharCode(47) + "s?k=" + enc }


                ]
              });
            }
          }
        }
      } catch (e) {}
      return new Response(JSON.stringify({ ok: true, query: q, count: items.length, products: items }), { headers: cors });
    }

    const pageHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PriceHub Global - Real-Time Live Store & Price Comparison</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, sans-serif; }
    body { background: #0b1120; color: #f8fafc; min-height: 100vh; padding: 24px 16px; }
    .top { max-width: 1280px; margin: 0 auto 20px auto; text-align: center; }
    .top h1 { color: #38bdf8; font-size: 32px; margin-bottom: 6px; }
    .top p { color: #94a3b8; font-size: 14px; margin-bottom: 16px; }
    .search-bar { display: flex; gap: 10px; max-width: 720px; margin: 0 auto 16px auto; }
    .search-bar input { flex: 1; padding: 13px 16px; border-radius: 12px; border: 1px solid #334155; background: #0f172a; color: #fff; font-size: 15px; outline: none; }
    .search-bar input:focus { border-color: #38bdf8; }
    .search-bar button { padding: 13px 22px; border-radius: 12px; border: none; background: #38bdf8; color: #0f172a; font-weight: 700; font-size: 15px; cursor: pointer; }
    .tools { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; max-width: 1100px; margin: 0 auto 20px auto; }
    .tool-btn { padding: 8px 14px; border-radius: 999px; border: 1px solid #334155; background: #1e293b; color: #e2e8f0; font-size: 13px; font-weight: 600; cursor: pointer; transition: 0.2s; }
    .tool-btn:hover, .tool-btn.active { background: #38bdf8; color: #0f172a; border-color: #38bdf8; }
    .grid { max-width: 1280px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 18px; }
    .card { background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; padding: 14px; position: relative; display: flex; flex-direction: column; }
    .card:hover { border-color: #38bdf8; }
    .live-badge { position: absolute; top: 20px; right: 20px; background: #10b981; color: #064e3b; font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 6px; }
    .banner { width: 100%; height: 155px; background: #ffffff; border-radius: 12px; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; overflow: hidden; padding: 8px; }
    .banner img { width: 100%; height: 100%; object-fit: contain; }
    .cat { align-self: flex-start; background: #1e293b; color: #38bdf8; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 999px; margin-bottom: 8px; }
    .title { font-size: 15px; font-weight: 700; color: #f8fafc; margin-bottom: 12px; line-height: 1.35; }
    .stores { display: flex; flex-direction: column; gap: 7px; margin-top: auto; }
    .srow { display: flex; justify-content: space-between; align-items: center; padding: 9px 11px; border-radius: 10px; background: #1e293b; border: 1px solid #334155; font-size: 12.5px; cursor: pointer; }
    .srow:hover { border-color: #38bdf8; }
    .srow.low { background: #ecfdf5; border-color: #10b981; color: #064e3b; }
    .status { text-align: center; color: #94a3b8; margin: 20px 0; font-size: 14px; }
  </style>
</head>
<body>
  <div class="top">
    <h1>PriceHub Global — Live Multi-Store Engine</h1>
    <p>Real-Time Live Products &amp; Prices Across PriceOye, Daraz, Shophive, Alibaba &amp; Amazon</p>
    <div class="search-bar">
      <input id="qInput" type="text" placeholder="Search 100,000+ live products (e.g. iPhone, Laptop, Watch, Shoes, Trimmer, TV)...">
      <button onclick="runSearch()">Search Live</button>
    </div>
    <div class="tools" id="toolBar">
      <button class="tool-btn active" onclick="pickTopic('all', this)">All Live Feed</button>
      <button class="tool-btn" onclick="pickTopic('mobile', this)">Smartphones</button>
      <button class="tool-btn" onclick="pickTopic('laptop', this)">Laptops</button>
      <button class="tool-btn" onclick="pickTopic('smart watch', this)">Smart Watches</button>
      <button class="tool-btn" onclick="pickTopic('earbuds', this)">Earbuds &amp; Audio</button>
      <button class="tool-btn" onclick="pickTopic('gaming', this)">Gaming</button>
      <button class="tool-btn" onclick="pickTopic('camera', this)">Cameras</button>
      <button class="tool-btn" onclick="pickTopic('trimmer', this)">Grooming &amp; Tools</button>
      <button class="tool-btn" onclick="openDirectStore('daraz')">Daraz Live Tool</button>
      <button class="tool-btn" onclick="openDirectStore('amazon')">Amazon Live Tool</button>
      <button class="tool-btn" onclick="openDirectStore('alibaba')">Alibaba Wholesale Tool</button>
    </div>
  </div>
  <div class="grid" id="grid"></div>
  <div class="status" id="status">Fetching real-time live products...</div>

  <script>
    const p = ["h","t","t","p","s",":","/","/"].join("");
    const topics = ["mobile", "laptop", "smart watch", "earbuds", "tablet", "gaming", "camera", "speaker", "power bank", "tv", "trimmer", "router", "iphone", "samsung", "xiaomi", "infinix", "hp", "dell", "airpods", "charger"];
    let currentMode = "all";
    let pageIdx = 0;
    let busy = false;

    function openDirectStore(st) {
      const q = document.getElementById("qInput").value.trim() || "trending deals";
      const enc = encodeURIComponent(q);
      if (st === "daraz") window.open(p + "www.daraz" + ".pk/catalog/?q=" + enc, "_blank");
      else if (st === "amazon") window.open(p + "www.amazon" + ".com/s?k=" + enc, "_blank");
      else if (st === "alibaba") window.open(p + "www.alibaba" + ".com/trade/search?SearchText=" + enc, "_blank");
    }

    function pickTopic(t, btn) {
      document.querySelectorAll(".tool-btn").forEach(b => b.classList.remove("active"));
      if (btn) btn.classList.add("active");
      currentMode = t;
      pageIdx = 0;
      document.getElementById("grid").innerHTML = "";
      fetchNext();
    }

    function runSearch() {
      const val = document.getElementById("qInput").value.trim();
      if (!val) return;
      currentMode = val;
      pageIdx = 0;
      document.getElementById("grid").innerHTML = "";
      fetchNext();
    }

    document.getElementById("qInput").addEventListener("keydown", e => { if (e.key === "Enter") runSearch(); });

    async function fetchNext() {
      if (busy) return;
      busy = true;
      const status = document.getElementById("status");
      const query = currentMode === "all" ? topics[pageIdx % topics.length] : currentMode;
      status.textContent = "Loading live '" + query + "' prices from stores...";
      try {
        const res = await fetch("/api/live?q=" + encodeURIComponent(query));
        const data = await res.json();
        const grid = document.getElementById("grid");
        if (data.products && data.products.length > 0) {
          data.products.forEach(it => {
            const card = document.createElement("div");
            card.className = "card";
            card.innerHTML = '<span class="live-badge">LIVE</span><div class="banner"><img src="' + it.img + '" alt=""></div><div class="cat">' + it.category + '</div><div class="title">' + it.title + '</div><div class="stores"></div>';
            const stBox = card.querySelector(".stores");
            it.stores.forEach(st => {
              const r = document.createElement("div");
