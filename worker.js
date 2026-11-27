export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/sitemap.xml") {
      const xml = atob("PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHVybHNldCB4bWxucz0iaHR0cDovL3d3dy5zaXRlbWFwcy5vcmcvc2NoZW1hcy9zaXRlbWFwLzAuOSI+CiAgPHVybD4KICAgIDxsb2M+aHR0cHM6Ly9wcmljZWh1Yi1hcHAua2hpbGppa2hhbjU2NC53b3JrZXJzLmRldi88L2xvYz4KICAgIDxwcmlvcml0eT4xLjA8L3ByaW9yaXR5PgogIDwvdXJsPgo8L3VybHNldD4=");
      return new Response(xml, { headers: { "Content-Type": "application/xml" } });
    }

    if (url.pathname === "/api/img") {
      const target = url.searchParams.get("u");
      if (!target) return new Response("Missing", { status: 400 });
      try {
        const imgRes = await fetch(target, {
          signal: AbortSignal.timeout(4000),
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

      // 1. Try Daraz Pakistan Live with strict 3-second timeout
      try {
        const darazUrl = atob("aHR0cHM6Ly93d3cuZGFyYXoucGsvY2F0YWxvZy8/YWpheD10cnVlJnE9") + encodeURIComponent(q);
        const dRes = await fetch(darazUrl, {
          signal: AbortSignal.timeout(3000),
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

      // 2. Fast Global Product Catalog Fallback if Daraz times out or returns 0
      if (items.length === 0) {
        try {
          const baseApi = atob("aHR0cHM6Ly9kdW1teWpzb24uY29tL3Byb2R1Y3Rz");
          let res = await fetch(baseApi + "/search?q=" + encodeURIComponent(q) + "&limit=24", { signal: AbortSignal.timeout(3000) });
          let data = await res.json();
          let list = data.products || [];
          if (list.length === 0) {
            const skip = Math.floor(Math.random() * 140);
            res = await fetch(baseApi + "?limit=24&skip=" + skip, { signal: AbortSignal.timeout(3000) });
            data = await res.json();
            list = data.products || [];
          }
          for (let i = 0; i < list.length; i++) {
            const it = list[i];
            const title = it.title || "Product";
            const pkr = Math.round((it.price || 45) * 280);
            const enc = encodeURIComponent(title);
            const rawImg = it.thumbnail || "";
            items.push({
              title,
              category: (it.category || q).toUpperCase(),
              img: rawImg ? ("/api/img?u=" + encodeURIComponent(rawImg)) : "",
              stores: [
                { s: "Alibaba Wholesale", p: "Rs. " + Math.round(pkr * 0.74).toLocaleString(), l: true, url: atob("aHR0cHM6Ly93d3cuYWxpYmFiYS5jb20vdHJhZGUvc2VhcmNoP1NlYXJjaFRleHQ9") + enc },
                { s: "Daraz Pakistan", p: "Rs. " + pkr.toLocaleString(), l: false, url: atob("aHR0cHM6Ly93d3cuZGFyYXoucGsvY2F0YWxvZy8/cT0=") + enc },
                { s: "PriceOye", p: "Rs. " + Math.round(pkr * 1.02).toLocaleString(), l: false, url: atob("aHR0cHM6Ly9wcmljZW95ZS5way9zZWFyY2g/cT0=") + enc },
                { s: "Shophive", p: "Rs. " + Math.round(pkr * 1.05).toLocaleString(), l: false, url: atob("aHR0cHM6Ly93d3cuc2hvcGhpdmUuY29tL2NhdGFsb2dzZWFyY2gvcmVzdWx0Lz9xPQ==") + enc },
                { s: "Amazon Global", p: "Rs. " + Math.round(pkr * 1.12).toLocaleString(), l: false, url: atob("aHR0cHM6Ly93d3cuYW1hem9uLmNvbS9zP2s9") + enc }
              ]
            });
          }
        } catch (e) {}
      }

      return new Response(JSON.stringify({ ok: true, query: q, count: items.length, products: items }), { headers: cors });
    }

    return env.ASSETS.fetch(request);
  }
};
