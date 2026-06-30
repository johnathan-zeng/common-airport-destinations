const WIKIPEDIA_API_BASE =
  "https://en.wikipedia.org/w/api.php?format=json&formatversion=2&origin=*";
const THEME_STORAGE_KEY = "airport-theme-preference";
const themeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
const AIRPORT_PAGE_OVERRIDES = {
  // North America
  ATL: "Hartsfield–Jackson Atlanta International Airport",
  BOS: "Logan International Airport",
  CLT: "Charlotte Douglas International Airport",
  DEN: "Denver International Airport",
  DFW: "Dallas/Fort Worth International Airport",
  DTW: "Detroit Metropolitan Wayne County Airport",
  EWR: "Newark Liberty International Airport",
  IAH: "George Bush Intercontinental Airport",
  JFK: "John F. Kennedy International Airport",
  LAS: "Harry Reid International Airport",
  LAX: "Los Angeles International Airport",
  LGA: "LaGuardia Airport",
  MCO: "Orlando International Airport",
  MDW: "Midway International Airport",
  MIA: "Miami International Airport",
  MSP: "Minneapolis–Saint Paul International Airport",
  ORD: "O'Hare International Airport",
  PHL: "Philadelphia International Airport",
  PHX: "Phoenix Sky Harbor International Airport",
  SEA: "Seattle–Tacoma International Airport",
  SFO: "San Francisco International Airport",
  SLC: "Salt Lake City International Airport",
  YUL: "Montréal–Trudeau International Airport",
  YVR: "Vancouver International Airport",
  YYZ: "Toronto Pearson International Airport",
  KATL: "Hartsfield–Jackson Atlanta International Airport",
  KBOS: "Logan International Airport",
  KCLT: "Charlotte Douglas International Airport",
  KDEN: "Denver International Airport",
  KDFW: "Dallas/Fort Worth International Airport",
  KDTW: "Detroit Metropolitan Wayne County Airport",
  KEWR: "Newark Liberty International Airport",
  KIAH: "George Bush Intercontinental Airport",
  KJFK: "John F. Kennedy International Airport",
  KLAS: "Harry Reid International Airport",
  KLAX: "Los Angeles International Airport",
  KLGA: "LaGuardia Airport",
  KMCO: "Orlando International Airport",
  KMDW: "Midway International Airport",
  KMIA: "Miami International Airport",
  KMSP: "Minneapolis–Saint Paul International Airport",
  KORD: "O'Hare International Airport",
  KPHL: "Philadelphia International Airport",
  KPHX: "Phoenix Sky Harbor International Airport",
  KSEA: "Seattle–Tacoma International Airport",
  KSFO: "San Francisco International Airport",
  KSLC: "Salt Lake City International Airport",
  // South America
  EZE: "Ministro Pistarini International Airport",
  GIG: "Rio de Janeiro–Galeão International Airport",
  GRU: "São Paulo/Guarulhos International Airport",
  MEX: "Mexico City International Airport",
  // Europe
  AMS: "Amsterdam Airport Schiphol",
  ARN: "Stockholm Arlanda Airport",
  BCN: "Barcelona–El Prat Airport",
  BRU: "Brussels Airport",
  CDG: "Charles de Gaulle Airport",
  CPH: "Copenhagen Airport",
  FCO: "Leonardo da Vinci–Fiumicino Airport",
  FRA: "Frankfurt Airport",
  GMP: "Gimpo International Airport",
  HEL: "Helsinki Airport",
  LGW: "Gatwick Airport",
  LHR: "Heathrow Airport",
  LIN: "Linate Airport",
  MAD: "Adolfo Suárez Madrid–Barajas Airport",
  MUC: "Munich Airport",
  MXP: "Milan Malpensa Airport",
  ORY: "Orly Airport",
  OSL: "Oslo Airport, Gardermoen",
  STN: "London Stansted Airport",
  VIE: "Vienna International Airport",
  ZRH: "Zurich Airport",
  EHAM: "Amsterdam Airport Schiphol",
  EGLL: "Heathrow Airport",
  EGKK: "Gatwick Airport",
  EGSS: "London Stansted Airport",
  LFPG: "Charles de Gaulle Airport",
  LFPO: "Orly Airport",
  EDDF: "Frankfurt Airport",
  EDDM: "Munich Airport",
  LEMD: "Adolfo Suárez Madrid–Barajas Airport",
  LEBL: "Barcelona–El Prat Airport",
  LIRF: "Leonardo da Vinci–Fiumicino Airport",
  LIMC: "Milan Malpensa Airport",
  LSZH: "Zurich Airport",
  LOWW: "Vienna International Airport",
  EBBR: "Brussels Airport",
  EKCH: "Copenhagen Airport",
  ESSA: "Stockholm Arlanda Airport",
  EFHK: "Helsinki Airport",
  ENGM: "Oslo Airport, Gardermoen",
  // Middle East & Africa
  ADD: "Addis Ababa Bole International Airport",
  AUH: "Abu Dhabi International Airport",
  CAI: "Cairo International Airport",
  CMN: "Mohammed V International Airport",
  DME: "Domodedovo International Airport",
  DOH: "Hamad International Airport",
  DXB: "Dubai International Airport",
  JNB: "O.R. Tambo International Airport",
  NBO: "Jomo Kenyatta International Airport",
  SVO: "Sheremetyevo International Airport",
  OMDB: "Dubai International Airport",
  OMAA: "Abu Dhabi International Airport",
  OTHH: "Hamad International Airport",
  // Asia-Pacific
  BKK: "Suvarnabhumi Airport",
  CAN: "Guangzhou Baiyun International Airport",
  CGK: "Soekarno-Hatta International Airport",
  DMK: "Don Mueang International Airport",
  HKG: "Hong Kong International Airport",
  HND: "Tokyo International Airport",
  ICN: "Incheon International Airport",
  ITM: "Osaka International Airport",
  KIX: "Kansai International Airport",
  KUL: "Kuala Lumpur International Airport",
  NRT: "Narita International Airport",
  PEK: "Beijing Capital International Airport",
  PKX: "Beijing Daxing International Airport",
  PVG: "Shanghai Pudong International Airport",
  SHA: "Shanghai Hongqiao International Airport",
  SIN: "Singapore Changi Airport",
  SZX: "Shenzhen Bao'an International Airport",
  AKL: "Auckland Airport",
  MEL: "Melbourne Airport",
  SYD: "Sydney Airport",
  VHHH: "Hong Kong International Airport",
  RJTT: "Tokyo International Airport",
  RJAA: "Narita International Airport",
  RJBB: "Kansai International Airport",
  RJOO: "Osaka International Airport",
  RKSI: "Incheon International Airport",
  RKSS: "Gimpo International Airport",
  ZBAA: "Beijing Capital International Airport",
  ZBAD: "Beijing Daxing International Airport",
  ZGSZ: "Shenzhen Bao'an International Airport",
  ZGGG: "Guangzhou Baiyun International Airport",
  ZSPD: "Shanghai Pudong International Airport",
  ZSSS: "Shanghai Hongqiao International Airport",
  WSSS: "Singapore Changi Airport",
  VTBS: "Suvarnabhumi Airport",
  VTBD: "Don Mueang International Airport",
  WMKK: "Kuala Lumpur International Airport",
  WIII: "Soekarno-Hatta International Airport",
  NZAA: "Auckland Airport",
  YMML: "Melbourne Airport",
  YSSY: "Sydney Airport",
  KGMP: "Gimpo International Airport",
  KICN: "Incheon International Airport",
};
const AIRCRAFT_PROFILES = {
  a320: { label: "Airbus A320", cruiseKmh: 828 },
  a333: { label: "Airbus A330-300", cruiseKmh: 871 },
  a359: { label: "Airbus A350-900", cruiseKmh: 905 },
  a35k: { label: "Airbus A350-1000", cruiseKmh: 903 },
  a388: { label: "Airbus A380-800", cruiseKmh: 903 },
  b738: { label: "Boeing 737-800", cruiseKmh: 842 },
  b763: { label: "Boeing 767-300ER", cruiseKmh: 851 },
  b77w: { label: "Boeing 777-300ER", cruiseKmh: 892 },
  b788: { label: "Boeing 787-8", cruiseKmh: 903 },
  b789: { label: "Boeing 787-9", cruiseKmh: 903 },
  b789x: { label: "Boeing 787-10", cruiseKmh: 903 },
  e75l: { label: "Embraer 175", cruiseKmh: 830 },
};

const comparisonSortState = {
  key: "commonCount",
  direction: "desc",
};

const comparisonFilterState = {
  query: "",
  minDestinations: "",
  maxDestinations: "",
  selectedAirlines: [],
  selectionEnabled: false,
};

const matrixSortState = {
  key: "coverage",
  direction: "desc",
};

const matrixFilterState = {
  query: "",
  minDestinations: "",
  maxDestinations: "",
  selectedAirlines: [],
  selectionEnabled: false,
  showUniqueDestinations: false,
  showCommonDestinations: false,
};

