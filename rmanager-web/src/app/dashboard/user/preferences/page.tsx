import DangerZonePreferences from "./DangerZonePreferences";
import DisplayNamePreferences from "./DisplayNamePreferences";
import EmailPreferences from "./EmailPreferences";

export default function Page() {
  return (
    <>
      <span className="w-full text-left text-lg font-semibold">
        Preferences
      </span>
      <DisplayNamePreferences />
      <EmailPreferences />
      <DangerZonePreferences />
    </>
  );
}
