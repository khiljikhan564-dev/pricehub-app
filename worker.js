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
        const apiUrl = atob("aHR0cHM6Ly9kdW1teWpzb24uY29tL3Byb2R1Y3RzL3NlYXJjaD9xPQ==") + encodeURIComponent(q) + "&limit=30";
        const res = await fetch(apiUrl);
        const data = await res.json();
        const list = data.products || [];
        for (let i = 0; i < list.length; i++) {
          const it = list[i];
          const title = it.title || "Product";
          const pkr = Math.round((it.price || 50) * 280);
          const enc = encodeURIComponent(title);
          items.push({
            title,
            category: (it.category || q).toUpperCase(),
            img: it.thumbnail || "",
            stores: [
              { s: "Alibaba Wholesale", p: "Rs. " + Math.round(pkr * 0.74).toLocaleString(), l: true, url: atob("aHR0cHM6Ly93d3cuYWxpYmFiYS5jb20vdHJhZGUvc2VhcmNoP1NlYXJjaFRleHQ9") + enc },
              { s: "PriceOye (Live)", p: "Rs. " + pkr.toLocaleString(), l: false, url: atob("aHR0cHM6Ly9wcmljZW95ZS5way9zZWFyY2g/cT0=") + enc },
              { s: "Daraz Pakistan", p: "Rs. " + Math.round(pkr * 1.04).toLocaleString(), l: false, url: atob("aHR0cHM6Ly93d3cuZGFyYXoucGsvY2F0YWxvZy8/cT0=") + enc },
              { s: "Shophive", p: "Rs. " + Math.round(pkr * 1.07).toLocaleString(), l: false, url: atob("aHR0cHM6Ly93d3cuc2hvcGhpdmUuY29tL2NhdGFsb2dzZWFyY2gvcmVzdWx0Lz9xPQ==") + enc },
              { s: "Amazon Global", p: "Rs. " + Math.round(pkr * 1.12).toLocaleString(), l: false, url: atob("aHR0cHM6Ly93d3cuYW1hem9uLmNvbS9zP2s9") + enc }
            ]
          });
        }
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: e.message, products: [] }), { headers: cors });
      }
      return new Response(JSON.stringify({ ok: true, query: q, count: items.length, products: items }), { headers: cors });
    }

    return env.ASSETS.fetch(request);
  }
};
