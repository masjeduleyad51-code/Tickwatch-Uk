import { useEffect, useState } from "react";
import { parseHash, type Route } from "@/lib/route";

/** Tiny hash router: no extra dependency, works on any static host and in the share links. */
export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}
