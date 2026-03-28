"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to leave page
    router.push("/dashboard/leave");
  }, [router]);

  return null;
}
