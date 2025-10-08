import { getAuth } from "firebase/auth";

export async function getSessionCookie(): Promise<boolean> {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      console.log("Must be signed in to get session cookie");
      return false;
    }

    const idToken = await currentUser.getIdToken();

    const response = await fetch("/api/auth/getSessionCookie", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      throw new Error(
        "Error while logging you in: error while retrieving cookie"
      );
    }

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function validateSession(): Promise<{
  success: boolean;
  isValid: boolean;
}> {
  try {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      console.log("Must be signed in to validate session");
      return { success: false, isValid: false };
    }

    const idToken = await currentUser.getIdToken();

    const response = await fetch("/api/auth/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      throw new Error("Error while validating session");
    }

    const result = await response.json();

    return { success: true, isValid: result.isSessionValid };
  } catch (error) {
    console.error(error);
    return { success: false, isValid: false };
  }
}

export async function revokeSessionCookie(method?: string): Promise<boolean> {
  const response = await fetch("/api/auth/revokeSessionCookie", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ method: method ?? "" }),
  });

  if (response.ok) {
    const result = await response.json();
    if (result.error) {
      return false;
    } else {
      return true;
    }
  }
  return false;
}
