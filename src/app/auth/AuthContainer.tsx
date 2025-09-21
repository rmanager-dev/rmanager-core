"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const LoginCard = dynamic(() => import("@/src/app/auth/LoginCard"));
const SignupCard = dynamic(() => import("@/src/app/auth/SignupCard"));

function LoginWithEmail(email: string, password: string) {
  console.log({ email: email, password: password });
}

function ThirdPartyLogin(provider: string) {
  console.log(provider);
}

function SignupWithEmail(email: string, password: string) {
  console.log({ email: email, password: password });
}

function ThirdPartySignup(provider: string) {
  console.log(provider);
}

export default function AuthContainer({
  isInitLogin,
}: {
  isInitLogin: boolean;
}) {
  const [isLogin, setIsLogin] = useState(isInitLogin);

  return (
    <div className="dark relative min-h-full flex justify-center items-center bg-background">
      {isLogin ? (
        <LoginCard
          setIsLogin={setIsLogin}
          loginWithEmail={LoginWithEmail}
          thirdPartyLogin={ThirdPartyLogin}
        />
      ) : (
        <SignupCard
          setIsLogin={setIsLogin}
          signupWithEmail={SignupWithEmail}
          thirdPartySignup={ThirdPartySignup}
        />
      )}
    </div>
  );
}
