// Get Wikipedia article URL for airport code
async function getWikipediaUrl(code) {
  const query = `airport ${code}`;
  const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;
  const res = await fetch(apiUrl);
  const json = await res.json();
  const firstResult = json.query.search[0];
  if (!firstResult) throw new Error(`No Wikipedia page found for code: ${code}`);
  return `https://en.wikipedia.org/wiki/${encodeURIComponent(firstResult.title)}`;
}

// Parse HTML content, extract airline and passenger destinations,
// stopping airline parsing in each table when airline names reset alphabetically
function parseHtml(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const tables = doc.querySelectorAll("table.wikitable");

  const airlineMap = new Map();
  const allDests = new Set();

  tables.forEach(table => {
    const rows = table.querySelectorAll("tr");

    let lastFirstChar = null;

    for (let i = 1; i < rows.length; i++) {  // skip header row
      const row = rows[i];
      const cols = row.querySelectorAll("td");
      if (cols.length < 2) continue;

      const airline = cols[0].innerText.trim();
      if (!airline) continue;

      // Alphabetical reset check: if airline first letter is less than last, break
      const firstChar = airline[0].toUpperCase();
      if (lastFirstChar && firstChar < lastFirstChar) {
        break; // stop reading more rows for this table to exclude cargo or later sections
      }
      lastFirstChar = firstChar;

      let destText = cols[1].innerText;

      // Remove bracketed citations before splitting
      destText = destText.replace(/\s*\[\d+\]\s*/g, ', ');

      const dests = destText
        .split(/\n|,|;/)
        .map(d => d.trim())
        .filter(Boolean);

      if (!airlineMap.has(airline)) airlineMap.set(airline, new Set());
      dests.forEach(d => {
        airlineMap.get(airline).add(d);
        allDests.add(d);
      });
    }
  });

  airlineMap.set("__ALL__", allDests);
  return airlineMap;
}

// Fetch page HTML using multiple proxies until one works, then parse destinations
async function fetchDestinations(url) {
  const proxies = [
    "https://corsproxy.io/?",
    "https://api.codetabs.com/v1/proxy?quest=",
    "https://thingproxy.freeboard.io/fetch/",
    "https://api.allorigins.win/get?url="
  ];

  let lastError = null;
  for (const proxy of proxies) {
    try {
      const fetchUrl = proxy.includes("allorigins") ? proxy + encodeURIComponent(url) : proxy + encodeURIComponent(url);
      const response = await fetch(fetchUrl);
      if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);

      let html;
      if (proxy.includes("allorigins")) {
        const json = await response.json();
        html = json.contents;
      } else {
        html = await response.text();
      }

      return parseHtml(html);

    } catch (err) {
      console.warn(`Proxy failed: ${proxy}`, err);
      lastError = err;
    }
  }
  throw new Error(`All proxies failed: ${lastError}`);
}

// Merge airline destination data from two maps and identify common and unique destinations
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

  // Move "All Airlines" to the front
  const allIndex = result.findIndex(r => r.airline === "All Airlines");
  if (allIndex > -1) {
    const [allRow] = result.splice(allIndex, 1);
    result.unshift(allRow);
  }

  return result;
}

// Main function triggered by UI to compare airport destinations
async function compareDestinations() {
  const code1 = document.getElementById("code1").value.trim().toUpperCase();
  const code2 = document.getElementById("code2").value.trim().toUpperCase();
  const output = document.getElementById("output");
  output.innerHTML = "<p>Loading...</p>";

  if (!code1 || !code2) {
    output.innerHTML = `<p style="color:red;">Please enter both airport codes.</p>`;
    return;
  }
  if (code1 === code2) {
    output.innerHTML = `<p style="color:red;">Please enter two different airport codes.</p>`;
    return;
  }

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

    if (merged.length === 0) {
      output.innerHTML = `<p>No comparable airline data found for these airports.</p>`;
      return;
    }

    let html = `<table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;"><thead><tr>
      <th>Airline</th>
      <th>Common Destinations</th>
      <th>Only at ${code1}</th>
      <th>Only at ${code2}</th>
    </tr></thead><tbody>`;

    merged.forEach(({ airline, common, only1, only2 }) => {
      html += `<tr>
        <td>${airline}</td>
        <td>${common.length ? common.join(", ") : "-"}</td>
        <td>${only1.length ? only1.join(", ") : "-"}</td>
        <td>${only2.length ? only2.join(", ") : "-"}</td>
      </tr>`;
    });

    html += `</tbody></table>`;
    output.innerHTML = html;
  } catch (err) {
    output.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
  }
}

// Optional: bind Enter keypress on inputs to trigger comparison
document.addEventListener("DOMContentLoaded", () => {
  const inputs = document.querySelectorAll("input[type='text']");
  inputs.forEach(input => {
    input.addEventListener("keypress", e => {
      if (e.key === "Enter") {
        compareDestinations();
      }
    });
  });
});