let currentComparisonResult = null;
let currentMatrixResult = null;
let comparisonViewMode = "table";
const filterUiState = {
  comparison: {
    panelOpen: true,
    airlinesOpen: false,
    focusedId: null,
    selectionStart: null,
    selectionEnd: null,
  },
  matrix: {
    panelOpen: true,
    airlinesOpen: false,
    focusedId: null,
    selectionStart: null,
    selectionEnd: null,
  },
};
let cachedRussiaAvoidancePolygons = null;

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
  document.documentElement.dataset.theme = resolveTheme(preference);
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
    .replace(
      /\b(?:both\s+)?(?:begin|begins|resume|resumes)\s+[A-Z][a-z]+\s+\d{1,2}\b/gi,
      ""
    )
    .replace(/\([^)]+\)/g, "")
    .replace(/^\s*:\s*/g, "")
    .replace(/\s+[–-]\s+[A-Z]{3,4}$/g, "")
    .replace(/\/.*$/g, "")
    .replace(
      /\b(via|seasonal|charter|cargo|freight|terminated|suspended)\b/gi,
      ""
    )
    .replace(/[.;:]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getAlternateAirportCodes(code) {
  const alternates = new Set([code]);
  if (code.length === 4) {
    alternates.add(code.slice(1));
  }
  return alternates;
}

function scoreSearchResult(code, title, snippet = "") {
  const haystack = `${title} ${snippet}`.toLowerCase();
  const normalizedSnippet = snippet.replace(/<[^>]+>/g, " ");
  const alternateCodes = [...getAlternateAirportCodes(code)];
  const titleLower = title.toLowerCase();
  const codeLower = code.toLowerCase();
  let score = 0;

  if (titleLower.includes("airport")) score += 6;
  if (titleLower.includes(codeLower)) score += 5;
  if (haystack.includes(`${codeLower} airport`)) score += 5;
  if (new RegExp(`\\biata\\s*:\\s*${code}\\b`, "i").test(normalizedSnippet)) {
    score += 25;
  }
  if (new RegExp(`\\bicao\\s*:\\s*${code}\\b`, "i").test(normalizedSnippet)) {
    score += 25;
  }
  if (
    alternateCodes.some((candidate) =>
      new RegExp(`\\b${candidate}\\b`, "i").test(normalizedSnippet)
    )
  ) {
    score += 20;
  }
  if (
    alternateCodes.some((candidate) =>
      new RegExp(`\\b${candidate}\\b`, "i").test(title)
    )
  ) {
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

  return {
    title: best.title,
    html: await fetchAirportPageHtml(best.title),
  };
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
    return [...splitDestinations(ownText), ...nestedDestinations];
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

function normalizeLongitude(lon) {
  let normalized = lon;
  while (normalized > 180) normalized -= 360;
  while (normalized < -180) normalized += 360;
  return normalized;
}

async function fetchAirportCoordinatesForCode(code) {
  const { title } = await resolveAirportPage(code);
  const queryUrl =
    `${WIKIPEDIA_API_BASE}&action=query&prop=coordinates&titles=${encodeURIComponent(
      title
    )}`;
  const data = await fetchJson(queryUrl);
  const page = Object.values(data.query?.pages ?? {})[0];
  const coordinate = page?.coordinates?.[0];

  if (!coordinate) {
    throw new Error(`No coordinates were found for "${title}"`);
  }

  return {
    code,
    title,
    lat: coordinate.lat,
    lon: normalizeLongitude(coordinate.lon),
  };
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function toDegrees(value) {
  return (value * 180) / Math.PI;
}

function haversineDistanceKm(start, end) {
  const earthRadiusKm = 6371;
  const dLat = toRadians(end.lat - start.lat);
  const dLon = toRadians(end.lon - start.lon);
  const lat1 = toRadians(start.lat);
  const lat2 = toRadians(end.lat);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

function interpolateGreatCircle(start, end, pointCount = 64) {
  const lat1 = toRadians(start.lat);
  const lon1 = toRadians(start.lon);
  const lat2 = toRadians(end.lat);
  const lon2 = toRadians(end.lon);

  const startVector = [
    Math.cos(lat1) * Math.cos(lon1),
    Math.cos(lat1) * Math.sin(lon1),
    Math.sin(lat1),
  ];
  const endVector = [
    Math.cos(lat2) * Math.cos(lon2),
    Math.cos(lat2) * Math.sin(lon2),
    Math.sin(lat2),
  ];

  const dotProduct = Math.min(
    1,
    Math.max(
      -1,
      startVector[0] * endVector[0] +
        startVector[1] * endVector[1] +
        startVector[2] * endVector[2]
    )
  );
  const centralAngle = Math.acos(dotProduct);

  if (centralAngle === 0) {
    return [start];
  }

  const points = [];
  for (let index = 0; index <= pointCount; index += 1) {
    const fraction = index / pointCount;
    const weight1 = Math.sin((1 - fraction) * centralAngle) / Math.sin(centralAngle);
    const weight2 = Math.sin(fraction * centralAngle) / Math.sin(centralAngle);
    const x = weight1 * startVector[0] + weight2 * endVector[0];
    const y = weight1 * startVector[1] + weight2 * endVector[1];
    const z = weight1 * startVector[2] + weight2 * endVector[2];
    const norm = Math.sqrt(x * x + y * y + z * z);
    const lat = Math.atan2(z / norm, Math.sqrt((x / norm) ** 2 + (y / norm) ** 2));
    const lon = Math.atan2(y / norm, x / norm);

    points.push({
      lat: toDegrees(lat),
      lon: normalizeLongitude(toDegrees(lon)),
    });
  }

  return points;
}

function routeIntersectsRussia(points) {
  return points.some((point) =>
    getRussiaAvoidancePolygons().some((polygon) => pointInPolygon(point, polygon))
  );
}

function routeIntersectsMiddleEast(points) {
  return points.some(
    ({ lat, lon }) => lat >= 12 && lat <= 42 && lon >= 32 && lon <= 63
  );
}

function getRussiaAvoidancePolygons() {
  if (cachedRussiaAvoidancePolygons) {
    return cachedRussiaAvoidancePolygons;
  }

  const geometry = window.RUSSIA_BOUNDARY_GEOJSON?.geometry;
  if (!geometry || geometry.type !== "MultiPolygon") {
    cachedRussiaAvoidancePolygons = [];
    return cachedRussiaAvoidancePolygons;
  }

  cachedRussiaAvoidancePolygons = geometry.coordinates
    .flatMap((polygon) =>
      polygon
        .slice(0, 1)
        .map((ring) =>
          ring.map(([lon, lat]) => [lat, normalizeLongitude(lon)])
        )
    )
    .filter((ring) => ring.length >= 4);

  // Add a conservative corridor over the Kuril/Sakhalin/Kamchatka island chain
  // so the avoidance search does not unrealistically thread narrow gaps southwest
  // of the Russian Far East between Japan and the Pacific-side islands.
  cachedRussiaAvoidancePolygons.push([
    [43.0, 141.5],
    [44.5, 145.0],
    [46.5, 148.5],
    [48.5, 151.5],
    [50.5, 154.5],
    [53.0, 158.0],
    [56.0, 161.5],
    [58.5, 164.5],
    [56.0, 166.5],
    [52.5, 163.5],
    [49.5, 159.5],
    [46.5, 155.5],
    [44.5, 151.5],
    [42.8, 147.0],
    [42.6, 143.0],
    [43.0, 141.5],
  ]);

  return cachedRussiaAvoidancePolygons;
}

function pointInPolygon(point, polygon) {
  let inside = false;
  const testX = point.lon;
  const testY = point.lat;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const xi = polygon[i][1];
    const yi = polygon[i][0];
    const xj = polygon[j][1];
    const yj = polygon[j][0];

    const intersects =
      yi > testY !== yj > testY &&
      testX < ((xj - xi) * (testY - yi)) / (yj - yi) + xi;

    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
}

function pointInAvoidance(point, avoidRegions) {
  return (
    (avoidRegions.russia &&
      getRussiaAvoidancePolygons().some((polygon) => pointInPolygon(point, polygon))) ||
    (avoidRegions.middleEast &&
      point.lat >= 12 &&
      point.lat <= 42 &&
      point.lon >= 32 &&
      point.lon <= 63)
  );
}

function buildRouteSegments(waypoints) {
  const segments = [];

  for (let index = 0; index < waypoints.length - 1; index += 1) {
    const start = waypoints[index];
    const end = waypoints[index + 1];
    segments.push({
      start,
      end,
      points: interpolateGreatCircle(start, end, 48),
      distanceKm: haversineDistanceKm(start, end),
    });
  }

  return segments;
}

function routeIntersectsAvoidance(points, avoidRegions) {
  return (
    (avoidRegions.russia && routeIntersectsRussia(points)) ||
    (avoidRegions.middleEast && routeIntersectsMiddleEast(points))
  );
}

function segmentCrossesAvoidance(start, end, avoidRegions) {
  if (pointInAvoidance(start, avoidRegions) || pointInAvoidance(end, avoidRegions)) {
    return true;
  }
  return routeIntersectsAvoidance(interpolateGreatCircle(start, end, 20), avoidRegions);
}

function getAvoidanceGridLatitudes() {
  const latitudes = [];
  for (let lat = -70; lat <= 85; lat += 5) {
    latitudes.push(lat);
  }
  return latitudes;
}

function wrapGridLongitude(lon) {
  return normalizeLongitude(lon);
}

function createGridNode(lat, lon) {
  return {
    lat,
    lon: wrapGridLongitude(lon),
    key: `grid:${lat}:${wrapGridLongitude(lon)}`,
  };
}

function buildGridNeighborLookup(avoidRegions) {
  const latitudes = getAvoidanceGridLatitudes();
  const longitudeValues = [];
  for (let lon = -180; lon < 180; lon += 5) {
    longitudeValues.push(lon);
  }

  const allowedNodes = new Map();
  latitudes.forEach((lat) => {
    longitudeValues.forEach((lon) => {
      const node = createGridNode(lat, lon);
      if (!pointInAvoidance(node, avoidRegions)) {
        allowedNodes.set(node.key, node);
      }
    });
  });

  const neighborLookup = new Map();
  const longitudeStep = 5;
  const latitudeStep = 5;
  const deltas = [
    [-latitudeStep, -longitudeStep],
    [-latitudeStep, 0],
    [-latitudeStep, longitudeStep],
    [0, -longitudeStep],
    [0, longitudeStep],
    [latitudeStep, -longitudeStep],
    [latitudeStep, 0],
    [latitudeStep, longitudeStep],
  ];

  allowedNodes.forEach((node) => {
    const neighbors = [];
    deltas.forEach(([dLat, dLon]) => {
      const candidateLat = node.lat + dLat;
      if (candidateLat < -70 || candidateLat > 85) return;
      const candidateLon = wrapGridLongitude(node.lon + dLon);
      const candidateKey = `grid:${candidateLat}:${candidateLon}`;
      const candidateNode = allowedNodes.get(candidateKey);
      if (!candidateNode) return;
      if (segmentCrossesAvoidance(node, candidateNode, avoidRegions)) return;
      neighbors.push(candidateNode);
    });
    neighborLookup.set(node.key, neighbors);
  });

  return { allowedNodes, neighborLookup };
}

function getEndpointConnections(point, allowedNodes, avoidRegions) {
  return [...allowedNodes.values()]
    .map((node) => ({
      node,
      distanceKm: haversineDistanceKm(point, node),
    }))
    .filter(
      ({ node, distanceKm }) =>
        distanceKm <= 1400 && !segmentCrossesAvoidance(point, node, avoidRegions)
    )
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 16)
    .map(({ node }) => node);
}

function reconstructPath(cameFrom, endKey, nodeLookup) {
  const path = [];
  let currentKey = endKey;
  while (currentKey) {
    path.push(nodeLookup.get(currentKey));
    currentKey = cameFrom.get(currentKey) ?? null;
  }
  return path.reverse();
}

function findAvoidancePath(origin, destination, avoidRegions) {
  const { allowedNodes, neighborLookup } = buildGridNeighborLookup(avoidRegions);
  const startNode = { ...origin, key: "start" };
  const endNode = { ...destination, key: "end" };
  const nodeLookup = new Map(allowedNodes);
  nodeLookup.set(startNode.key, startNode);
  nodeLookup.set(endNode.key, endNode);

  const startNeighbors = getEndpointConnections(origin, allowedNodes, avoidRegions);
  const endNeighbors = getEndpointConnections(destination, allowedNodes, avoidRegions);
  const endNeighborKeys = new Set(endNeighbors.map((node) => node.key));

  if (!startNeighbors.length || !endNeighbors.length) {
    return null;
  }

  const openSet = new Set([startNode.key]);
  const cameFrom = new Map();
  const gScore = new Map([[startNode.key, 0]]);
  const fScore = new Map([[startNode.key, haversineDistanceKm(origin, destination)]]);

  function getNeighbors(nodeKey) {
    if (nodeKey === startNode.key) {
      const neighbors = [...startNeighbors];
      if (!segmentCrossesAvoidance(origin, destination, avoidRegions)) {
        neighbors.push(endNode);
      }
      return neighbors;
    }

    if (nodeKey === endNode.key) {
      return [];
    }

    const neighbors = [...(neighborLookup.get(nodeKey) ?? [])];
    const currentNode = nodeLookup.get(nodeKey);
    if (
      currentNode &&
      endNeighborKeys.has(nodeKey) &&
      !segmentCrossesAvoidance(currentNode, destination, avoidRegions)
    ) {
      neighbors.push(endNode);
    }
    return neighbors;
  }

  while (openSet.size) {
    let currentKey = null;
    let bestScore = Infinity;
    openSet.forEach((key) => {
      const score = fScore.get(key) ?? Infinity;
      if (score < bestScore) {
        bestScore = score;
        currentKey = key;
      }
    });

    if (!currentKey) break;
    if (currentKey === endNode.key) {
      return reconstructPath(cameFrom, endNode.key, nodeLookup);
    }

    openSet.delete(currentKey);
    const currentNode = nodeLookup.get(currentKey);

    getNeighbors(currentKey).forEach((neighbor) => {
      const tentativeGScore =
        (gScore.get(currentKey) ?? Infinity) + haversineDistanceKm(currentNode, neighbor);

      if (tentativeGScore >= (gScore.get(neighbor.key) ?? Infinity)) {
        return;
      }

      cameFrom.set(neighbor.key, currentKey);
      gScore.set(neighbor.key, tentativeGScore);
      fScore.set(
        neighbor.key,
        tentativeGScore + haversineDistanceKm(neighbor, destination)
      );
      openSet.add(neighbor.key);
    });
  }

  return null;
}

function simplifyPath(path) {
  if (path.length <= 2) return path;
  const simplified = [path[0]];
  for (let index = 1; index < path.length - 1; index += 1) {
    const previous = simplified[simplified.length - 1];
    const current = path[index];
    const next = path[index + 1];
    const latStep1 = Math.sign(current.lat - previous.lat);
    const lonStep1 = Math.sign(normalizeLongitude(current.lon - previous.lon));
    const latStep2 = Math.sign(next.lat - current.lat);
    const lonStep2 = Math.sign(normalizeLongitude(next.lon - current.lon));
    if (latStep1 === latStep2 && lonStep1 === lonStep2) {
      continue;
    }
    simplified.push(current);
  }
  simplified.push(path[path.length - 1]);
  return simplified;
}

function buildRoutePlan(origin, destination, avoidRegions) {
  const directSegments = buildRouteSegments([origin, destination]);
  const directIntersectsRussia = routeIntersectsRussia(directSegments[0].points);
  const directIntersectsMiddleEast = routeIntersectsMiddleEast(
    directSegments[0].points
  );

  if (
    (!avoidRegions.russia || !directIntersectsRussia) &&
    (!avoidRegions.middleEast || !directIntersectsMiddleEast)
  ) {
    return {
      mode: "direct",
      directIntersectsRussia,
      directIntersectsMiddleEast,
      waypoints: [origin, destination],
      segments: directSegments,
    };
  }

  const path = findAvoidancePath(origin, destination, avoidRegions);
  if (path) {
    const simplifiedPath = simplifyPath(path).map((point, index) => ({
      ...point,
      label:
        index === 0 || index === path.length - 1
          ? point.label
          : undefined,
    }));
    return {
      mode: "avoided",
      directIntersectsRussia,
      directIntersectsMiddleEast,
      waypoints: simplifiedPath,
      segments: buildRouteSegments(simplifiedPath),
    };
  }

  return {
    mode: "fallback-direct",
    directIntersectsRussia,
    directIntersectsMiddleEast,
    waypoints: [origin, destination],
    segments: directSegments,
  };
}

function getAvoidanceOverlays() {
  return {
    russia: {
      polygons: getRussiaAvoidancePolygons(),
      label: "Russia avoidance zone",
    },
    middleEast: {
      bounds: [
        [12, 32],
        [42, 63],
      ],
      label: "Middle East avoidance zone",
    },
  };
}

function renderRouteMapContainer() {
  return `<div id="route-map-leaflet" class="route-map route-map-leaflet" aria-label="Great circle route map"></div>`;
}

function splitRoutePointsForMap(points) {
  const groups = [];
  let currentGroup = [];

  points.forEach((point, index) => {
    const previous = points[index - 1];
    if (previous && Math.abs(point.lon - previous.lon) > 180) {
      if (currentGroup.length) groups.push(currentGroup);
      currentGroup = [];
    }
    currentGroup.push([point.lat, point.lon]);
  });

  if (currentGroup.length) {
    groups.push(currentGroup);
  }

  return groups;
}

function duplicateLatLngGroupsForWrap(groups) {
  return groups.flatMap((group) =>
    [-360, 0, 360].map((shift) =>
      group.map(([lat, lon]) => [lat, lon + shift])
    )
  );
}

function duplicatePolygonForWrap(polygon) {
  return [-360, 0, 360].map((shift) =>
    polygon.map(([lat, lon]) => [lat, lon + shift])
  );
}

function duplicateBoundsForWrap(bounds) {
  return [-360, 0, 360].map((shift) => [
    [bounds[0][0], bounds[0][1] + shift],
    [bounds[1][0], bounds[1][1] + shift],
  ]);
}

function initRouteLeafletMap(origin, destination, routePlans, avoidRegions) {
  const container = document.getElementById("route-map-leaflet");
  if (!container || typeof window.L === "undefined") return;

  if (container._leaflet_id) {
    container._leaflet_id = null;
    container.innerHTML = "";
  }

  const map = window.L.map(container, {
    worldCopyJump: true,
    attributionControl: true,
  });

  window.L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 10,
    minZoom: 2,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  const overlays = getAvoidanceOverlays();
  Object.entries(avoidRegions)
    .filter(([, enabled]) => enabled)
    .forEach(([key]) => {
      const overlay = overlays[key];
      if (overlay.polygons) {
        overlay.polygons.forEach((polygon) => {
          duplicatePolygonForWrap(polygon).forEach((wrappedPolygon) => {
            window.L.polygon(wrappedPolygon, {
              color: "#e56b5d",
              weight: 2,
              dashArray: "8 6",
              fillOpacity: 0.12,
            })
              .bindTooltip(overlay.label, { sticky: true })
              .addTo(map);
          });
        });
      } else {
        duplicateBoundsForWrap(overlay.bounds).forEach((wrappedBounds) => {
          window.L.rectangle(wrappedBounds, {
            color: "#e56b5d",
            weight: 2,
            dashArray: "8 6",
            fillOpacity: 0.12,
          })
            .bindTooltip(overlay.label, { sticky: true })
            .addTo(map);
        });
      }
    });

  const palette = [
    {
      color: "#1b5cff",
      dashArray: null,
      haloColor: "rgba(27, 92, 255, 0.18)",
      haloWeight: 10,
    },
    {
      color: "#1b5cff",
      dashArray: "10 7",
      haloColor: "rgba(27, 92, 255, 0.28)",
      haloWeight: 12,
    },
  ];

  routePlans.forEach((routePlan, index) => {
    const style = palette[index] ?? palette[palette.length - 1];
    routePlan.segments.forEach((segment) => {
      duplicateLatLngGroupsForWrap(splitRoutePointsForMap(segment.points)).forEach(
        (pointGroup) => {
        if (style.haloColor) {
          window.L.polyline(pointGroup, {
            color: style.haloColor,
            weight: style.haloWeight ?? 10,
            opacity: 1,
            interactive: false,
          }).addTo(map);
        }
        window.L.polyline(pointGroup, {
          color: style.color,
          weight: 4,
          opacity: 0.9,
          dashArray: style.dashArray,
        }).addTo(map);
        }
      );
    });
  });

  [-360, 0, 360].forEach((shift) => {
    window.L.circleMarker([origin.lat, origin.lon + shift], {
      radius: 6,
      color: "#1b5cff",
      fillColor: "#1b5cff",
      fillOpacity: 1,
      weight: 2,
    })
      .bindTooltip(`${origin.code}: ${origin.title}`)
      .addTo(map);

    window.L.circleMarker([destination.lat, destination.lon + shift], {
      radius: 6,
      color: "#1b5cff",
      fillColor: "#1b5cff",
      fillOpacity: 1,
      weight: 2,
    })
      .bindTooltip(`${destination.code}: ${destination.title}`)
      .addTo(map);
  });

  const bounds = window.L.latLngBounds([
    [origin.lat, origin.lon],
    [destination.lat, destination.lon],
  ]);
  map.fitBounds(bounds.pad(0.7));
  map.setMaxBounds(null);
}

function renderRouteSummaryCard(title, routePlan, toneClass = "") {
  const totalDistanceKm = routePlan.segments.reduce(
    (sum, segment) => sum + segment.distanceKm,
    0
  );
  const routeTypeLabel =
    routePlan.mode === "avoided"
      ? "Avoidance path search"
      : routePlan.mode === "fallback-direct"
      ? "Direct fallback"
      : "Direct great circle";
  const estimatedHours = routePlan.estimatedHours ?? 0;

  return `
    <div class="route-stat-card ${toneClass}">
      <strong>${escapeHtml(title)}</strong>
      <span>${escapeHtml(routeTypeLabel)}</span>
      <span>${Math.round(totalDistanceKm).toLocaleString()} km</span>
      <span>${formatDurationHours(estimatedHours)}</span>
    </div>
  `;
}

function renderGreatCircleRouteResult(
  origin,
  destination,
  directPlan,
  avoidedPlan,
  options
) {
  const directDistanceKm = haversineDistanceKm(origin, destination);
  const showingComparison = Boolean(avoidedPlan && options.compareDirect);
  const primaryPlan = showingComparison
    ? directPlan
    : avoidedPlan ?? directPlan;
  const routePlans = showingComparison ? [directPlan, avoidedPlan] : [primaryPlan];
  const avoidanceSummary = [];
  const aircraft = AIRCRAFT_PROFILES[options.aircraftCode];
  if (options.avoidRegions.russia) avoidanceSummary.push("Russia");
  if (options.avoidRegions.middleEast) avoidanceSummary.push("Middle East");

  return `
    <div class="route-results">
      <div class="route-stat-grid">
        <div class="route-stat-card">
          <strong>Origin</strong>
          <span>${escapeHtml(origin.code)}: ${escapeHtml(origin.title)}</span>
        </div>
        <div class="route-stat-card">
          <strong>Destination</strong>
          <span>${escapeHtml(destination.code)}: ${escapeHtml(destination.title)}</span>
        </div>
        <div class="route-stat-card">
          <strong>Direct distance</strong>
          <span>${Math.round(directDistanceKm).toLocaleString()} km</span>
        </div>
        <div class="route-stat-card">
          <strong>Avoidance</strong>
          <span>${avoidanceSummary.length ? escapeHtml(avoidanceSummary.join(", ")) : "None"}</span>
        </div>
        <div class="route-stat-card">
          <strong>Aircraft</strong>
          <span>${escapeHtml(aircraft.label)}</span>
          <span>Cruise ${aircraft.cruiseKmh} km/h</span>
        </div>
        ${renderRouteSummaryCard(
          showingComparison ? "Direct route" : "Displayed route",
          primaryPlan,
          showingComparison ? "route-stat-card-direct" : ""
        )}
        ${
          showingComparison
            ? renderRouteSummaryCard("Avoided route", avoidedPlan, "route-stat-card-avoided")
            : ""
        }
      </div>
      ${renderRouteMapContainer()}
      <div class="warning">
        <strong>Note:</strong> Airspace avoidance now uses a coarse grid-based path search around blocked regions. It is more realistic than fixed waypoints, but it is still not an operational flight-planning engine.
      </div>
      <div class="loading route-note">
        ${showingComparison
          ? "Blue shows the direct route. Coral shows the heuristic avoided route."
          : primaryPlan.mode === "avoided"
            ? "Coral shows the heuristic avoided route."
            : "Blue shows the direct route."}
      </div>
    </div>
  `;
}

function estimateRouteHours(routePlan, aircraftCode) {
  const aircraft = AIRCRAFT_PROFILES[aircraftCode] ?? AIRCRAFT_PROFILES.b77w;
  const totalDistanceKm = routePlan.segments.reduce(
    (sum, segment) => sum + segment.distanceKm,
    0
  );
  return totalDistanceKm / aircraft.cruiseKmh;
}

function formatFetchedAt(timestamp) {
  if (!timestamp) return "";
  return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDurationHours(hours) {
  const totalMinutes = Math.round(hours * 60);
  const wholeHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${wholeHours}h ${String(minutes).padStart(2, "0")}m est.`;
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
        commonCount: common.length,
        only1Count: only1.length,
        only2Count: only2.length,
        totalCount: common.length + only1.length + only2.length,
      });
    }
  });

  return result;
}

function getVisibleAirlines(airlines, state, getCount) {
  const normalizedQuery = state.query.trim().toLowerCase();
  const minDestinations = Number.parseInt(state.minDestinations, 10);
  const maxDestinations = Number.parseInt(state.maxDestinations, 10);
  const hasMinDestinations = Number.isFinite(minDestinations) && minDestinations >= 0;
  const hasMaxDestinations = Number.isFinite(maxDestinations) && maxDestinations >= 0;
  const selectedAirlines = new Set(state.selectedAirlines);
  const selectionActive = state.selectionEnabled;

  return airlines.filter((airline) => {
    if (airline === "All Airlines") return true;

    if (normalizedQuery && !airline.toLowerCase().includes(normalizedQuery)) {
      return false;
    }

    const count = getCount(airline);
    if (hasMinDestinations && count < minDestinations) {
      return false;
    }
    if (hasMaxDestinations && count > maxDestinations) {
      return false;
    }

    if (selectionActive && !selectedAirlines.has(airline)) {
      return false;
    }

    return true;
  });
}

function sortRows(rows, state) {
  const directionMultiplier = state.direction === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    if (a.airline === "All Airlines") return -1;
    if (b.airline === "All Airlines") return 1;

    const left = a[state.key];
    const right = b[state.key];

    if (typeof left === "number" && typeof right === "number") {
      if (left !== right) {
        return (left - right) * directionMultiplier;
      }
      return a.airline.localeCompare(b.airline);
    }

    if (left !== right) {
      return left.localeCompare(right) * directionMultiplier;
    }
    return a.airline.localeCompare(b.airline);
  });
}

function renderSortButton(label, key, state) {
  const active = state.key === key;
  const arrow = active ? (state.direction === "asc" ? " ↑" : " ↓") : "";
  return `<button class="sort-button${active ? " active" : ""}" data-sort-key="${escapeHtml(
    key
  )}">${escapeHtml(label)}${arrow}</button>`;
}

function renderAirlineFilterPanel(options) {
  const {
    prefix,
    airlines,
    visibleAirlines,
    state,
    countLabel,
    getCount,
    title,
    extraControlsHtml = "",
  } = options;
  const selectedAirlines = new Set(state.selectedAirlines);
  const displayAirlines = airlines.filter((airline) => airline !== "All Airlines");
  const visibleCount = visibleAirlines.filter(
    (airline) => airline !== "All Airlines"
  ).length;
  const counts = displayAirlines.map((airline) => getCount(airline));
  const maxAvailableCount = counts.length ? Math.max(...counts) : 0;
  const minValue = state.minDestinations === "" ? 0 : Number(state.minDestinations);
  const maxValue =
    state.maxDestinations === "" ? maxAvailableCount : Number(state.maxDestinations);
  const uiState = filterUiState[prefix];

  let html = `
    <section class="filter-panel">
      <div class="filter-panel-row">
        <strong>${escapeHtml(title)}</strong>
        <span class="filter-summary">${visibleCount} of ${displayAirlines.length} airlines shown</span>
      </div>
      <details class="filter-panel-details" ${uiState.panelOpen ? "open" : ""}>
        <summary>Filter controls</summary>
        <div class="filter-panel-body">
          <div class="filter-panel-row filter-actions">
            <label>
              <span>Airline search</span>
              <input
                class="filter-input"
                id="${prefix}-airline-query"
                type="text"
                placeholder="Filter airline names"
                value="${escapeHtml(state.query)}"
              >
            </label>
            <label>
              <span>Min destinations</span>
              <input
                class="filter-input filter-threshold"
                id="${prefix}-min-destinations"
                type="number"
                min="0"
                max="${maxAvailableCount}"
                step="1"
                placeholder="0"
                value="${escapeHtml(String(state.minDestinations ?? ""))}"
              >
            </label>
            <label>
              <span>Max destinations</span>
              <input
                class="filter-input filter-threshold"
                id="${prefix}-max-destinations"
                type="number"
                min="0"
                max="${maxAvailableCount}"
                step="1"
                placeholder="Any"
                value="${escapeHtml(String(state.maxDestinations ?? ""))}"
              >
            </label>
          </div>
          <div class="filter-panel-row filter-range-row">
            <label class="filter-range-control">
              <span>Min slider: <strong>${minValue}</strong></span>
              <input
                class="filter-range"
                id="${prefix}-min-slider"
                type="range"
                min="0"
                max="${maxAvailableCount}"
                step="1"
                value="${minValue}"
              >
            </label>
            <label class="filter-range-control">
              <span>Max slider: <strong>${maxValue}</strong></span>
              <input
                class="filter-range"
                id="${prefix}-max-slider"
                type="range"
                min="0"
                max="${maxAvailableCount}"
                step="1"
                value="${maxValue}"
              >
            </label>
          </div>
          <div class="filter-panel-row filter-actions">
            <button type="button" class="filter-quick-button" data-filter-prefix="${prefix}" data-airline-action="select-all">Select all</button>
            <button type="button" class="filter-quick-button" data-filter-prefix="${prefix}" data-airline-action="unselect-all">Unselect all</button>
            <button type="button" class="filter-quick-button" data-filter-prefix="${prefix}" data-airline-action="select-visible">Select visible</button>
            <button type="button" class="filter-quick-button" data-filter-prefix="${prefix}" data-airline-action="clear-selection">Clear selection</button>
            <button type="button" class="filter-quick-button" data-filter-prefix="${prefix}" data-airline-action="clear-range">Clear range</button>
            <button type="button" class="filter-quick-button" data-filter-prefix="${prefix}" data-airline-action="reset-filters">Reset filters</button>
          </div>
          ${extraControlsHtml}
          <details class="filter-airline-details" ${uiState.airlinesOpen ? "open" : ""}>
            <summary>Select airlines</summary>
            <div class="filter-airline-detail-actions">
              <button type="button" class="filter-quick-button" data-filter-prefix="${prefix}" data-airline-action="select-all">Select all</button>
              <button type="button" class="filter-quick-button" data-filter-prefix="${prefix}" data-airline-action="unselect-all">Select none</button>
            </div>
            <div class="filter-airline-grid">
  `;

  displayAirlines.forEach((airline) => {
    const checked = !state.selectionEnabled || selectedAirlines.has(airline);
    html += `
      <label class="filter-airline-option">
        <input
          type="checkbox"
          data-filter-prefix="${prefix}"
          data-airline-checkbox="${escapeHtml(airline)}"
          ${checked ? "checked" : ""}
        >
        <span>${escapeHtml(airline)}</span>
        <span class="filter-count">${escapeHtml(countLabel(getCount(airline)))}</span>
      </label>
    `;
  });

  html += `
            </div>
          </details>
        </div>
      </details>
    </section>
  `;

  return html;
}

function renderComparisonViewToggle() {
  return `
    <div class="view-toggle view-toggle-inline" role="tablist" aria-label="Comparison view">
      <button
        class="view-toggle-button${comparisonViewMode === "table" ? " active" : ""}"
        type="button"
        data-comparison-view="table"
      >
        Airline Comparison
      </button>
      <button
        class="view-toggle-button${comparisonViewMode === "matrix" ? " active" : ""}"
        type="button"
        data-comparison-view="matrix"
      >
        Destination Matrix
      </button>
    </div>
  `;
}

function buildComparisonDestinationRows(
  destinations1,
  destinations2,
  visibleAirlines
) {
  const destinationSet = new Set();

  visibleAirlines.forEach((airline) => {
    if (airline === "All Airlines") return;
    (destinations1.get(airline) ?? new Set()).forEach((destination) => {
      destinationSet.add(destination);
    });
    (destinations2.get(airline) ?? new Set()).forEach((destination) => {
      destinationSet.add(destination);
    });
  });

  return [...destinationSet]
    .map((destination) => {
      const atCode1 = visibleAirlines.some((airline) =>
        airline !== "All Airlines" &&
        (destinations1.get(airline) ?? new Set()).has(destination)
      );
      const atCode2 = visibleAirlines.some((airline) =>
        airline !== "All Airlines" &&
        (destinations2.get(airline) ?? new Set()).has(destination)
      );
      return {
        destination,
        coverage: Number(atCode1) + Number(atCode2),
        atCode1,
        atCode2,
      };
    })
    .sort((a, b) => {
      if (a.coverage !== b.coverage) {
        return b.coverage - a.coverage;
      }
      return a.destination.localeCompare(b.destination);
    });
}

function renderComparisonMatrixResults(
  code1,
  code2,
  title1,
  title2,
  merged,
  destinations1,
  destinations2
) {
  const allAirlines = merged.map((row) => row.airline);
  const visibleAirlines = getVisibleAirlines(
    allAirlines,
    comparisonFilterState,
    (airline) => merged.find((row) => row.airline === airline)?.totalCount ?? 0
  );
  const rows = buildComparisonDestinationRows(
    destinations1,
    destinations2,
    visibleAirlines
  );

  let html = `
    <h3>Destination Matrix: ${escapeHtml(code1)} vs ${escapeHtml(code2)}</h3>
    <p><strong>${escapeHtml(code1)}</strong>: ${escapeHtml(title1)}<br><strong>${escapeHtml(
      code2
    )}</strong>: ${escapeHtml(title2)}</p>
    ${renderComparisonViewToggle()}
    ${renderAirlineFilterPanel({
      prefix: "comparison",
      airlines: allAirlines,
      visibleAirlines,
      state: comparisonFilterState,
      countLabel: (count) => `${count} destinations`,
      getCount: (airline) =>
        merged.find((row) => row.airline === airline)?.totalCount ?? 0,
      title: "Airline filters",
    })}
    <div class="matrix-meta">
      <span>${rows.length} destinations</span>
      <span>Rows sort with shared destinations first</span>
    </div>
  `;

  if (!rows.length) {
    html += `
      <div class="warning">
        <strong>Note:</strong> No destinations match the current airline filters.
      </div>
    `;
    return html;
  }

  html += `
    <div class="results-table-wrap">
      <table class="matrix-table comparison-matrix-table">
        <thead>
          <tr>
            <th class="matrix-sticky-col matrix-sticky-col-1">Destination</th>
            <th class="matrix-sticky-col matrix-sticky-col-2">Airports Serving</th>
            <th>${escapeHtml(code1)}</th>
            <th>${escapeHtml(code2)}</th>
          </tr>
        </thead>
        <tbody>
  `;

  rows.forEach((row) => {
    html += `
      <tr>
        <td class="matrix-destination matrix-sticky-col matrix-sticky-col-1"><strong>${escapeHtml(
          row.destination
        )}</strong></td>
        <td class="matrix-coverage matrix-sticky-col matrix-sticky-col-2">${row.coverage}</td>
        <td class="matrix-cell">${row.atCode1 ? '<span class="matrix-mark">●</span>' : ""}</td>
        <td class="matrix-cell">${row.atCode2 ? '<span class="matrix-mark">●</span>' : ""}</td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
    <div class="warning">
      <strong>Note:</strong> Rows are destinations, columns are airports, and a filled cell indicates that airport has service to that destination.
      Data sourced from <a href="https://en.wikipedia.org" target="_blank" rel="noopener">Wikipedia</a>${escapeHtml(currentComparisonResult?.fetchedAt ? ` · Fetched at ${formatFetchedAt(currentComparisonResult.fetchedAt)}` : "")}.
    </div>
  `;

  return html;
}

function renderComparisonResults(code1, code2, title1, title2, merged) {
  const allAirlines = merged.map((row) => row.airline);
  const visibleAirlines = getVisibleAirlines(
    allAirlines,
    comparisonFilterState,
    (airline) => merged.find((row) => row.airline === airline)?.totalCount ?? 0
  );
  const filteredRows = merged.filter((row) => visibleAirlines.includes(row.airline));
  const sortedRows = sortRows(filteredRows, comparisonSortState);

  let html = `
    <h3>Destination Comparison: ${escapeHtml(code1)} vs ${escapeHtml(code2)}</h3>
    <p><strong>${escapeHtml(code1)}</strong>: ${escapeHtml(title1)}<br><strong>${escapeHtml(
      code2
    )}</strong>: ${escapeHtml(title2)}</p>
    ${renderComparisonViewToggle()}
    ${renderAirlineFilterPanel({
      prefix: "comparison",
      airlines: allAirlines,
      visibleAirlines,
      state: comparisonFilterState,
      countLabel: (count) => `${count} destinations`,
      getCount: (airline) =>
        merged.find((row) => row.airline === airline)?.totalCount ?? 0,
      title: "Airline filters",
    })}
  `;

  if (!sortedRows.length) {
    html += `
      <div class="warning">
        <strong>Note:</strong> No airlines match the current filters.
      </div>
    `;
    return html;
  }

  html += `
    <div class="results-table-wrap">
      <table>
        <thead>
          <tr>
            <th>${renderSortButton("Airline", "airline", comparisonSortState)}</th>
            <th>${renderSortButton("Common Count", "commonCount", comparisonSortState)}</th>
            <th>${renderSortButton(`${code1} Count`, "only1Count", comparisonSortState)}</th>
            <th>${renderSortButton(`${code2} Count`, "only2Count", comparisonSortState)}</th>
            <th>${renderSortButton("Total Count", "totalCount", comparisonSortState)}</th>
            <th>Common Destinations</th>
            <th>Only at ${escapeHtml(code1)}</th>
            <th>Only at ${escapeHtml(code2)}</th>
          </tr>
        </thead>
        <tbody>
  `;

  sortedRows.forEach(
    ({
      airline,
      common,
      only1,
      only2,
      commonCount,
      only1Count,
      only2Count,
      totalCount,
    }) => {
      html += `
      <tr>
        <td><strong>${escapeHtml(airline)}</strong></td>
        <td>${commonCount}</td>
        <td>${only1Count}</td>
        <td>${only2Count}</td>
        <td>${totalCount}</td>
        <td>${common.length ? escapeHtml(common.join(", ")) : '<span class="empty-cell">None</span>'}</td>
        <td>${only1.length ? escapeHtml(only1.join(", ")) : '<span class="empty-cell">None</span>'}</td>
        <td>${only2.length ? escapeHtml(only2.join(", ")) : '<span class="empty-cell">None</span>'}</td>
      </tr>
    `;
    }
  );

  const fetchedAtLabel = currentComparisonResult?.fetchedAt
    ? ` · Fetched at ${formatFetchedAt(currentComparisonResult.fetchedAt)}`
    : "";

  html += `
        </tbody>
      </table>
    </div>
    <div class="warning">
      <strong>Note:</strong> Results come from Wikipedia destination tables and can vary by page completeness.
      Data sourced from <a href="https://en.wikipedia.org" target="_blank" rel="noopener">Wikipedia</a>${escapeHtml(fetchedAtLabel)}.
    </div>
  `;

  return html;
}

function toggleComparisonSort(key) {
  if (comparisonSortState.key === key) {
    comparisonSortState.direction =
      comparisonSortState.direction === "asc" ? "desc" : "asc";
  } else {
    comparisonSortState.key = key;
    comparisonSortState.direction = key === "airline" ? "asc" : "desc";
  }
}

function buildMatrixData(destinationsMap, visibleAirlines = null) {
  const airlines = [...destinationsMap.keys()]
    .filter((airline) => airline !== "__ALL__")
    .sort((a, b) => a.localeCompare(b))
    .filter((airline) => !visibleAirlines || visibleAirlines.includes(airline));

  const destinationSet = new Set();
  airlines.forEach((airline) => {
    destinationsMap.get(airline).forEach((destination) => {
      destinationSet.add(destination);
    });
  });

  const rows = [...destinationSet].map((destination) => {
    const servingAirlines = airlines.filter((airline) =>
      destinationsMap.get(airline).has(destination)
    );

    return {
      destination,
      servingAirlines,
      coverage: servingAirlines.length,
    };
  });

  return { airlines, rows };
}

function filterMatrixRows(rows, airlines, state) {
  if (!state.showUniqueDestinations && !state.showCommonDestinations) {
    return rows;
  }

  return rows.filter((row) => {
    const isUnique = row.coverage === 1;
    const isCommon = airlines.length > 0 && row.coverage === airlines.length;

    if (state.showUniqueDestinations && state.showCommonDestinations) {
      return isUnique || isCommon;
    }

    if (state.showUniqueDestinations) {
      return isUnique;
    }

    return isCommon;
  });
}

function sortMatrixRows(rows) {
  const directionMultiplier = matrixSortState.direction === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    if (matrixSortState.key === "coverage") {
      if (a.coverage !== b.coverage) {
        return (a.coverage - b.coverage) * directionMultiplier;
      }
      return a.destination.localeCompare(b.destination);
    }

    if (a.destination !== b.destination) {
      return a.destination.localeCompare(b.destination) * directionMultiplier;
    }
    return a.coverage - b.coverage;
  });
}

function renderMatrixResults(code, title, destinationsMap) {
  const allAirlines = [...destinationsMap.keys()]
    .filter((airline) => airline !== "__ALL__")
    .sort((a, b) => a.localeCompare(b));
  const visibleAirlines = getVisibleAirlines(
    allAirlines,
    matrixFilterState,
    (airline) => destinationsMap.get(airline)?.size ?? 0
  );
  const { airlines, rows } = buildMatrixData(destinationsMap, visibleAirlines);
  const filteredRows = filterMatrixRows(rows, airlines, matrixFilterState);
  const sortedRows = sortMatrixRows(filteredRows);
  const destinationModeSummary =
    matrixFilterState.showUniqueDestinations && matrixFilterState.showCommonDestinations
      ? "Showing destinations unique to one selected airline or common to all selected airlines"
      : matrixFilterState.showUniqueDestinations
        ? "Showing destinations unique to one selected airline"
        : matrixFilterState.showCommonDestinations
          ? "Showing destinations common to all selected airlines"
          : "Showing all destinations for the selected airlines";

  let html = `
    <h3>Airline Destination Matrix: ${escapeHtml(code)}</h3>
    <p><strong>${escapeHtml(code)}</strong>: ${escapeHtml(title)}</p>
    <div class="matrix-meta">
      <span>${airlines.length} airlines</span>
      <span>${filteredRows.length} destinations</span>
      <span>${escapeHtml(destinationModeSummary)}</span>
    </div>
    ${renderAirlineFilterPanel({
      prefix: "matrix",
      airlines: allAirlines,
      visibleAirlines,
      state: matrixFilterState,
      countLabel: (count) => `${count} destinations`,
      getCount: (airline) => destinationsMap.get(airline)?.size ?? 0,
      title: "Airline filters",
      extraControlsHtml: `
        <div class="filter-panel-row filter-toggle-group">
          <label class="filter-chip-toggle">
            <input
              type="checkbox"
              id="matrix-show-unique-destinations"
              ${matrixFilterState.showUniqueDestinations ? "checked" : ""}
            >
            <span>Unique to one selected airline</span>
          </label>
          <label class="filter-chip-toggle">
            <input
              type="checkbox"
              id="matrix-show-common-destinations"
              ${matrixFilterState.showCommonDestinations ? "checked" : ""}
            >
            <span>Common to all selected airlines</span>
          </label>
        </div>
      `,
    })}
  `;

  if (!airlines.length) {
    html += `
      <div class="warning">
        <strong>Note:</strong> No airlines match the current filters.
      </div>
    `;
    return html;
  }

  if (!sortedRows.length) {
    html += `
      <div class="warning">
        <strong>Note:</strong> No destinations match the current airline and destination filters.
      </div>
    `;
    return html;
  }

  html += `
    <div class="results-table-wrap">
      <table class="matrix-table">
        <thead>
          <tr>
            <th class="matrix-sticky-col matrix-sticky-col-1">${renderSortButton(
              "Destination",
              "destination",
              matrixSortState
            )}</th>
            <th class="matrix-sticky-col matrix-sticky-col-2">${renderSortButton(
              "Airlines Serving",
              "coverage",
              matrixSortState
            )}</th>
  `;

  airlines.forEach((airline) => {
    html += `<th class="matrix-airline"><span class="matrix-airline-label">${escapeHtml(
      airline
    )}</span></th>`;
  });

  html += `
          </tr>
        </thead>
        <tbody>
  `;

  sortedRows.forEach((row) => {
    html += `
      <tr>
        <td class="matrix-destination matrix-sticky-col matrix-sticky-col-1"><strong>${escapeHtml(
          row.destination
        )}</strong></td>
        <td class="matrix-coverage matrix-sticky-col matrix-sticky-col-2">${row.coverage}</td>
    `;

    airlines.forEach((airline) => {
      const hasRoute = destinationsMap.get(airline).has(row.destination);
      html += `<td class="matrix-cell">${hasRoute ? '<span class="matrix-mark">●</span>' : ""}</td>`;
    });

    html += `</tr>`;
  });

  const fetchedAtLabel = currentMatrixResult?.fetchedAt
    ? ` · Fetched at ${formatFetchedAt(currentMatrixResult.fetchedAt)}`
    : "";

  html += `
        </tbody>
      </table>
    </div>
    <div class="warning">
      <strong>Note:</strong> Rows are destinations, columns are airlines, and a filled cell indicates that airline serves that destination.
      Data sourced from <a href="https://en.wikipedia.org" target="_blank" rel="noopener">Wikipedia</a>${escapeHtml(fetchedAtLabel)}.
    </div>
  `;

  return html;
}

function toggleMatrixSort(key) {
  if (matrixSortState.key === key) {
    matrixSortState.direction =
      matrixSortState.direction === "asc" ? "desc" : "asc";
  } else {
    matrixSortState.key = key;
    matrixSortState.direction = key === "destination" ? "asc" : "desc";
  }
}

function bindFilterControls(prefix, state, rerender, getAllAirlines) {
  const queryInput = document.getElementById(`${prefix}-airline-query`);
  if (queryInput) {
    queryInput.addEventListener("input", (event) => {
      captureFilterUiState(prefix);
      state.query = event.target.value;
      rerender();
    });
  }

  const thresholdInput = document.getElementById(`${prefix}-max-destinations`);
  if (thresholdInput) {
    thresholdInput.addEventListener("input", (event) => {
      captureFilterUiState(prefix);
      state.maxDestinations = event.target.value;
      syncRangeState(prefix, state);
      rerender();
    });
  }

  const minInput = document.getElementById(`${prefix}-min-destinations`);
  if (minInput) {
    minInput.addEventListener("input", (event) => {
      captureFilterUiState(prefix);
      state.minDestinations = event.target.value;
      syncRangeState(prefix, state);
      rerender();
    });
  }

  const minSlider = document.getElementById(`${prefix}-min-slider`);
  if (minSlider) {
    minSlider.addEventListener("input", (event) => {
      captureFilterUiState(prefix);
      state.minDestinations = event.target.value;
      syncRangeState(prefix, state);
      rerender();
    });
  }

  const maxSlider = document.getElementById(`${prefix}-max-slider`);
  if (maxSlider) {
    maxSlider.addEventListener("input", (event) => {
      captureFilterUiState(prefix);
      state.maxDestinations = event.target.value;
      syncRangeState(prefix, state);
      rerender();
    });
  }

  if (prefix === "matrix") {
    const uniqueToggle = document.getElementById("matrix-show-unique-destinations");
    if (uniqueToggle) {
      uniqueToggle.addEventListener("change", (event) => {
        captureFilterUiState(prefix);
        state.showUniqueDestinations = event.target.checked;
        rerender();
      });
    }

    const commonToggle = document.getElementById("matrix-show-common-destinations");
    if (commonToggle) {
      commonToggle.addEventListener("change", (event) => {
        captureFilterUiState(prefix);
        state.showCommonDestinations = event.target.checked;
        rerender();
      });
    }
  }

  document
    .querySelectorAll(`[data-filter-prefix="${prefix}"][data-airline-action]`)
    .forEach((button) => {
      button.addEventListener("click", () => {
        captureFilterUiState(prefix);
        const airlines = getAllAirlines();
        const visibleAirlines = getVisibleAirlines(airlines, state, (airline) =>
          getAirlineCount(prefix, airline)
        ).filter((airline) => airline !== "All Airlines");

        if (button.dataset.airlineAction === "select-all") {
          state.selectionEnabled = true;
          state.selectedAirlines = [...airlines];
        } else if (button.dataset.airlineAction === "unselect-all") {
          state.selectionEnabled = true;
          state.selectedAirlines = [];
        } else if (button.dataset.airlineAction === "select-visible") {
          state.selectionEnabled = true;
          state.selectedAirlines = [...visibleAirlines];
        } else if (button.dataset.airlineAction === "clear-range") {
          state.minDestinations = "";
          state.maxDestinations = "";
          syncRangeState(prefix, state);
        } else if (button.dataset.airlineAction === "reset-filters") {
          state.query = "";
          state.minDestinations = "";
          state.maxDestinations = "";
          state.selectedAirlines = [];
          state.selectionEnabled = false;
          if (prefix === "matrix") {
            state.showUniqueDestinations = false;
            state.showCommonDestinations = false;
          }
          const queryInput = document.getElementById(`${prefix}-airline-query`);
          if (queryInput) queryInput.value = "";
          syncRangeState(prefix, state);
        } else {
          state.selectedAirlines = [];
          state.selectionEnabled = false;
        }
        rerender();
      });
    });

  document
    .querySelectorAll(`[data-filter-prefix="${prefix}"][data-airline-checkbox]`)
    .forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        captureFilterUiState(prefix);
        const airline = checkbox.dataset.airlineCheckbox;
        const airlines = getAllAirlines();
        const selected = new Set(
          state.selectionEnabled ? state.selectedAirlines : airlines
        );

        if (checkbox.checked) {
          selected.add(airline);
        } else {
          selected.delete(airline);
        }

        state.selectionEnabled = true;
        state.selectedAirlines =
          selected.size === airlines.length
            ? [...airlines]
            : [...selected].sort((a, b) => a.localeCompare(b));
        rerender();
      });
    });
}

