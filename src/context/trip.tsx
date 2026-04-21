import { createContext, ReactNode, useContext, useState } from "react";

type Coords = {
  latitude: number;
  longitude: number;
  address: string;
};

type TripContextType = {
  origin: Coords | null;
  destination: Coords | null;
  routeInfo: { distance: number; duration: number } | null;
  fare: number | null;
  dateTime: Date | null;
  resetKey: number;
  setOrigin: (coords: Coords | null) => void;
  setDestination: (coords: Coords | null) => void;
  setRouteInfo: (route: { distance: number; duration: number }) => void;
  setFare: (fare: number) => void;
  setDateTime: (dateTime: Date) => void;
  resetTrip: () => void;
};

const TripContext = createContext<TripContextType | undefined>(undefined);

/**
 * Custom hook for reading the trip context.
 */
export function useTrip() {
  const value = useContext(TripContext);
  if (!value) {
    throw new Error("useFare must be wrapped in a <TripProvider />");
  }
  return value;
}

/**
 * Broadcasts the trip to all components.
 */
export function TripProvider({ children }: { children: ReactNode }) {
  const [origin, setOrigin] = useState<Coords | null>(null);
  const [destination, setDestination] = useState<Coords | null>(null);
  const [routeInfo, setRouteInfo] =
    useState<TripContextType["routeInfo"]>(null);
  const [fare, setFare] = useState<number | null>(null);
  const [dateTime, setDateTime] = useState<Date | null>(null);
  const [resetKey, setResetKey] = useState(0);

  function resetTrip() {
    setOrigin(null);
    setDestination(null);
    setRouteInfo(null);
    setFare(null);
    setDateTime(null);
    setResetKey((k) => k + 1);
  }

  return (
    <TripContext.Provider
      value={{
        origin,
        setOrigin,
        destination,
        setDestination,
        routeInfo,
        setRouteInfo,
        fare,
        setFare,
        dateTime,
        setDateTime,
        resetKey,
        resetTrip,
      }}
    >
      {children}
    </TripContext.Provider>
  );
}
