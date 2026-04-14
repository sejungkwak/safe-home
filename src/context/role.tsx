import React, {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
} from "react";

type RoleContextType = {
  role: string | null;
  setRole: (role: string) => void;
};

// create context object
const RoleContext = createContext<RoleContextType | undefined>(undefined);

/**
 * Custom hook for reading the role context.
 */
export function useRole() {
  const value = useContext(RoleContext);
  if (!value) {
    throw new Error("useRole must be wrapped in a <RoleProvider />");
  }
  return value;
}

/**
 * Broadcasts the role context to all components.
 */
export function RoleProvider({ children }: PropsWithChildren) {
  const [role, setRole] = useState<string | null>(null);

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}
