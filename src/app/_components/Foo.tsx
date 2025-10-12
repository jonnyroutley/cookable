"use client";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutMenuButton() {
	return (
		<DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
			<LogOut />
			<span>Log out</span>
			{/* <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut> */}
		</DropdownMenuItem>
	);
}
