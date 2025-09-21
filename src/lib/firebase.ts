// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { AnalyticsCallOptions, getAnalytics, logEvent } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

if (siteKey) {
  if (typeof window !== "undefined") {
    // Correct way to initialize on the client side
    initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(siteKey),
      isTokenAutoRefreshEnabled: true,
    });
  }
}

interface AnalyticsParams {
  [key: string]: string | number | boolean;
}

export function logCustomEvent(name: string, params?: AnalyticsParams, options?: AnalyticsCallOptions) {
  if (process.env.ENABLE_ANALYTICS === 'true' && analytics) {
    logEvent(analytics, name, params, options);
  }
}