function getAirlineCount(prefix, airline) {
  if (prefix === "comparison") {
    return (
      currentComparisonResult?.merged.find((row) => row.airline === airline)?.totalCount ?? 0
    );
  }

  return currentMatrixResult?.destinationsMap.get(airline)?.size ?? 0;
}

function syncRangeState(prefix, state) {
  const minInput = document.getElementById(`${prefix}-min-destinations`);
  const maxInput = document.getElementById(`${prefix}-max-destinations`);
  const minSlider = document.getElementById(`${prefix}-min-slider`);
  const maxSlider = document.getElementById(`${prefix}-max-slider`);

  const minValue = state.minDestinations === "" ? 0 : Number(state.minDestinations);
  const maxDefault = maxSlider ? Number(maxSlider.max) : 0;
  const maxValue = state.maxDestinations === "" ? maxDefault : Number(state.maxDestinations);

  if (state.minDestinations !== "" && state.maxDestinations !== "" && minValue > maxValue) {
    state.maxDestinations = state.minDestinations;
  }
  if (state.maxDestinations !== "" && state.minDestinations !== "" && maxValue < minValue) {
    state.minDestinations = state.maxDestinations;
  }

  const normalizedMin = state.minDestinations === "" ? 0 : Number(state.minDestinations);
  const normalizedMax =
    state.maxDestinations === "" ? maxDefault : Number(state.maxDestinations);

  if (minInput) minInput.value = state.minDestinations;
  if (maxInput) maxInput.value = state.maxDestinations;
  if (minSlider) minSlider.value = String(normalizedMin);
  if (maxSlider) maxSlider.value = String(normalizedMax);
}

