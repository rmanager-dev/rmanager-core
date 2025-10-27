import DangerZonePreferences from "./DangerZonePreferences";
import EmailPreferences from "./EmailPreferences";

export default function Page() {
  return (
    <div className="w-full p-20 flex justify-center">
      <div className="flex w-full flex-col items-center gap-6 max-w-5xl">
        <span className="w-full text-left text-lg font-semibold">
          Preferences
        </span>
        <EmailPreferences />
        <DangerZonePreferences />
      </div>
    </div>
  );
}
