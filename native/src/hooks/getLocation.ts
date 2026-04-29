import { useCallback, useEffect, useState } from "react";

type Location = {
  id: number;
  name: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  type: string;
};

const useLocations = () => {
  const [coords, setCoords] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const apiUrl = "http://192.168.29.171:3000/locations";

  const fetchLocations = useCallback(async () => {
    try {
      setLoading(true);
      setError(false); // reset error before retry

      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error("Network response failed");
      }

      const data = await response.json();

      console.log("Location data is Active...");
      setCoords(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  return {
    coords,
    loading,
    error,
    refetch: fetchLocations,
  };
};

export default useLocations;
