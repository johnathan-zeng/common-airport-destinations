async function getWikipediaUrl(code) {
  const query = `airport ${code}`;
  const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;
  const res = await fetch(apiUrl);
  const json = await res.json();
  const firstResult = json.query.search[0];
  if (!firstResult) throw new Error(`No Wikipedia page found for code: ${code}`);
  return `https://en.wikipedia.org/wiki/${encodeURIComponent(firstResult.title)}`;
}

async function fetchDestinations(url) {
  const proxyUrl = "https://api.allorigins.win/get?url=" + encodeURIComponent(url);
  const response = await fetch(proxyUrl);
  if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
  const html = await response.text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const tables = doc.querySelectorAll("table.wikitable");

  const airlineMap = new Map();
  const allDests = new Set();

  tables.forEach(table => {
    const rows = table.querySelectorAll("tr");
    rows.forEach((row, idx) => {
      if (idx === 0) return;
      const cols = row.querySelectorAll("td");
      if (cols.length < 2) return;

      const airline = cols[0].innerText.trim();
      const destText = cols[1].innerText.trim();
      const dests = destText.split(/\n|,|;/).map(d => d.trim()).filter(Boolean);

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

function mergeAirlines(map1, map2) {
  const airlineSet = new Set([...map1.keys(), ...map2.keys()]);
  const result = [];

  airlineSet.forEach(airline => {
    const d1 = map1.get(airline) || new Set();
    const d2 = map2.get(airline) || new Set();

    const common = [...d1].filter(x => d2.has(x));
    const only1 = [...d1].filter(x => !d2.has(x));
    const only2 = [...d2].filter(x => !d1.has(x));

    if (common.length || only1.length || only2.length) {
      result.push({
        airline: airline === "__ALL__" ? "All Airlines" : airline,
        common: common.sort(),
        only1: only1.sort(),
        only2: only2.sort()
      });
    }
  });

  return result;
}

async function compareDestinations() {
  const code1 = document.getElementById("code1").value.trim().toUpperCase();
  const code2 = document.getElementById("code2").value.trim().toUpperCase();
  const output = document.getElementById("output");
  output.innerHTML = "<p>Loading...</p>";

  try {
    const [url1, url2] = await Promise.all([
      getWikipediaUrl(code1),
      getWikipediaUrl(code2)
    ]);

    const [map1, map2] = await Promise.all([
      fetchDestinations(url1),
      fetchDestinations(url2)
    ]);

    const merged = mergeAirlines(map1, map2);

    let html = `<table><tr>
      <th>Airline</th>
      <th>Common Destinations</th>
      <th>Only at ${code1}</th>
      <th>Only at ${code2}</th>
    </tr>`;

    merged.forEach(({ airline, common, only1, only2 }) => {
      html += `<tr>
        <td>${airline}</td>
        <td>${common.join(", ") || "-"}</td>
        <td>${only1.join(", ") || "-"}</td>
        <td>${only2.join(", ") || "-"}</td>
      </tr>`;
    });

    html += `</table>`;
    output.innerHTML = html;
  } catch (err) {
    output.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
  }
}
