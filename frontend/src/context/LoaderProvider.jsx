import { useState } from "react";
import { LoaderContext } from "./LoaderContext";

function LoaderProvider({ children }) {
  const [loading, setLoading] = useState(false);

  return (
    <LoaderContext.Provider value={{ loading, setLoading }}>
      {children}
    </LoaderContext.Provider>
  );
}

export default LoaderProvider;
