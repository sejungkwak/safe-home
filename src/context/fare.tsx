import { createContext, ReactNode, useContext, useState } from "react";

type FareContextType = {
  fare: number | null;
  setFare: (fare: number) => void;
};

const FareContext = createContext<FareContextType | undefined>(undefined);

/**
 * Reads the fare.
 */
export function useFare() {
  const value = useContext(FareContext);
  if (!value) {
    throw new Error("useFare must be wrapped in a <FareProvider />");
  }
  return value;
}

/**
 * Broadcasts the fare to all components.
 */
export function FareProvider({ children }: { children: ReactNode }) {
  const [fare, setFare] = useState<number | null>(null);

  return (
    <FareContext.Provider value={{ fare, setFare }}>
      {children}
    </FareContext.Provider>
  );
}