function rerenderComparison() {
  if (!currentComparisonResult) return;

  const { code1, code2, title1, title2, merged, destinations1, destinations2 } =
    currentComparisonResult;
  const output = document.getElementById("output");
  output.innerHTML =
    comparisonViewMode === "matrix"
      ? renderComparisonMatrixResults(
          code1,
          code2,
          title1,
          title2,
          merged,
          destinations1,
          destinations2
        )
      : renderComparisonResults(code1, code2, title1, title2, merged);

  bindComparisonViewControls();

  if (comparisonViewMode === "table") {
    document.querySelectorAll("#output [data-sort-key]").forEach((button) => {
      button.addEventListener("click", () => {
        toggleComparisonSort(button.dataset.sortKey);
        rerenderComparison();
      });
    });

    bindFilterControls(
      "comparison",
      comparisonFilterState,
      rerenderComparison,
      () =>
        merged
          .map((row) => row.airline)
          .filter((airline) => airline !== "All Airlines")
    );
    restoreFilterUiState("comparison");
  } else {
    bindFilterControls(
      "comparison",
      comparisonFilterState,
      rerenderComparison,
      () =>
        merged
          .map((row) => row.airline)
          .filter((airline) => airline !== "All Airlines")
    );
    restoreFilterUiState("comparison");
  }
}

