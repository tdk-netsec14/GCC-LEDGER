"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Grade } from "./api";

interface EvidenceContextType {
  floor: Grade;
  directOnly: boolean;
  evidenceParams: { floor: Grade; direct_only: boolean };
  setFloor: (floor: Grade) => void;
  setDirectOnly: (directOnly: boolean) => void;
}

const EvidenceContext = createContext<EvidenceContextType>({
  floor: "D",
  directOnly: false,
  evidenceParams: { floor: "D", direct_only: false },
  setFloor: () => {},
  setDirectOnly: () => {},
});

export function EvidenceProvider({ children }: { children: React.ReactNode }) {
  const [floor, setFloorState] = useState<Grade>("D");
  const [directOnly, setDirectOnlyState] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Initialize from URL search parameters on client mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlFloor = params.get("floor")?.toUpperCase();
      const urlDirect = params.get("direct_only");

      if (urlFloor && ["A", "B", "C", "D"].includes(urlFloor)) {
        setFloorState(urlFloor as Grade);
      }
      if (urlDirect !== null) {
        setDirectOnlyState(urlDirect === "true");
      }
      setIsInitialized(true);
    }
  }, []);

  // Sync state to URL search parameters without page reload
  const updateUrl = (newFloor: Grade, newDirect: boolean) => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("floor", newFloor);
      url.searchParams.set("direct_only", String(newDirect));
      window.history.replaceState({}, "", url.toString());
    }
  };

  const setFloor = (newFloor: Grade) => {
    setFloorState(newFloor);
    updateUrl(newFloor, directOnly);
  };

  const setDirectOnly = (newDirect: boolean) => {
    setDirectOnlyState(newDirect);
    updateUrl(floor, newDirect);
  };

  const evidenceParams = useMemo(
    () => ({ floor, direct_only: directOnly }),
    [floor, directOnly]
  );

  return (
    <EvidenceContext.Provider
      value={{ floor, directOnly, evidenceParams, setFloor, setDirectOnly }}
    >
      {children}
    </EvidenceContext.Provider>
  );
}

export function useEvidence() {
  return useContext(EvidenceContext);
}
