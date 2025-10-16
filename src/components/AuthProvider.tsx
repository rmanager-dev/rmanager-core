"use client";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import { auth } from "../lib/firebase/firebaseClient";
import {
  getSessionCookie,
  revokeSessionCookie,
  validateSession,
} from "../lib/utils/AuthUtils";
import { useRouter } from "next/navigation";

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  useEffect(() => {
    let wasLoggedIn = false;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        wasLoggedIn = true;
        const result = await validateSession();
        if (result.success && !result.isValid) {
          console.log("Refreshing session...");
          const success = await getSessionCookie();
          if (success) {
            router.refresh();
            console.log("Refreshed successfully");
          }
        }
      } else {
        if (!wasLoggedIn) {
          return;
        }
        const success = await revokeSessionCookie();
        if (success) {
          console.log("Successfully revoked session cookie");
        }
      }
    });
    return unsubscribe;
  }, [router]);

  return <>{children}</>;
}
