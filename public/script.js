const WIKIPEDIA_API_BASE =
  "https://en.wikipedia.org/w/api.php?format=json&formatversion=2&origin=*";
const THEME_STORAGE_KEY = "airport-theme-preference";
const themeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
const AIRPORT_PAGE_OVERRIDES = {
  BOS: "Logan International Airport",
  KBOS: "Logan International Airport",
  GMP: "Gimpo International Airport",
  ICN: "Incheon International Airport",
  JFK: "John F. Kennedy International Airport",
  KGMP: "Gimpo International Airport",
  KICN: "Incheon International Airport",
  KJFK: "John F. Kennedy International Airport",
  LGA: "LaGuardia Airport",
  KLGA: "LaGuardia Airport",
  RKSI: "Incheon International Airport",
  RKSS: "Gimpo International Airport",
};

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function resolveTheme(preference) {
  if (preference === "dark") return "dark";
  if (preference === "light") return "light";
  return themeMediaQuery.matches ? "dark" : "light";
}

function applyTheme(preference) {
  const resolvedTheme = resolveTheme(preference);
  document.documentElement.dataset.theme = resolvedTheme;
}

function getSavedThemePreference() {
  const savedPreference = localStorage.getItem(THEME_STORAGE_KEY);
  return ["auto", "light", "dark"].includes(savedPreference)
    ? savedPreference
    : "auto";
}

