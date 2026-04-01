/**
 * Google Places API (New) — Fetch reviews using API key only (no OAuth needed)
 */

const GOOGLE_API_KEY = () => process.env.GOOGLE_API_KEY || "";

// Search for a place by name and get its Place ID
async function searchPlace(query, locationBias) {
  const body = { textQuery: query, languageCode: "fr" };

  // Default: bias search to France to avoid finding businesses in other countries
  if (locationBias) {
    body.locationBias = locationBias;
  } else {
    body.locationBias = {
      rectangle: {
        low: { latitude: 41.3, longitude: -5.2 },   // SW France
        high: { latitude: 51.1, longitude: 9.6 }     // NE France
      }
    };
  }

  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": GOOGLE_API_KEY(),
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.googleMapsUri"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[PLACES] Search error:", err);
    throw new Error("Erreur recherche Google Places");
  }

  const data = await res.json();
  return data.places || [];
}

// Get place details including reviews
async function getPlaceDetails(placeId) {
  const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
    headers: {
      "X-Goog-Api-Key": GOOGLE_API_KEY(),
      "X-Goog-FieldMask": "id,displayName,formattedAddress,rating,userRatingCount,reviews.originalText,reviews.text,reviews.rating,reviews.authorAttribution,reviews.publishTime,reviews.name,googleMapsUri"
    }
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[PLACES] Details error:", err);
    throw new Error("Erreur détails Google Places");
  }

  return await res.json();
}

// Resolve a Google Maps URL to a Place ID
async function resolveGoogleMapsUrl(url) {
  // Follow redirect for short URLs (maps.app.goo.gl)
  let finalUrl = url;
  if (url.includes("maps.app.goo.gl") || url.includes("goo.gl")) {
    try {
      const res = await fetch(url, { method: "HEAD", redirect: "follow" });
      finalUrl = res.url;
    } catch (e) {
      console.error("[PLACES] URL resolve error:", e.message);
    }
  }

  // Try to extract coordinates from URL for precise location bias
  let locationBias = null;
  const coordMatch = finalUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[2]);
    locationBias = {
      circle: { center: { latitude: lat, longitude: lng }, radius: 500.0 }
    };
  }

  // Try to extract place name from URL
  const nameMatch = finalUrl.match(/place\/([^/@]+)/);
  if (nameMatch) {
    const placeName = decodeURIComponent(nameMatch[1]).replace(/\+/g, " ");
    const places = await searchPlace(placeName, locationBias);
    if (places.length > 0) return places[0];
  }

  // Fallback: search with the full URL text
  const places = await searchPlace(url, locationBias);
  return places.length > 0 ? places[0] : null;
}

// Main function: fetch reviews for a business
async function fetchGoogleReviews(businessName, googleBusinessUrl) {
  let place = null;

  // Try URL first
  if (googleBusinessUrl) {
    place = await resolveGoogleMapsUrl(googleBusinessUrl);
  }

  // Fallback to business name search
  if (!place && businessName) {
    const places = await searchPlace(businessName);
    if (places.length > 0) place = places[0];
  }

  if (!place) {
    return { place: null, reviews: [] };
  }

  // Get full details with reviews
  const details = await getPlaceDetails(place.id);

  const reviews = (details.reviews || []).map(r => ({
    googleReviewId: r.name || `review_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    authorName: r.authorAttribution?.displayName || "Anonyme",
    authorPhoto: r.authorAttribution?.photoUri || null,
    rating: r.rating || 3,
    text: r.originalText?.text || r.text?.text || "",
    publishedAt: r.publishTime ? new Date(r.publishTime) : new Date(),
    language: r.originalText?.languageCode || r.text?.languageCode || "fr",
    hasReply: false
  }));

  return {
    place: {
      placeId: place.id || details.id,
      name: details.displayName?.text || place.displayName?.text || businessName,
      address: details.formattedAddress || place.formattedAddress || "",
      rating: details.rating || place.rating || 0,
      totalReviews: details.userRatingCount || place.userRatingCount || 0,
      googleMapsUri: details.googleMapsUri || place.googleMapsUri || ""
    },
    reviews
  };
}

module.exports = { searchPlace, getPlaceDetails, resolveGoogleMapsUrl, fetchGoogleReviews };