function rerenderMatrix() {
  if (!currentMatrixResult) return;

  const { code, title, destinationsMap } = currentMatrixResult;
  const output = document.getElementById("matrix-output");
  output.innerHTML = renderMatrixResults(code, title, destinationsMap);

  document.querySelectorAll("#matrix-output [data-sort-key]").forEach((button) => {
    button.addEventListener("click", () => {
      toggleMatrixSort(button.dataset.sortKey);
      rerenderMatrix();
    });
  });

  bindFilterControls(
    "matrix",
    matrixFilterState,
    rerenderMatrix,
    () => [...destinationsMap.keys()].filter((airline) => airline !== "__ALL__")
  );
  restoreFilterUiState("matrix");
}

async function compareDestinations() {
  const code1 = normalizeAirportCode(document.getElementById("code1").value);
  const code2 = normalizeAirportCode(document.getElementById("code2").value);
  const output = document.getElementById("output");
  const button = document.getElementById("compare-button");

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

    currentComparisonResult = {
      code1,
      code2,
      title1: airport1.title,
      title2: airport2.title,
      destinations1: airport1.destinations,
      destinations2: airport2.destinations,
      merged,
      fetchedAt: Date.now(),
    };
    comparisonFilterState.query = "";
    comparisonFilterState.minDestinations = "";
    comparisonFilterState.maxDestinations = "";
    comparisonFilterState.selectedAirlines = [];
    comparisonFilterState.selectionEnabled = false;
    rerenderComparison();
  } catch (error) {
    console.error(error);
    output.innerHTML = `<div class="error">Error: ${escapeHtml(error.message)}</div>`;
  } finally {
    button.disabled = false;
  }
}

