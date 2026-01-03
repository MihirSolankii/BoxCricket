// src/hooks/useTurfData.js
import { useState, useEffect } from "react";
import axios from "axios";
import { routes } from "../../routes.js"; // Adjust path as needed

export const useTurfData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Check Local Storage for Data
        const cachedData = localStorage.getItem("turfData");

        if (cachedData) {
          console.log("Loading from Local Storage");
          setData(JSON.parse(cachedData));
          setLoading(false);
          return;
        }

        // 2. If no data, Get Location
        if (!navigator.geolocation) {
          throw new Error("Geolocation is not supported");
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            
            // Save location for future reference
            localStorage.setItem("userLocation", JSON.stringify({ latitude, longitude }));

            // 3. Call API
            const response = await axios.post(routes.getData, {
              lat: latitude,
              lng: longitude,
            });

            const boxes = response.data.boxesList || [];
            
            // 4. Save Data to Local Storage
            localStorage.setItem("turfData", JSON.stringify(boxes));
            
            setData(boxes);
            setLoading(false);
          },
          (err) => {
            setError("Unable to retrieve location");
            setLoading(false);
          }
        );
      } catch (err) {
        console.error(err);
        setError("Failed to load venues");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};