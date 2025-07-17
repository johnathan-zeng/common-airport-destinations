# Airport Destination Comparator

This is a lightweight web tool that compares **passenger destinations** between two airports (entered by **ICAO** or **IATA** code). It fetches data from **Wikipedia** and identifies:

- ✈️ Common destinations between both airports
- 🛫 Destinations unique to Airport 1
- 🛬 Destinations unique to Airport 2
- Organized by **Airline** and an **overall summary**

### 🚀 How It Works

1. Enter two airport codes (e.g., `TFU`, `ZUUU`).
2. The tool finds each airport's Wikipedia page using the MediaWiki API.
3. It scrapes airline destination tables via a CORS proxy.
4. It compares the destinations by airline and shows results in a clean table.

### 📄 Example

| Airline        | Common Destinations | Only at TFU | Only at CTU |
|----------------|---------------------|-------------|-------------|
| All Airlines   | Beijing, Shanghai   | Sanya       | Harbin      |
| Air China      | Chengdu             | Nanjing     | Urumqi      |
