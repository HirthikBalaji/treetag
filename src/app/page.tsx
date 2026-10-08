import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) {
    if (user.role === "SURVEYOR") {
      redirect("/trees/new");
    }
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
