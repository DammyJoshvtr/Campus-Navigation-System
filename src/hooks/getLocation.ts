import { useEffect, useState } from "react";

const useLocations = () => {
  const [coords, setCoords] = useState([]);

  useEffect(() => {
    const fetchLocations = async () => {
      const apiUrl = "http://localhost:3000/locations";

      try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        setCoords(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchLocations();
  }, []);

  return coords;
};

export default useLocations;