async function buildMatrix() {
  const code = normalizeAirportCode(document.getElementById("matrix-code").value);
  const output = document.getElementById("matrix-output");
  const button = document.getElementById("matrix-button");

  if (!code) {
    output.innerHTML = `<div class="error">Please enter an airport code.</div>`;
    return;
  }

  if (code.length < 3) {
    output.innerHTML = `<div class="error">Please enter a valid airport code (3+ characters).</div>`;
    return;
  }

  button.disabled = true;
  output.innerHTML = `<div class="loading">Building airline destination matrix...</div>`;

  try {
    const airport = await fetchDestinationsForCode(code);
    currentMatrixResult = {
      code,
      title: airport.title,
      destinationsMap: airport.destinations,
      fetchedAt: Date.now(),
    };
    matrixFilterState.query = "";
    matrixFilterState.minDestinations = "";
    matrixFilterState.maxDestinations = "";
    matrixFilterState.selectedAirlines = [];
    matrixFilterState.selectionEnabled = false;
    matrixFilterState.showUniqueDestinations = false;
    matrixFilterState.showCommonDestinations = false;
    rerenderMatrix();
  } catch (error) {
    console.error(error);
    output.innerHTML = `<div class="error">Error: ${escapeHtml(error.message)}</div>`;
  } finally {
    button.disabled = false;
  }
}

