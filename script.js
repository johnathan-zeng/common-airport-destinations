function parseHtml(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const tables = doc.querySelectorAll("table.wikitable");

  const airlineMap = new Map();
  const allDests = new Set();

  tables.forEach(table => {
    const caption = table.querySelector("caption");
    const captionText = caption ? caption.innerText.toLowerCase() : "";

    // Only allow tables with captions that explicitly say "passenger"
    if (!caption || !captionText.includes("passenger")) return;

    const rows = table.querySelectorAll("tr");
    rows.forEach(row => {
      const cols = row.querySelectorAll("td");
      if (cols.length < 2) return;

      const airline = cols[0].innerText.trim();
      if (!airline || /^\d+$/.test(airline)) return; // skip rows like '2002'

      let destText = cols[1].innerText;

      // Clean up citation markers like [21]
      destText = destText.replace(/\[[^\]]*\]/g, '').replace(/\s+/g, ' ').trim();

      const dests = destText
        .split(/,|\n|;/)
        .map(d => d.trim())
        .filter(Boolean);

      if (!airlineMap.has(airline)) airlineMap.set(airline, new Set());
      dests.forEach(d => {
        airlineMap.get(airline).add(d);
        allDests.add(d);
      });
    });
  });

  airlineMap.set("__ALL__", allDests);
  return airlineMap;
}
