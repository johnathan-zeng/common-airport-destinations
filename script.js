async function compareDestinations() {
  const code1 = document.getElementById("code1").value.trim().toUpperCase();
  const code2 = document.getElementById("code2").value.trim().toUpperCase();
  const output = document.getElementById("output");
  output.innerHTML = "<p>Loading...</p>";

  if (code1.length !== 3 || code2.length !== 3) {
    output.innerHTML = `<p style="color:red;">Please enter valid 3-letter IATA codes.</p>`;
    return;
  }

  try {
    const url1 = `https://en.wikipedia.org/wiki/${code1}_International_Airport`;
    const url2 = `https://en.wikipedia.org/wiki/${code2}_International_Airport`;

    const [map1, map2] = await Promise.all([
      fetchDestinations(url1),
      fetchDestinations(url2)
    ]);

    const merged = mergeAirlines(map1, map2);

    let html = `<table border="1" style="border-collapse: collapse; width: 100%; margin-top: 1em;">
      <thead>
        <tr>
          <th>Airline</th>
          <th>Common Destinations</th>
          <th>Only at ${code1}</th>
          <th>Only at ${code2}</th>
        </tr>
      </thead>
      <tbody>`;

    merged.forEach(({ airline, common, only1, only2 }) => {
      html += `<tr>
        <td>${airline}</td>
        <td>${common.join(", ")}</td>
        <td>${only1.join(", ")}</td>
        <td>${only2.join(", ")}</td>
      </tr>`;
    });

    html += "</tbody></table>";

    output.innerHTML = html;
  } catch (err) {
    output.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
  }
}

async function fetchDestinations(url) {
  const response = await fetch(url);
  const html = await response.text();
  return parseHtml(html);
}

function parseHtml(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const tables = doc.querySelectorAll("table.wikitable");

  const airlineMap = new Map();
  const allDests = new Set();

  tables.forEach(table => {
    const rows = table.querySelectorAll("tr");
    rows.forEach(row => {
      const cols = row.querySelectorAll("td");
      if (cols.length < 2) return;
      const airline = cols[0].textContent.trim();
      const dests = cols[1].textContent
        .replace(/\[[^\]]*\]/g, "") // remove citations
        .split(",")
        .map(d => d.trim())
        .filter(Boolean);

      if (!airlineMap.has(airline)) airlineMap.set(airline, new Set());
      dests.forEach(d => {
        airlineMap.get(airline).add(d);
        allDests.add(d);
      });
    });
  });

  airlineMap.set("All Airlines", allDests);
  return airlineMap;
}

function mergeAirlines(map1, map2) {
  const airlines = new Set([...map1.keys(), ...map2.keys()]);
  const merged = [];

  airlines.forEach(airline => {
    const set1 = map1.get(airline) || new Set();
    const set2 = map2.get(airline) || new Set();

    const common = [...set1].filter(x => set2.has(x));
    const only1 = [...set1].filter(x => !set2.has(x));
    const only2 = [...set2].filter(x => !set1.has(x));

    merged.push({ airline, common, only1, only2 });
  });

  return merged;
}
