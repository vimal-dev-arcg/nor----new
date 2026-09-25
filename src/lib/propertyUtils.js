/**
 * Real Estate Helper Utilities for Regional Filtering & Formatting
 */

/**
 * Checks whether a property belongs to the Indian real estate catalog (Delhi NCR, Tricity, Bangalore, Mumbai, etc.)
 */
export function isIndiaProperty(p) {
  if (!p) return false;
  const loc = (p.location || "").toLowerCase();
  const city = (p.city || "").toLowerCase();
  const addr = (p.address || "").toLowerCase();
  const country = (p.country || "").toLowerCase();
  const comm = (p.community || "").toLowerCase();

  if (loc.includes("india") || country.includes("india")) return true;

  const indianKeywords = [
    "delhi ncr",
    "delhi",
    "gurgaon",
    "gurugram",
    "noida",
    "tricity",
    "tri city",
    "tri-city",
    "chandigarh",
    "panchkula",
    "mohali",
    "bangalore",
    "bengaluru",
    "mumbai",
    "india",
  ];

  return indianKeywords.some(
    (k) =>
      city.includes(k) ||
      loc.includes(k) ||
      addr.includes(k) ||
      comm.includes(k)
  );
}

/**
 * Matches a property against the selected Indian city filter (e.g. Tricity, Delhi NCR, Bangalore)
 */
export function matchesIndiaCity(property, selectedCity) {
  if (!selectedCity) return true;
  if (!property) return false;

  const target = selectedCity.trim().toLowerCase();
  const pCity = (property.city || "").toLowerCase();
  const pLoc = (property.location || "").toLowerCase();
  const pAddr = (property.address || "").toLowerCase();
  const pComm = (property.community || "").toLowerCase();

  // If searching for Tricity (Chandigarh - Panchkula - Mohali)
  if (
    target === "tricity" ||
    target.includes("chandigarh") ||
    target.includes("panchkula") ||
    target.includes("mohali") ||
    target.includes("tri")
  ) {
    return (
      pCity.includes("tricity") ||
      pCity.includes("chandigarh") ||
      pCity.includes("panchkula") ||
      pCity.includes("mohali") ||
      pLoc.includes("tricity") ||
      pLoc.includes("chandigarh") ||
      pLoc.includes("panchkula") ||
      pLoc.includes("mohali") ||
      pAddr.includes("chandigarh") ||
      pAddr.includes("panchkula") ||
      pAddr.includes("mohali") ||
      pComm.includes("tricity")
    );
  }

  // If searching for Delhi NCR
  if (
    target.includes("delhi") ||
    target.includes("ncr") ||
    target.includes("gurgaon") ||
    target.includes("gurugram") ||
    target.includes("noida")
  ) {
    return (
      pCity.includes("delhi") ||
      pCity.includes("ncr") ||
      pCity.includes("gurgaon") ||
      pCity.includes("gurugram") ||
      pCity.includes("noida") ||
      pLoc.includes("delhi") ||
      pLoc.includes("golf course") ||
      pAddr.includes("gurugram") ||
      pAddr.includes("delhi")
    );
  }

  // If searching for Bangalore / Bengaluru
  if (target.includes("bangalore") || target.includes("bengaluru")) {
    return (
      pCity.includes("bangalore") ||
      pCity.includes("bengaluru") ||
      pLoc.includes("bangalore") ||
      pAddr.includes("bangalore")
    );
  }

  // Default string match
  return (
    pCity.includes(target) ||
    pLoc.includes(target) ||
    pAddr.includes(target)
  );
}

/**
 * Format display label for cities
 */
export function getCityDisplayLabel(cityQuery) {
  if (!cityQuery) return "India";
  const q = cityQuery.toLowerCase();
  if (q.includes("tricity") || q.includes("chandigarh") || q.includes("tri")) {
    return "Tricity (Chandigarh • Panchkula • Mohali)";
  }
  if (q.includes("delhi") || q.includes("ncr") || q.includes("gurgaon")) {
    return "Delhi NCR";
  }
  if (q.includes("bangalore") || q.includes("bengaluru")) {
    return "Bangalore";
  }
  if (q.includes("mumbai")) {
    return "Mumbai";
  }
  return cityQuery;
}
