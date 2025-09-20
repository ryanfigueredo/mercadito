import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./prisma";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/auth/login?callbackUrl=/admin");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { isAdmin: true, name: true, email: true },
  });

  if (!user?.isAdmin) {
    redirect("/?error=access_denied");
  }

  return user;
}

export async function isUserAdmin(email: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { isAdmin: true },
    });

    return user?.isAdmin || false;
  } catch {
    return false;
  }
}
