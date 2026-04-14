import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";

type RoleContextType = {
  role: string | null;
  setRole: (role: string) => void;
  isLoading: boolean;
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

  // persistent data storage logic adapted from
  // https://dev.to/cathylai/managing-global-settings-in-react-native-a-clean-context-api-approach-4b20

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRole = async () => {
      try {
        const savedRole = await AsyncStorage.getItem("user_role");
        if (savedRole) setRole(savedRole);
      } catch (error) {
        throw error;
      } finally {
        setIsLoading(false);
      }
    };
    loadRole();
  }, []);

  const updateRole = async (newRole: string | null) => {
    setRole(newRole);

    if (newRole) {
      await AsyncStorage.setItem("user_role", newRole);
    } else {
      await AsyncStorage.removeItem("user_role");
    }
  };

  return (
    <RoleContext.Provider value={{ role, setRole: updateRole, isLoading }}>
      {children}
    </RoleContext.Provider>
  );
}
