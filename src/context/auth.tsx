import { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";
import { supabase } from "../lib/supabase";

// The code is modified based on the following resources:
// https://docs.expo.dev/router/advanced/authentication-rewrites/#using-react-context-and-route-groups
// https://supabase.com/blog/react-native-storage
// https://medium.com/@kumarankitraj1478/supabase-authentication-c81df4d74d5d

// Define data types to share
type AuthProps = {
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  user: User | null;
  session: Session | null;
  initialised?: boolean;
};

const AuthContext = createContext<Partial<AuthProps>>({});

// This hook can be used to access the user info.
export function useSession() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useSession must be wrapped in a <SessionProvider />");
  }

  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>();
  const [session, setSession] = useState<Session | null>(null);
  const [initialised, setInitialised] = useState(false);

  useEffect(() => {
    // Restore existing session
    const initSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user);
      setSession(session);
      setInitialised(true);
    };
    initSession();

    // Listen to auth events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session ? session.user : null);
      setSession(session);
      setInitialised(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return error ? error.message : null;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signOut,
        user,
        session,
        initialised,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
