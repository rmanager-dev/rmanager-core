import { Team, teamColumns } from "./components/TeamColumn";
import { TeamTable } from "./components/TeamTable";

const mockData: Team[] = [
  {
    id: "1",
    name: "DSH Studio",
    slug: "dsh-studio-12345678",
    displayName: "DSH Studio!",
    role: "owner",
    joinedAt: new Date(1769350220000),
  },
  {
    id: "2",
    name: "Acme Corp",
    slug: "acme-corp-45fab23d",
    displayName: "Acme Corp",
    role: "developer",
    joinedAt: new Date(1769350220000),
  },
];

export default function Page() {
  return (
    <main className="w-full overflow-auto">
      <div className="w-full px-2 py-10 md:px-10 lg:px-15 xl:px-20 flex justify-center">
        <div className="container mx-auto max-w-5xl">
          <span className="w-full text-left text-lg font-semibold">Teams</span>
          <TeamTable columns={teamColumns} data={mockData} />
        </div>
      </div>
    </main>
  );
}
