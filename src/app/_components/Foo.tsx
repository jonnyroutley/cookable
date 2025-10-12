"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export function SignOutMenuButton() {
	return (
		<DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
			<LogOut />
			<span>Log out</span>
			{/* <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut> */}
		</DropdownMenuItem>
	);
}
