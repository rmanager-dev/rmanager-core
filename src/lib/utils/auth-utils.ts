import { db } from "@/src/db";
import { user } from "@/src/db/schema";
import { eq } from "drizzle-orm";

export async function CheckUserExist(UserId: string): Promise<boolean> {
  const userProfile = await db.query.user.findFirst({
    where: eq(user.id, UserId),
    columns: { id: true },
  });
  return !!userProfile;
}
