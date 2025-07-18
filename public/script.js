async function getWikipediaUrl(code) {
    const searchTerms = [`${code} airport`, `airport ${code}`];
    for (const query of searchTerms) {
        const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;

        try {
            const res = await fetch(apiUrl);
            const json = await res.json();
            const firstResult = json.query?.search?.[0];
            if (firstResult) {
                return `https://en.wikipedia.org/wiki/${encodeURIComponent(firstResult.title)}`;
            }
        } catch (err) {
            console.warn(`Failed to fetch Wikipedia page for ${query}:`, err);
        }
    }
    throw new Error(`No Wikipedia page found for airport code: ${code}`);
}

function parseHtml(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const tables = doc.querySelectorAll("table.wikitable");

    const airlineMap = new Map();
    const allDests = new Set();

    tables.forEach(table => {
        const caption = table.querySelector("caption");
        const captionText = caption ? caption.textContent.toLowerCase() : "";
        if (!captionText.includes("passenger") && !hasPassengerHeading(table)) return;

        const rows = table.querySelectorAll("tr");
        rows.forEach((row, idx) => {
            if (idx === 0) return;
            const cols = row.querySelectorAll("td");
            if (cols.length < 2) return;

            const airline = cols[0].textContent.trim();
            let destText = cols[1].textContent;

            destText = destText
                .replace(/\[\d+\]/g, '')
                .replace(/\([^)]+\)/g, '')
                .replace(/–/g, '-')
                .replace(/\s{2,}/g, ' ')
                .trim();

            const dests = destText
                .split(/[\n,;·•]/)
                .map(d => d.trim())
                .filter(d =>
                    d.length >= 3 &&
                    d.length < 50 &&
                    !/^\d+$/.test(d) &&
                    !/^(and|or|also|via|seasonal|charter|cargo|freight|terminated|suspended)$/i.test(d)
                );

            if (dests.length > 0) {
                if (!airlineMap.has(airline)) airlineMap.set(airline, new Set());
                dests.forEach(d => {
                    airlineMap.get(airline).add(d);
                    allDests.add(d);
                });
            }
        });
    });

    if (allDests.size > 0) {
        airlineMap.set("__ALL__", allDests);
    }

    return airlineMap;
}

function hasPassengerHeading(table) {
    let el = table.previousElementSibling;
    let count = 0;
    while (el && count < 5) {
        if (/^H[1-6]$/i.test(el.tagName)) {
            if (el.textContent.toLowerCase().includes("passenger")) return true;
            return false;
        }
        el = el.previousElementSibling;
        count++;
    }
    return false;
}

async function fetchDestinations(url) {
    const proxy = "https://common-airport-destinations.vercel.app/api/proxy?url=";

    try {
        const proxyUrl = proxy + encodeURIComponent(url);
        const res = await fetch(proxyUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        const html = await res.text();
        if (!html || html.length < 100) throw new Error("Empty or invalid response");
        const parsed = parseHtml(html);
        if (parsed.size > 0) return parsed;
        throw new Error("No destination data found in page");
    } catch (err) {
        throw new Error(`Proxy fetch failed: ${err.message}`);
    }
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

    const allIndex = result.findIndex(r => r.airline === "All Airlines");
    if (allIndex > -1) {
        const [allRow] = result.splice(allIndex, 1);
        result.unshift(allRow);
    }

    return result.sort((a, b) => {
        if (a.airline === "All Airlines") return -1;
        if (b.airline === "All Airlines") return 1;
        return a.airline.localeCompare(b.airline);
    });
}

async function compareDestinations() {
    const code1 = document.getElementById("code1").value.trim().toUpperCase();
    const code2 = document.getElementById("code2").value.trim().toUpperCase();
    const output = document.getElementById("output");
    const button = document.querySelector("button");

    if (!code1 || !code2) {
        output.innerHTML = '<div class="error">Please enter both airport codes.</div>';
        return;
    }

    if (code1 === code2) {
        output.innerHTML = '<div class="error">Please enter two different airport codes.</div>';
        return;
    }

    output.innerHTML = '<div class="loading">Searching Wikipedia and fetching data...</div>';
    button.disabled = true;

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
            output.innerHTML = '<div class="error">No destination data found for these airports.</div>';
            return;
        }

        let html = `<h3>Destination Comparison: ${code1} vs ${code2}</h3>
        <table>
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
                <td><strong>${escapeHtml(airline)}</strong></td>
                <td>${common.length ? escapeHtml(common.join(", ")) : '<span class="empty-cell">None</span>'}</td>
                <td>${only1.length ? escapeHtml(only1.join(", ")) : '<span class="empty-cell">None</span>'}</td>
                <td>${only2.length ? escapeHtml(only2.join(", ")) : '<span class="empty-cell">None</span>'}</td>
            </tr>`;
        });

        html += `</tbody></table>
        <div class="note">Note: Data sourced from Wikipedia passenger destination tables. Not all destinations may be listed.</div>`;
        output.innerHTML = html;

    } catch (err) {
        output.innerHTML = `<div class="error">Error: ${err.message}</div>`;
    } finally {
        button.disabled = false;
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('input[type="text"]');
    inputs.forEach(input => {
        input.addEventListener('keypress', e => {
            if (e.key === 'Enter') compareDestinations();
        });
    });
});