async function buildGreatCircleRoute() {
  const originCode = normalizeAirportCode(
    document.getElementById("gcmap-origin").value
  );
  const destinationCode = normalizeAirportCode(
    document.getElementById("gcmap-destination").value
  );
  const options = {
    aircraftCode: document.getElementById("gcmap-aircraft").value,
    avoidRegions: {
      russia: document.getElementById("gcmap-avoid-russia").checked,
      middleEast: document.getElementById("gcmap-avoid-middle-east").checked,
    },
    compareDirect: document.getElementById("gcmap-compare-direct").checked,
  };
  const output = document.getElementById("gcmap-output");
  const button = document.getElementById("gcmap-button");

  if (!originCode || !destinationCode) {
    output.innerHTML = `<div class="error">Please enter both airport codes.</div>`;
    return;
  }

  if (originCode === destinationCode) {
    output.innerHTML = `<div class="error">Please enter two different airport codes.</div>`;
    return;
  }

  button.disabled = true;
  output.innerHTML = `<div class="loading">Calculating route...</div>`;

  try {
    const [origin, destination] = await Promise.all([
      fetchAirportCoordinatesForCode(originCode),
      fetchAirportCoordinatesForCode(destinationCode),
    ]);
    const directPlan = buildRoutePlan(origin, destination, {
      russia: false,
      middleEast: false,
    });
    const needsAvoidedPlan =
      options.avoidRegions.russia || options.avoidRegions.middleEast;
    const rawAvoidedPlan = needsAvoidedPlan
      ? buildRoutePlan(origin, destination, options.avoidRegions)
      : null;
    const avoidedPlan =
      rawAvoidedPlan && rawAvoidedPlan.mode !== "direct" ? rawAvoidedPlan : null;
    directPlan.estimatedHours = estimateRouteHours(directPlan, options.aircraftCode);
    if (avoidedPlan) {
      avoidedPlan.estimatedHours = estimateRouteHours(
        avoidedPlan,
        options.aircraftCode
      );
    }

    output.innerHTML = renderGreatCircleRouteResult(
      origin,
      destination,
      directPlan,
      avoidedPlan,
      options
    );
    initRouteLeafletMap(
      origin,
      destination,
      avoidedPlan && options.compareDirect ? [directPlan, avoidedPlan] : [avoidedPlan ?? directPlan],
      options.avoidRegions
    );
  } catch (error) {
    console.error(error);
    output.innerHTML = `<div class="error">Error: ${escapeHtml(error.message)}</div>`;
  } finally {
    button.disabled = false;
  }
}

