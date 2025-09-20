"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/auth/register");
  }, [router]);

  return (
    <div className="min-h-dvh flex items-center justify-center">
      <div>Redirecionando...</div>
    </div>
  );
}
