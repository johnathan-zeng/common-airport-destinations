function renderDestinations(list) {
  if (!list || list.length === 0) return '-';
  if (list.length > 20) return `${list.length} destinations`;
  return list.join(", ");
}

function isValidIATACode(code) {
  return /^[A-Z]{3}$/.test(code);
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag]));
}

async function getWikipediaUrl(code) {
  const query = `airport ${code}`;
  const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;
  const res = await fetch(apiUrl);
  const json = await res.json();
  const firstResult = json.query.search[0];
  if (!firstResult) throw new Error(`No Wikipedia page found for code: ${code}`);
  return `https://en.wikipedia.org/wiki/${encodeURIComponent(firstResult.title)}`;
}

function parseHtml(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const tables = doc.querySelectorAll("table.wikitable");

  const airlineMap = new Map();
  const allDests = new Set();

  tables.forEach(table => {
    const headers = Array.from(table.querySelectorAll("th")).map(th =>
      th.innerText.trim().toLowerCase()
    );

    const hasAirline = headers.some(h => h.includes("airline"));
    const hasDest = headers.some(h => h.includes("destination"));

    if (!(hasAirline && hasDest)) return;

    const rows = table.querySelectorAll("tr");
    rows.forEach(row => {
      const cols = row.querySelectorAll("td");
      if (cols.length < 2) return;

      const airline = cols[0].innerText.trim();
      if (!airline || /^\d+$/.test(airline)) return;

      let destText = cols[1].innerText;
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


async function fetchDestinations(url) {
  const proxies = [
    "https://corsproxy.io/?",
    "https://api.codetabs.com/v1/proxy?quest=",
    "https://thingproxy.freeboard.io/fetch/",
    "https://api.allorigins.win/get?url="
  ];

  for (const proxy of proxies) {
    try {
      const fetchUrl = proxy + encodeURIComponent(url);
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
    }
  }

  throw new Error("All proxies failed");
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

    result.push({
      airline: airline === "__ALL__" ? "All Airlines" : airline,
      common,
      only1,
      only2
    });
  });

  // Move All Airlines to top
  result.sort((a, b) => (a.airline === "All Airlines" ? -1 : b.airline === "All Airlines" ? 1 : a.airline.localeCompare(b.airline)));

  return result;
}

async function compareDestinations() {
  const code1 = document.getElementById("code1").value.trim().toUpperCase();
  const code2 = document.getElementById("code2").value.trim().toUpperCase();
  const output = document.getElementById("output");
  output.innerHTML = "<p>Loading...</p>";

  if (!isValidIATACode(code1) || !isValidIATACode(code2)) {
    output.innerHTML = `<p style="color:red;">Invalid IATA codes entered. Please enter valid 3-letter airport codes.</p>`;
    return;
  }

  try {
    output.innerHTML = `<p>Finding Wikipedia pages for ${code1} and ${code2}...</p>`;
    const [url1, url2] = await Promise.all([
      getWikipediaUrl(code1),
      getWikipediaUrl(code2)
    ]);

    output.innerHTML = `<p>Fetching destination data...</p>`;
    const [map1, map2] = await Promise.all([
      fetchDestinations(url1),
      fetchDestinations(url2)
    ]);

    const merged = mergeAirlines(map1, map2).map(row => {
      const clean = list => list.filter(d => typeof d === 'string' && d.length >= 3 && !/^\d+$/.test(d));
      return {
        ...row,
        common: clean(row.common),
        only1: clean(row.only1),
        only2: clean(row.only2)
      };
    });

    if (!merged.length) {
      output.innerHTML = `<p>No data found for either airport.</p>`;
      return;
    }

    let html = `<style>
      table { border-collapse: collapse; width: 100%; margin-top: 1em; }
      th, td { border: 1px solid #ccc; padding: 4px 8px; text-align: left; }
      th { background-color: #f0f0f0; position: sticky; top: 0; z-index: 1; }
      tbody tr:hover { background-color: #f9f9f9; }
    </style>`;

    html += `<table><thead><tr>
      <th>Airline</th>
      <th>Common Destinations</th>
      <th>Only at ${code1}</th>
      <th>Only at ${code2}</th>
    </tr></thead><tbody>`;

    merged.forEach(({ airline, common, only1, only2 }) => {
      html += `<tr>
        <td>${escapeHTML(airline)}</td>
        <td>${escapeHTML(renderDestinations(common))}</td>
        <td>${escapeHTML(renderDestinations(only1))}</td>
        <td>${escapeHTML(renderDestinations(only2))}</td>
      </tr>`;
    });

    html += `</tbody></table>`;
    output.innerHTML = html;
  } catch (err) {
    output.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
  }
}
