import { useEffect, useState } from "react";

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

  useEffect(() => {
    const fetchLocations = async () => {
      setLoading(true);
      const apiUrl = "http://192.168.64.167:3000/locations";
      try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        console.log(data);
        setCoords(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  return { coords, loading };
};

export default useLocations;
