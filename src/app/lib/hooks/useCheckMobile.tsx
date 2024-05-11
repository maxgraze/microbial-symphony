import { useState, useEffect } from "react";

const useCheckMobile = () => {
  // Initialize as null or a sensible default, such as false
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth <= 768
  );

  useEffect(() => {
    // Ensure window is defined before adding an event listener
    if (typeof window !== "undefined") {
      const handleResize = () => {
        setIsMobile(window.innerWidth <= 768);
      };

      // Set up resize listener
      window.addEventListener("resize", handleResize);

      // Clean up listener to prevent memory leaks
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  return isMobile;
};

export default useCheckMobile;
