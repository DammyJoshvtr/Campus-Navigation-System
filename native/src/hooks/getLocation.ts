import { useCallback, useEffect, useState } from "react";
import api from "../services/api";

type Location = {
  id: number;
  name: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  type: string;
  image?: string;
  floorplan?: string;
};

const useLocations = () => {
  const [coords, setCoords] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchLocations = useCallback(async () => {
    try {
      setLoading(true);
      setError(false); // reset error before retry

      const data = await api.getLocations();

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
