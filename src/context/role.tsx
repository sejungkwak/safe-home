import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";

import { supabase } from "../lib/supabase";

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

  const updateRole = useCallback(async (newRole: string | null) => {
    setRole(newRole);

    // if a new role exists, save it in AsyncStorage; otherwise, delete it.
    if (newRole) {
      await AsyncStorage.setItem("user_role", newRole);
    } else {
      await AsyncStorage.removeItem("user_role");
    }
  }, []);

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

  // track sign-in and sign-out events
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        // clear the role from both state and AsyncStorage when a user signed out
        updateRole(null);
      } else if (event === "SIGNED_IN" && session) {
        // set the role when a user signed in
        const savedRole = await AsyncStorage.getItem("user_role");
        // if no saved role in AsyncStorage, retrieve from the auth table
        if (!savedRole) {
          const metaRole = session.user.user_metadata?.role as
            | string
            | undefined;

          if (metaRole)
            await updateRole(metaRole === "both" ? "rider" : metaRole);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [updateRole]);

  return (
    <RoleContext.Provider value={{ role, setRole: updateRole, isLoading }}>
      {children}
    </RoleContext.Provider>
  );
}
