"use client";

import {
	Github,
	LifeBuoy,
	LogIn,
	LogOut,
	Mail,
	User,
	UserPlus,
	Users,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuSeparator,
	// DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SignOutMenuButton } from "./Foo";

function LoggedInMenu({ name }: { name: string }) {
	return (
		<>
			<DropdownMenuLabel>{name}</DropdownMenuLabel>
			<DropdownMenuSeparator />
			<DropdownMenuGroup>
				<Link href="/profile">
					<DropdownMenuItem>
						<User />
						<span>Profile</span>
						{/* <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut> */}
					</DropdownMenuItem>
				</Link>
			</DropdownMenuGroup>
			<DropdownMenuSeparator />
			<DropdownMenuGroup>
				<DropdownMenuItem>
					<Users />
					<span>Team</span>
				</DropdownMenuItem>
				<DropdownMenuSub>
					<DropdownMenuSubTrigger>
						<UserPlus />
						<span>Invite users</span>
					</DropdownMenuSubTrigger>
					<DropdownMenuPortal>
						<DropdownMenuSubContent>
							<DropdownMenuItem>
								<Mail />
								<span>Email</span>
							</DropdownMenuItem>
						</DropdownMenuSubContent>
					</DropdownMenuPortal>
				</DropdownMenuSub>
			</DropdownMenuGroup>
			<DropdownMenuSeparator />
			<Link
				href="https://github.com/jonnyroutley/cookable"
				className="hover:cursor-pointer"
			>
				<DropdownMenuItem>
					<Github />
					GitHub
				</DropdownMenuItem>
			</Link>
			<DropdownMenuItem>
				<LifeBuoy />
				<span>Support</span>
			</DropdownMenuItem>
			<DropdownMenuSeparator />
			<SignOutMenuButton />
		</>
	);
}

function LoggedOutMenu() {
	return (
		<>
			<DropdownMenuLabel>Account</DropdownMenuLabel>
			<DropdownMenuSeparator />
			<DropdownMenuGroup>
				<Link href="/auth/signin">
					<DropdownMenuItem>
						<LogIn />
						<span>Sign In</span>
					</DropdownMenuItem>
				</Link>
			</DropdownMenuGroup>
		</>
	);
}

export function UserMenu() {
	const { data: session } = useSession();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button>
					<User />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56">
				{session?.user ? (
					<LoggedInMenu name={session.user.name || "My Account"} />
				) : (
					<LoggedOutMenu />
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
