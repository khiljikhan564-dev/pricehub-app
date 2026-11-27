export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/img") {
      const target = url.searchParams.get("u");
      if (!target) return new Response("Missing", { status: 400 });
      try {
        const imgRes = await fetch(target, {
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
        });
        return new Response(imgRes.body, {
          headers: {
            "Content-Type": imgRes.headers.get("Content-Type") || "image/jpeg",
            "Cache-Control": "public, max-age=86400",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (e) {
        return new Response("Err", { status: 502 });
      }
    }

    if (url.pathname === "/api/live") {
      const q = (url.searchParams.get("q") || "mobile").trim();
      const cors = {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      };
      const items = [];
      const errors = [];

      // 1. REAL LIVE DARAZ PAKISTAN CATALOG API
      try {
        const darazUrl = atob("aHR0cHM6Ly93d3cuZGFyYXoucGsvY2F0YWxvZy8/YWpheD10cnVlJnE9") + encodeURIComponent(q);
        const dRes = await fetch(darazUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
            "Accept": "application/json, text/plain, */*",
            "Referer": atob("aHR0cHM6Ly93d3cuZGFyYXoucGsv")
          }
        });
        const dData = await dRes.json();
        const list = (dData.mods && dData.mods.listItems) ? dData.mods.listItems : [];
        for (let i = 0; i < list.length && items.length < 20; i++) {
          const it = list[i];
          const title = it.name || "";
          const rawPrice = String(it.price || it.priceShow || "0").replace(/[^\d]/g, "");
          const pkr = parseInt(rawPrice, 10) || 0;
          let img = it.image || "";
          if (img.startsWith("//")) img = "https:" + img;
          let itemUrl = it.itemUrl || it.productUrl || "";
          if (itemUrl.startsWith("//")) itemUrl = "https:" + itemUrl;
          else if (itemUrl.startsWith("/")) itemUrl = atob("aHR0cHM6Ly93d3cuZGFyYXoucGs=") + itemUrl;
          const enc = encodeURIComponent(title);
          if (title && pkr > 0) {
            items.push({
              title,
              category: "DARAZ LIVE",
              img: img ? ("/api/img?u=" + encodeURIComponent(img)) : "",
              stores: [
                { s: "Daraz Pakistan (Live)", p: "Rs. " + pkr.toLocaleString(), l: true, url: itemUrl || (atob("aHR0cHM6Ly93d3cuZGFyYXoucGsvY2F0YWxvZy8/cT0=") + enc) },
                { s: "PriceOye Check", p: "Compare Live ↗", l: false, url: atob("aHR0cHM6Ly9wcmljZW95ZS5way9zZWFyY2g/cT0=") + enc },
                { s: "Alibaba Wholesale", p: "Source Bulk ↗", l: false, url: atob("aHR0cHM6Ly93d3cuYWxpYmFiYS5jb20vdHJhZGUvc2VhcmNoP1NlYXJjaFRleHQ9") + enc },
                { s: "Amazon Global", p: "Check Global ↗", l: false, url: atob("aHR0cHM6Ly93d3cuYW1hem9uLmNvbS9zP2s9") + enc }
              ]
            });
          }
        }
      } catch (e) {
        errors.push("Daraz: " + e.message);
      }

      // 2. REAL LIVE SHOPHIVE / PAKISTANI TECH STORE API
      try {
        const shUrl = atob("aHR0cHM6Ly93d3cuc2hvcGhpdmUuY29tL3NlYXJjaC9zdWdnZXN0Lmpzb24/cT0=") + encodeURIComponent(q) + "&resources[type]=product&resources[limit]=12";
        const sRes = await fetch(shUrl, {
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
        });
        const sData = await sRes.json();
        const sList = (sData.resources && sData.resources.results && sData.resources.results.products) ? sData.resources.results.products : [];
        for (let i = 0; i < sList.length; i++) {
          const it = sList[i];
          const title = it.title || "";
          const pkr = Math.round(parseFloat(it.price || "0"));
          let img = it.image || "";
          if (img.startsWith("//")) img = "https:" + img;
          const link = it.url ? (atob("aHR0cHM6Ly93d3cuc2hvcGhpdmUuY29t") + it.url) : "";
          const enc = encodeURIComponent(title);
          if (title && pkr > 0) {
            items.push({
              title,
              category: "SHOPHIVE LIVE",
              img: img ? ("/api/img?u=" + encodeURIComponent(img)) : "",
              stores: [
                { s: "Shophive (Live)", p: "Rs. " + pkr.toLocaleString(), l: true, url: link },
                { s: "Daraz Pakistan", p: "Compare Live ↗", l: false, url: atob("aHR0cHM6Ly93d3cuZGFyYXoucGsvY2F0YWxvZy8/cT0=") + enc },
                { s: "PriceOye", p: "Compare Live ↗", l: false, url: atob("aHR0cHM6Ly9wcmljZW95ZS5way9zZWFyY2g/cT0=") + enc },
                { s: "Amazon Global", p: "Check Global ↗", l: false, url: atob("aHR0cHM6Ly93d3cuYW1hem9uLmNvbS9zP2s9") + enc }
              ]
            });
          }
        }
      } catch (e) {
        errors.push("Shophive: " + e.message);
      }

      return new Response(JSON.stringify({ ok: true, query: q, count: items.length, errors, products: items }), { headers: cors });
    }

    return env.ASSETS.fetch(request);
  }
};
