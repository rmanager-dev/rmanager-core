"use client";
import { columns, Database } from "./DatabaseColumn";
import { DatabaseTable } from "./DatabaseTable";

const mockData: Database[] = [
  {
    id: "uuid-1",
    name: "Backblaze B2 DB",
    endpoint: "s3.eu-central-003.backblazeb2.com",
    region: "eu-central-003",
    type: "S3",
  },
  {
    id: "uuid-2",
    name: "Amazon S3 DB",
    endpoint: "s3.eu-west-3.amazonaws.com",
    region: "eu-west-3",
    type: "S3",
  },
];

export default function Page() {
  return (
    <>
      <div className="flex flex-col w-full">
        <span className="w-full text-left text-lg font-semibold">
          Databases
        </span>
        <span className="w-full text-left text-sm font-light">
          Link external databases to your account to use in your projects
        </span>
      </div>
      <div className="container mx-auto">
        <DatabaseTable columns={columns} data={mockData} />
      </div>
    </>
  );
}
