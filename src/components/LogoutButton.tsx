"use client";
import { signOut } from "next-auth/react";
import { LogOut, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type IconComponent = (props: {
  size?: number;
  className?: string;
}) => React.ReactElement;

export default function LogoutButton({
  Icon = LogOut,
  label = "Sair",
}: {
  Icon?: IconComponent;
  label?: string;
}) {
  return (
    <Button
      variant="ghost"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="w-full text-left flex items-center gap-3 p-4 justify-start"
    >
      <Icon size={18} className="text-muted" />
      <span className="flex-1">{label}</span>
      <ChevronRight size={16} className="text-muted" />
    </Button>
  );
}