function initializeThemePicker() {
  const themeSelect = document.getElementById("theme-select");
  if (!themeSelect) return;

  const savedPreference = getSavedThemePreference();
  themeSelect.value = savedPreference;
  applyTheme(savedPreference);

  themeSelect.addEventListener("change", (event) => {
    const preference = event.target.value;
    localStorage.setItem(THEME_STORAGE_KEY, preference);
    applyTheme(preference);
  });

  themeMediaQuery.addEventListener("change", () => {
    if (getSavedThemePreference() === "auto") {
      applyTheme("auto");
    }
  });
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Wikipedia API error: ${response.status}`);
  }
  return response.json();
}

function normalizeAirportCode(code) {
  return code.trim().toUpperCase();
}

function normalizeDestinationName(text) {
  return text
    .replace(/\[\d+\]/g, "")
    .replace(/\b\d+(?:\s*,\s*\d+)+\b/g, "")
    .replace(/\((?:both\s+)?(?:begin|begins|resume|resumes)[^)]+\)?/gi, "")
    .replace(/\b(?:both\s+)?(?:begin|begins|resume|resumes)\s+[A-Z][a-z]+\s+\d{1,2}\b/gi, "")
    .replace(/\([^)]+\)/g, "")
    .replace(/^\s*:\s*/g, "")
    .replace(/\s+[–-]\s+[A-Z]{3,4}$/g, "")
    .replace(/\/.*$/g, "")
    .replace(/\b(via|seasonal|charter|cargo|freight|terminated|suspended)\b/gi, "")
    .replace(/[.;:]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreSearchResult(code, title, snippet = "") {
  const haystack = `${title} ${snippet}`.toLowerCase();
  let score = 0;
  const normalizedSnippet = snippet.replace(/<[^>]+>/g, " ");
  const alternateCodes = [...getAlternateAirportCodes(code)];
  const titleLower = title.toLowerCase();
  const codeLower = code.toLowerCase();

  if (titleLower.includes("airport")) score += 6;
  if (titleLower.includes(codeLower)) score += 5;
  if (haystack.includes(`${codeLower} airport`)) score += 5;
  if (new RegExp(`\\biata\\s*:\\s*${code}\\b`, "i").test(normalizedSnippet)) {
    score += 25;
  }
  if (new RegExp(`\\bicao\\s*:\\s*${code}\\b`, "i").test(normalizedSnippet)) {
    score += 25;
  }
  if (alternateCodes.some((candidate) => new RegExp(`\\b${candidate}\\b`, "i").test(normalizedSnippet))) {
    score += 20;
  }
  if (alternateCodes.some((candidate) => new RegExp(`\\b${candidate}\\b`, "i").test(title))) {
    score += 8;
  }
  if (haystack.includes("international airport")) score += 3;
  if (haystack.includes("municipal airport")) score += 2;
  if (haystack.includes("air base")) score -= 4;
  if (haystack.includes("disambiguation")) score -= 10;
  if (titleLower === codeLower) score -= 20;
  if (
    titleLower.includes("station") ||
    titleLower.includes("airtrain") ||
    titleLower.includes("subway") ||
    titleLower.includes("line") ||
    titleLower.includes("people mover") ||
    titleLower.includes("terminal") ||
    titleLower.includes("express")
  ) {
    score -= 30;
  }

  return score;
}

async function fetchAirportPageHtml(title) {
  const parseUrl =
    `${WIKIPEDIA_API_BASE}&action=parse&prop=text&page=${encodeURIComponent(title)}`;
  const data = await fetchJson(parseUrl);
  const html = data.parse?.text;

  if (!html || typeof html !== "string") {
    throw new Error(`Wikipedia page content could not be loaded for "${title}"`);
  }

  return html;
}

function getAlternateAirportCodes(code) {
  const alternates = new Set([code]);

  if (code.length === 4) {
    alternates.add(code.slice(1));
  }

  return alternates;
}

async function resolveAirportPage(code) {
  const overrideTitle = AIRPORT_PAGE_OVERRIDES[code];
  if (overrideTitle) {
    return {
      title: overrideTitle,
      html: await fetchAirportPageHtml(overrideTitle),
    };
  }

  const query = `${code} airport`;
  const searchUrl =
    `${WIKIPEDIA_API_BASE}&action=query&list=search&srlimit=10&srsearch=${encodeURIComponent(query)}`;
  const data = await fetchJson(searchUrl);
  const results = data.query?.search ?? [];

  if (!results.length) {
    throw new Error(`No Wikipedia page found for airport code: ${code}`);
  }

  const rankedResults = [...results].sort(
    (a, b) =>
      scoreSearchResult(code, b.title, b.snippet) -
      scoreSearchResult(code, a.title, a.snippet)
  );
  const best = rankedResults[0];

  if (!best?.title) {
    throw new Error(`No Wikipedia page found for airport code: ${code}`);
  }

  const html = await fetchAirportPageHtml(best.title);
  return { title: best.title, html };
}

function hasRelevantHeading(table) {
  let node = table.previousElementSibling;
  let steps = 0;

  while (node && steps < 8) {
    if (/^H[1-6]$/i.test(node.tagName)) {
      const heading = node.textContent.toLowerCase();
      return (
        heading.includes("airline") ||
        heading.includes("destination") ||
        heading.includes("passenger")
      );
    }
    node = node.previousElementSibling;
    steps += 1;
  }

  return false;
}

function looksLikeDestinationTable(table) {
  const captionText = table.querySelector("caption")?.textContent.toLowerCase() ?? "";
  const headerText = [...table.querySelectorAll("th, td")]
    .map((cell) => cell.textContent.toLowerCase())
    .join(" ");

  const haystack = `${captionText} ${headerText}`;
  if (haystack.includes("cargo") && !haystack.includes("passenger")) {
    return false;
  }

  return (
    (haystack.includes("destination") && haystack.includes("airline")) ||
    (haystack.includes("passenger") && haystack.includes("airline")) ||
    ((haystack.includes("destination") || haystack.includes("passenger")) &&
      hasRelevantHeading(table))
  );
}

function findColumnIndexes(table) {
  const rows = [...table.querySelectorAll("tr")].slice(0, 6);

  for (const row of rows) {
    const headers = [...row.children].map((cell) =>
      cell.textContent.toLowerCase().trim()
    );

    if (!headers.length) continue;

    const airlineIndex = headers.findIndex(
      (text) =>
        text === "airline" ||
        text === "airlines" ||
        text.includes("airline") ||
        text.includes("carrier")
    );
    const destinationIndex = headers.findIndex(
      (text) =>
        text.includes("destination") ||
        text.includes("city") ||
        text.includes("location")
    );

    if (airlineIndex !== -1 && destinationIndex !== -1) {
      return { airlineIndex, destinationIndex };
    }
  }

  return null;
}

function extractCellText(cell) {
  return [...cell.childNodes]
    .map((node) => node.textContent ?? "")
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function removeNoise(node) {
  node
    .querySelectorAll(
      "sup, .reference, .sortkey, .mw-editsection, .noprint, style, script"
    )
    .forEach((element) => element.remove());
}

function isLikelyDestinationName(value) {
  return (
    value.length >= 3 &&
    value.length < 80 &&
    /\p{L}/u.test(value) &&
    !/^\d+$/.test(value) &&
    !/^[A-Z]{2}\d+$/.test(value) &&
    !/^(none|terminated|suspended|tbd)$/i.test(value)
  );
}

function isCargoAirline(name) {
  return /\b(cargo|freight)\b/i.test(name);
}

function splitDestinations(text) {
  return text
    .split(/[\n,;·•:]|\s+:\s+/)
    .map(normalizeDestinationName)
    .filter(isLikelyDestinationName);
}

function extractListItemDestinations(item) {
  const itemClone = item.cloneNode(true);
  removeNoise(itemClone);

  const nestedLists = [...itemClone.querySelectorAll(":scope > ul, :scope > ol")];
  nestedLists.forEach((list) => list.remove());

  const ownText = normalizeDestinationName(itemClone.textContent || "");
  const nestedDestinations = [...item.children]
    .filter((child) => child.tagName === "UL" || child.tagName === "OL")
    .flatMap((list) =>
      [...list.children]
        .filter((child) => child.tagName === "LI")
        .flatMap((child) => extractListItemDestinations(child))
    );

  if (nestedDestinations.length) {
    return [
      ...splitDestinations(ownText),
      ...nestedDestinations,
    ];
  }

  return splitDestinations(ownText);
}

function extractDestinationsFromCell(cell) {
  const clone = cell.cloneNode(true);
  removeNoise(clone);

  const topLevelItems = [...clone.querySelectorAll("li")].filter(
    (item) => !item.parentElement.closest("li")
  );

  if (topLevelItems.length) {
    return topLevelItems
      .flatMap((item) => extractListItemDestinations(item))
      .filter(isLikelyDestinationName);
  }

  return splitDestinations(extractCellText(clone));
}

function resolveRowCells(cells, airlineIndex, destinationIndex, currentAirline) {
  const requiredWidth = Math.max(airlineIndex, destinationIndex) + 1;

  if (cells.length >= requiredWidth) {
    return {
      airlineCell: cells[airlineIndex],
      destinationCell: cells[destinationIndex],
      airlineFromRow: true,
    };
  }

  if (
    currentAirline &&
    airlineIndex < destinationIndex &&
    cells.length === requiredWidth - 1
  ) {
    return {
      airlineCell: null,
      destinationCell: cells[destinationIndex - 1],
      airlineFromRow: false,
    };
  }

  return null;
}

function parseHtml(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const tables = [...doc.querySelectorAll("table.wikitable")];
  const airlineMap = new Map();
  const allDestinations = new Set();

  tables.forEach((table) => {
    if (!looksLikeDestinationTable(table)) return;

    const indexes = findColumnIndexes(table);
    if (!indexes) return;

    const { airlineIndex, destinationIndex } = indexes;
    let currentAirline = "";
    const rows = [...table.querySelectorAll("tr")];

    rows.forEach((row) => {
      const cells = [...row.children];
      if (!cells.length) return;

      const resolvedCells = resolveRowCells(
        cells,
        airlineIndex,
        destinationIndex,
        currentAirline
      );
      if (!resolvedCells) return;

      const normalizedRow = cells.map((cell) => extractCellText(cell));
      const lowerRow = normalizedRow.map((text) => text.toLowerCase());

      if (
        lowerRow.some((text) => text.includes("airline")) &&
        lowerRow.some(
          (text) =>
            text.includes("destination") ||
            text.includes("city") ||
            text.includes("location")
        )
      ) {
        return;
      }

      const airline = resolvedCells.airlineFromRow
        ? extractCellText(resolvedCells.airlineCell) || currentAirline
        : currentAirline;
      const destinationText = extractCellText(resolvedCells.destinationCell) || "";

      if (!airline || !destinationText) return;
      currentAirline = airline;
      if (isCargoAirline(airline)) return;

      const destinations = extractDestinationsFromCell(resolvedCells.destinationCell);
      if (!destinations.length) return;

      if (!airlineMap.has(airline)) {
        airlineMap.set(airline, new Set());
      }

      destinations.forEach((destination) => {
        airlineMap.get(airline).add(destination);
        allDestinations.add(destination);
      });
    });
  });

  if (allDestinations.size) {
    airlineMap.set("__ALL__", allDestinations);
  }

  return airlineMap;
}

async function fetchDestinationsForCode(code) {
  const { title, html } = await resolveAirportPage(code);
  const destinations = parseHtml(html);

  if (!destinations.size) {
    throw new Error(`No passenger destination tables were found on "${title}"`);
  }

  return { title, destinations };
}

function mergeAirlines(map1, map2) {
  const airlineSet = new Set([...map1.keys(), ...map2.keys()]);
  const result = [];

  airlineSet.forEach((airline) => {
    const d1 = map1.get(airline) || new Set();
    const d2 = map2.get(airline) || new Set();

    const common = [...d1].filter((value) => d2.has(value)).sort();
    const only1 = [...d1].filter((value) => !d2.has(value)).sort();
    const only2 = [...d2].filter((value) => !d1.has(value)).sort();

    if (common.length || only1.length || only2.length) {
      result.push({
        airline: airline === "__ALL__" ? "All Airlines" : airline,
        common,
        only1,
        only2,
      });
    }
  });

  return result.sort((a, b) => {
    if (a.airline === "All Airlines") return -1;
    if (b.airline === "All Airlines") return 1;
    return a.airline.localeCompare(b.airline);
  });
}

function renderResults(code1, code2, title1, title2, merged) {
  let html = `
    <h3>Destination Comparison: ${escapeHtml(code1)} vs ${escapeHtml(code2)}</h3>
    <p><strong>${escapeHtml(code1)}</strong>: ${escapeHtml(title1)}<br><strong>${escapeHtml(code2)}</strong>: ${escapeHtml(title2)}</p>
    <table>
      <thead>
        <tr>
          <th>Airline</th>
          <th>Common Destinations</th>
          <th>Only at ${escapeHtml(code1)}</th>
          <th>Only at ${escapeHtml(code2)}</th>
        </tr>
      </thead>
      <tbody>
  `;

  merged.forEach(({ airline, common, only1, only2 }) => {
    html += `
      <tr>
        <td><strong>${escapeHtml(airline)}</strong></td>
        <td>${common.length ? escapeHtml(common.join(", ")) : '<span class="empty-cell">None</span>'}</td>
        <td>${only1.length ? escapeHtml(only1.join(", ")) : '<span class="empty-cell">None</span>'}</td>
        <td>${only2.length ? escapeHtml(only2.join(", ")) : '<span class="empty-cell">None</span>'}</td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
    <div class="warning">
      <strong>Note:</strong> Results come from Wikipedia destination tables and can vary by page completeness.
    </div>
  `;

  return html;
}

async function compareDestinations() {
  const code1 = normalizeAirportCode(document.getElementById("code1").value);
  const code2 = normalizeAirportCode(document.getElementById("code2").value);
  const output = document.getElementById("output");
  const button = document.querySelector("button");

  if (!code1 || !code2) {
    output.innerHTML = `<div class="error">Please enter both airport codes.</div>`;
    return;
  }

  if (code1.length < 3 || code2.length < 3) {
    output.innerHTML = `<div class="error">Please enter valid airport codes (3+ characters).</div>`;
    return;
  }

  if (code1 === code2) {
    output.innerHTML = `<div class="error">Please enter two different airport codes.</div>`;
    return;
  }

  button.disabled = true;
  output.innerHTML = `<div class="loading">Finding airport pages...</div>`;

  try {
    const [airport1, airport2] = await Promise.all([
      fetchDestinationsForCode(code1),
      fetchDestinationsForCode(code2),
    ]);

    const merged = mergeAirlines(airport1.destinations, airport2.destinations);

    if (!merged.length) {
      output.innerHTML =
        `<div class="warning">No comparable destination data was found between these airports.</div>`;
      return;
    }

    output.innerHTML = renderResults(
      code1,
      code2,
      airport1.title,
      airport2.title,
      merged
    );
  } catch (error) {
    console.error(error);
    output.innerHTML = `<div class="error">Error: ${escapeHtml(error.message)}</div>`;
  } finally {
    button.disabled = false;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initializeThemePicker();

  const inputs = document.querySelectorAll("input[type='text']");
  inputs.forEach((input) => {
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        compareDestinations();
      }
    });
  });
});
