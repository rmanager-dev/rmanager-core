"use client";
import { useState } from "react";
import { auth } from "../lib/firebase/firebaseClient";
import { onAuthStateChanged } from "firebase/auth";

export default function Page() {
  const [email, setEmail] = useState(auth.currentUser?.email);
  onAuthStateChanged(auth, (user) => {
    if (user) {
      setEmail(user.email);
    } else {
      setEmail("");
    }
  });

  return <h1>Your email: {email}</h1>;
}
