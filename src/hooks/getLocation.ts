import { useEffect, useState } from "react";

const useLocations = () => {
  const [coords, setCoords] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLocations = async () => {
      setLoading(true);
      const apiUrl = "http://10.0.2.2:3000/locations";
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

  return coords;
};

export default useLocations;
