// Using built-in fetch if node version allows, otherwise this will fail and I'll know
// Node 18+ has global fetch

const calculateHaversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c * 1.25).toFixed(1));
};

const geocodeAddress = async (query) => {
  try {
    const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`, {
      headers: { "User-Agent": "KhammaGhani-Diagnostic/1.0" }
    });
    const data = await resp.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    }
  } catch (err) {
    console.error(`Error geocoding ${query}:`, err.message);
  }
  return null;
};

async function test() {
  const restaurantAddr = "Fateh Sagar Lake, Udaipur, Rajasthan, India";
  const userAddr = "312, Umra, Girwa Tehsil - 313003";

  console.log("Geocoding Restaurant...");
  const resCoords = await geocodeAddress(restaurantAddr);
  console.log("Restaurant Coords:", resCoords);

  console.log("Geocoding User...");
  const userQueries = [
    userAddr,
    "Umra, Udaipur",
    "313003, India"
  ];

  let uCoords = null;
  for (const q of userQueries) {
     console.log(`Trying query: "${q}"`);
     uCoords = await geocodeAddress(q);
     if (uCoords) break;
  }
  console.log("User Coords:", uCoords);

  if (resCoords && uCoords) {
    const dist = calculateHaversine(resCoords.lat, resCoords.lon, uCoords.lat, uCoords.lon);
    console.log("Calculated Distance:", dist, "km");
  } else {
    console.log("Could not calculate distance because coordinates are missing.");
  }
}

test();
