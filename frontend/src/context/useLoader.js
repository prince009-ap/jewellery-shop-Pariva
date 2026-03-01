import { useContext } from "react";
import { LoaderContext } from "./LoaderContext";

export function useLoader() {
  return useContext(LoaderContext);
}
