import { useEffect, useState } from "react";

const useFetchData = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("data/groupedByFerment.json");
        const jsonData = await response.json();
        setData(jsonData);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setIsLoading(false); // handle error state as well
      }
    };

    fetchData();
  }, []);

  return { data, isLoading };
};

export default useFetchData;
