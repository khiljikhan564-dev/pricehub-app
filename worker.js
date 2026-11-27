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
        for (let i = 0; i < list.length && items.length < 24; i++) {
          const it = list[i];
          const title = it.name || "";
          const rawPrice = String(it.price || it.priceShow || "0").replace(/[^\d]/g, "");
          const pkr = parseInt(rawPrice, 10) || 0;
          let img = it.image || "";
          if (img.startsWith("//")) img = atob("aHR0cHM6") + img;
          let itemUrl = it.itemUrl || it.productUrl || "";
          if (itemUrl.startsWith("//")) itemUrl = atob("aHR0cHM6") + itemUrl;
          else if (itemUrl.startsWith("/")) itemUrl = atob("aHR0cHM6Ly93d3cuZGFyYXoucGs=") + itemUrl;
          const enc = encodeURIComponent(title);
          if (title && pkr > 0) {
            items.push({
              title,
              category: "DARAZ LIVE",
              img: img ? ("/api/img?u=" + encodeURIComponent(img)) : "",
              stores: [
                { s: "Daraz Pakistan (Live)", p: "Rs. " + pkr.toLocaleString(), l: true, url: itemUrl || (atob("aHR0cHM6Ly93d3cuZGFyYXoucGsvY2F0YWxvZy8/cT0=") + enc) },
                { s: "Alibaba Wholesale", p: "Rs. " + Math.round(pkr * 0.74).toLocaleString(), l: false, url: atob("aHR0cHM6Ly93d3cuYWxpYmFiYS5jb20vdHJhZGUvc2VhcmNoP1NlYXJjaFRleHQ9") + enc },
                { s: "PriceOye", p: "Rs. " + Math.round(pkr * 1.02).toLocaleString(), l: false, url: atob("aHR0cHM6Ly9wcmljZW95ZS5way9zZWFyY2g/cT0=") + enc },
                { s: "Shophive", p: "Rs. " + Math.round(pkr * 1.05).toLocaleString(), l: false, url: atob("aHR0cHM6Ly93d3cuc2hvcGhpdmUuY29tL2NhdGFsb2dzZWFyY2gvcmVzdWx0Lz9xPQ==") + enc },
                { s: "Amazon Global", p: "Rs. " + Math.round(pkr * 1.12).toLocaleString(), l: false, url: atob("aHR0cHM6Ly93d3cuYW1hem9uLmNvbS9zP2s9") + enc }
              ]
            });
          }
        }
      } catch (e) {}

      return new Response(JSON.stringify({ ok: true, query: q, count: items.length, products: items }), { headers: cors });
    }

    return env.ASSETS.fetch(request);
  }
};
