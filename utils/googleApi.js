// /utils/googleApi.js

import fetch from "node-fetch"; 
import dotenv from "dotenv";
import axios from "axios";
dotenv.config();

// Ensure your key is ONLY read from the secure environment variable
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY; 

/**
 * Fetches detailed information for a single place using the Google Place Details API.
 * @param {string} placeId - The unique Google Place ID.
 * @returns {object|null} - Cleaned place details or null on failure.
 */
export const fetchPlaceDetailsFromGoogle = async (placeId) => {
    if (!placeId || !GOOGLE_API_KEY) {
        throw new Error("Place ID or Google API Key is missing.");
    }
    
    // Request specific fields needed for the boxSchema to minimize payload size
    const fields = [
        'name', 'formatted_address', 'geometry', 'rating', 'user_ratings_total', 
        'international_phone_number', 'place_id'
    ];
    
    const keyword = "box cricket";
    const url = `https://maps.googleapis.com/maps/api/place/details/json?` +
                `place_id=${placeId}&fields=${fields.join(',')}&key=${GOOGLE_API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== 'OK' || !data.result) {
            console.error("Google API Error:", data.status, data.error_message);
            return null;
        }

        const result = data.result;

        // Extract and format data to match boxSchema requirements
        return {
            // General Info
            name: result.name,
            googlePlaceId: result.place_id,
            
            // Location
            fullAddress: result.formatted_address,
            latitude: result.geometry?.location?.lat,
            longitude: result.geometry?.location?.lng,
            
            // Rating
            averageRating: result.rating || 0,
            totalReviews: result.user_ratings_total || 0,
            
            // Contact (The international phone number is often the most reliable)
            phoneNumber: result.international_phone_number || result.formatted_phone_number || 'N/A'
            
            // Note: You would typically parse city/pincode from formatted_address separately if needed
        };
    } catch (error) {
        console.error("Fetch error in Google API call:", error.message);
        return null;
    }
};

export const findpLacebyname=async(query, latitude = null, longitude = null)=>{
     if (!query || !GOOGLE_API_KEY) {
            throw new Error("Search query or Google API Key is missing.");
        }
    
        // Add "box cricket" to query if not already included
        const searchQuery = query.toLowerCase().includes('box') ? query : `${query} box cricket`;
        
        let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?` +
                  `query=${encodeURIComponent(searchQuery)}&key=${GOOGLE_API_KEY}`;
        
        // If location provided, bias results towards that location
        if (latitude && longitude) {
            url += `&location=${latitude},${longitude}&radius=10000`;
        }
    
        try {
            const response = await fetch(url);
            const data = await response.json();
    
            if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
                console.error("Google Text Search Error:", data.status, data.error_message);
                return [];
            }
    
            return data.results.map(place => ({
                placeId: place.place_id,
                name: place.name,
                address: place.formatted_address,
                rating: place.rating || 0,
                totalReviews: place.user_ratings_total || 0,
                location: place.geometry?.location
            }));
        } catch (error) {
            console.error("Fetch error in Text Search:", error.message);
            return [];
        }
}

async function getLocationFromAddress(address) {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}`
    );
    
    if (response.data.results.length > 0) {
      const location = response.data.results[0].geometry.location;
      console.log(location);
      
      return { lat: location.lat, lng: location.lng };
    }
    return { lat: 22.28224, lng: 70.7887104 }; // fallback
  } catch (error) {
    console.error('Geocoding error:', error.message);
    return { lat: 22.28224, lng: 70.7887104 };
  }
}

export const getLocation=async(address)=>{
    return await getLocationFromAddress(address);
}
async function getPlaceDetails(placeId) {
  const fields = [
    "name",
    "rating",
    "formatted_address",
    "formatted_phone_number",
    "opening_hours",
    "website",
    "url",
    "reviews",
    "types",
    "price_level",
    "photos",
    "wheelchair_accessible_entrance",
    "serves_beer",
    "serves_wine",
    "takeout",
    "delivery",
    "dine_in",
    "reservable",
    "serves_lunch",
    "serves_dinner",
    "serves_breakfast",
  ].join(",");

  const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_API_KEY}`;

  const { data } = await axios.get(detailsUrl);
  const place = data.result;

  if (!place) return null;

  // Convert photo_reference → usable image URLs
  const photos = place.photos
    ? place.photos.map(
        (p) =>
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photo_reference=${p.photo_reference}&key=${GOOGLE_API_KEY}`
      )
    : [];

  return {
    name: place.name,
    rating: place.rating,
    address: place.formatted_address,
    phone: place.formatted_phone_number,
    website: place.website,
    map_url: place.url,
    opening_hours: place.opening_hours || null,
    reviews: place.reviews || [],
    types: place.types || [],
    price_level: place.price_level || null,
    photos,
    amenities: {
      dine_in: place.dine_in || false,
      delivery: place.delivery || false,
      takeout: place.takeout || false,
      serves_beer: place.serves_beer || false,
      serves_wine: place.serves_wine || false,
      reservable: place.reservable || false,
      serves_breakfast: place.serves_breakfast || false,
      serves_lunch: place.serves_lunch || false,
      serves_dinner: place.serves_dinner || false,
      wheelchair_accessible_entrance:
        place.wheelchair_accessible_entrance || false,
    },
  };
}
export const SearchBoxCricketByName=async(name,location)=>{
//  const { name,location} = req.query;

const { lat, lng }=await getLocationFromAddress(location);

if (!lat || !lng) {
   console.error("Invalid location provided");
//    return res.status(400).json({ error: "Invalid location provided" });
}

  if (!name) {
    console.error("Please provide a place name");
   
  }

  try {
    let placeId = null;

    // Step 1️⃣ Try Text Search first (best for specific names)
    const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
      name
    )}&location=${lat},${lng}&radius=5000&key=${GOOGLE_API_KEY}`;
    const textSearchRes = await axios.get(textSearchUrl);

    if (textSearchRes.data.results.length > 0) {
      // Pick first strong match
      const match = textSearchRes.data.results.find(
        (p) => p.name.toLowerCase() === name.toLowerCase()
      );
      placeId = match
        ? match.place_id
        : textSearchRes.data.results[0].place_id;
    } else {
      console.log("⚠️ No TextSearch match found, falling back to NearbySearch");
    }

    // Step 2️⃣ Fallback: Nearby Search if Text Search gave no results
    if (!placeId) {
      const nearbyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&keyword=${encodeURIComponent(
        name
      )}&key=${GOOGLE_API_KEY}`;
      const nearbyRes = await axios.get(nearbyUrl);

      if (nearbyRes.data.results.length > 0) {
        const match = nearbyRes.data.results.find(
          (p) => p.name.toLowerCase() === name.toLowerCase()
        );
        placeId = match
          ? match.place_id
          : nearbyRes.data.results[0].place_id;
      }
    }

    // Step 3️⃣ If still not found
    if (!placeId) {
      return res.status(404).json({
        message: `No place found for "${name}" near (${lat}, ${lng})`,
      });
    }

    // Step 4️⃣ Fetch full details
    const details = await getPlaceDetails(placeId);
    if (!details) {
      return res.status(404).json({
        message: "No details found for the given place",
      });
    }

    // res.json(details);
  return details;
  } catch (err) {
    console.error(err);
    // res.status(500).json({ message: "Server error", error: err.message });
  }

}
