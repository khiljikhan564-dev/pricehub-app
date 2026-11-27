export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/live") {
      const q = (url.searchParams.get("q") || "mobile").trim();
      const cors = {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      };
      const items = [];
      try {
        const target = atob("aHR0cHM6Ly9wcmljZW95ZS5way9zZWFyY2g/cT0=") + encodeURIComponent(q);
        const res = await fetch(target, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
          }
        });
        const html = await res.text();
        const blocks = html.split("productBox");
        for (let i = 1; i < blocks.length && items.length < 24; i++) {
          const b = blocks[i];
          const titleM = b.match(/p-title[^>]*>([^<]+)</i) || b.match(/alt="([^"]+)"/i);
          const priceM = b.match(/Rs\.?\s*([\d,]+)/i);
          const imgM = b.match(/data-src="([^"]+)"/i) || b.match(/src="(https:[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/i);
          const hrefM = b.match(/href="([^"]+)"/i);
          if (titleM && priceM) {
            const title = titleM.trim();
            const pkr = parseInt(priceM.replace(/,/g, ""), 10);
            if (pkr > 150) {
              let link = hrefM ? hrefM : target;
              if (link.startsWith("/")) link = atob("aHR0cHM6Ly9wcmljZW95ZS5waw==") + link;
              const enc = encodeURIComponent(title);
              items.push({
                title,
                category: q.toUpperCase(),
                img: imgM ? imgM : "",
                stores: [
                  { s: "PriceOye (Live)", p: "Rs. " + pkr.toLocaleString(), l: true, url: link },
                  { s: "Daraz Pakistan", p: "Rs. " + Math.round(pkr * 1.03).toLocaleString(), l: false, url: atob("aHR0cHM6Ly93d3cuZGFyYXoucGsvY2F0YWxvZy8/cT0=") + enc },
                  { s: "Shophive", p: "Rs. " + Math.round(pkr * 1.05).toLocaleString(), l: false, url: atob("aHR0cHM6Ly93d3cuc2hvcGhpdmUuY29tL2NhdGFsb2dzZWFyY2gvcmVzdWx0Lz9xPQ==") + enc },
                  { s: "Alibaba Wholesale", p: "Rs. " + Math.round(pkr * 0.76).toLocaleString(), l: false, url: atob("aHR0cHM6Ly93d3cuYWxpYmFiYS5jb20vdHJhZGUvc2VhcmNoP1NlYXJjaFRleHQ9") + enc },
                  { s: "Amazon Global", p: "Rs. " + Math.round(pkr * 1.12).toLocaleString(), l: false, url: atob("aHR0cHM6Ly93d3cuYW1hem9uLmNvbS9zP2s9") + enc }
                ]
              });
            }
          }
        }
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: e.message, products: [] }), { headers: cors });
      }
      return new Response(JSON.stringify({ ok: true, query: q, count: items.length, products: items }), { headers: cors });
    }

    return env.ASSETS.fetch(request);
  }
};