function initializePage() {
  initializeThemePicker();
  updateComparisonViewButtons();
  bindComparisonViewControls();

  const page = document.body.dataset.page;
  const inputs = document.querySelectorAll("input[type='text']");

  inputs.forEach((input) => {
    input.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      if (page === "matrix") {
        buildMatrix();
      } else if (page === "gcmap") {
        buildGreatCircleRoute();
      } else {
        compareDestinations();
      }
    });
  });
}

function updateComparisonViewButtons() {
  document.querySelectorAll("[data-comparison-view]").forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.comparisonView === comparisonViewMode
    );
  });
}

function bindComparisonViewControls() {
  document.querySelectorAll("[data-comparison-view]").forEach((button) => {
    button.onclick = () => {
      comparisonViewMode = button.dataset.comparisonView;
      updateComparisonViewButtons();
      if (currentComparisonResult) {
        rerenderComparison();
      }
    };
  });
}

function captureFilterUiState(prefix) {
  const uiState = filterUiState[prefix];
  const panelDetails = document.querySelector(".filter-panel-details");
  const airlineDetails = document.querySelector(".filter-airline-details");
  const activeElement = document.activeElement;

  uiState.panelOpen = panelDetails ? panelDetails.open : uiState.panelOpen;
  uiState.airlinesOpen = airlineDetails ? airlineDetails.open : uiState.airlinesOpen;
  uiState.focusedId = activeElement?.id ?? null;
  uiState.selectionStart =
    typeof activeElement?.selectionStart === "number"
      ? activeElement.selectionStart
      : null;
  uiState.selectionEnd =
    typeof activeElement?.selectionEnd === "number"
      ? activeElement.selectionEnd
      : null;
}

function restoreFilterUiState(prefix) {
  const uiState = filterUiState[prefix];
  const panelDetails = document.querySelector(".filter-panel-details");
  const airlineDetails = document.querySelector(".filter-airline-details");

  if (panelDetails) {
    panelDetails.open = uiState.panelOpen;
  }
  if (airlineDetails) {
    airlineDetails.open = uiState.airlinesOpen;
  }

  if (!uiState.focusedId) return;

  const input = document.getElementById(uiState.focusedId);
  if (!input) return;

  input.focus();
  if (
    typeof uiState.selectionStart === "number" &&
    typeof uiState.selectionEnd === "number" &&
    typeof input.setSelectionRange === "function"
  ) {
    input.setSelectionRange(uiState.selectionStart, uiState.selectionEnd);
  }
}

document.addEventListener("DOMContentLoaded", initializePage);
