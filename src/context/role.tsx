import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";

import fetchProfile from "../api/profiles/fetch-profile";
import { supabase } from "../lib/supabase";

type RoleContextType = {
  role: string | null;
  isLoading: boolean;
};

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function useRole() {
  const value = useContext(RoleContext);
  if (!value) {
    throw new Error("useRole must be wrapped in a <RoleProvider />");
  }
  return value;
}

export function RoleProvider({ children }: PropsWithChildren) {
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        // reset role and isLoading states
        setRole(null);
        setIsLoading(false);
      } else if (
        (event === "SIGNED_IN" || event === "INITIAL_SESSION") &&
        session
      ) {
        setIsLoading(true);
        try {
          // retrieve the user role from database
          const profile = await fetchProfile(session.user.id);
          setRole(profile.role);
        } catch {
          setRole(null);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <RoleContext.Provider value={{ role, isLoading }}>
      {children}
    </RoleContext.Provider>
  );
}
