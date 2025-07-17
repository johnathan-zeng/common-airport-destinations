// Improvement: Ensure that empty common/only1/only2 render as '-' if empty, not a long string of codes
// Fix: Handle the large set of destinations more compactly if needed

function renderDestinations(list) {
  if (!list || list.length === 0) return '-';
  if (list.length > 20) return `${list.length} destinations`;
  return list.join(", ");
}

async function compareDestinations() {
  const code1 = document.getElementById("code1").value.trim().toUpperCase();
  const code2 = document.getElementById("code2").value.trim().toUpperCase();
  const output = document.getElementById("output");
  output.innerHTML = "<p>Loading...</p>";

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

    const merged = mergeAirlines(map1, map2);

    if (!merged.length) {
      output.innerHTML = `<p>No data found for either airport.</p>`;
      return;
    }

    let html = `<style>
      table { border-collapse: collapse; width: 100%; margin-top: 1em; }
      th, td { border: 1px solid #ccc; padding: 4px 8px; text-align: left; }
      th { background-color: #f0f0f0; }
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

// Keep other helper functions unchanged
