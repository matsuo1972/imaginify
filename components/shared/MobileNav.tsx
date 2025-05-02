"use client";

import { navLinks } from "@/constants";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "../ui/sheet";

const MobileNav = () => {
	const pathname = usePathname();
	return (
		<header className="flex justify-between fixed h-16 w-full border-b-4 border-purple-100 bg-white p-5 lg:hidden">
			<Link href="/" className="flex items-center gap-2 md:py-2">
				<Image
					src="/assets/images/logo-text.svg"
					alt="logo"
					width={180}
					height={28}
				/>
			</Link>

			<nav className="flex gap-2">
				<SignedIn>
					<UserButton />
					<Sheet>
						<SheetTrigger>
							<Image
								src="/assets/icons/menu.svg"
								alt="menu"
								width={32}
								height={32}
								className="cursor-pointer"
							/>
						</SheetTrigger>
						<SheetContent className="p-4 sm:w-64">
							<SheetHeader>
								<SheetTitle>
									<Image
										src="/assets/images/logo-text.svg"
										alt="logo"
										width={152}
										height={23}
									/>
								</SheetTitle>
							</SheetHeader>

							<ul className="flex w-full flex-col items-start">
								{navLinks.map((link) => {
									const isActive = link.route === pathname;

									return (
										<li
											key={link.route}
											className={`${
												isActive && "gradient-text"
											} flex whitespace-nowrap text-dark-700`}
										>
											<Link
												className="p-16-semibold flex size-full gap-4 p-4 cursor-pointer"
												href={link.route}
											>
												<Image
													src={link.icon}
													alt="logo"
													width={24}
													height={24}
												/>
												{link.label}
											</Link>
										</li>
									);
								})}
							</ul>
						</SheetContent>
					</Sheet>
				</SignedIn>

				<SignedOut>
					<Button
						asChild
						className="text-black py-4 px-6 flex-center gap-3 rounded-full font-semibold text-[16px] leading-[140%] focus-visible:ring-offset-0 focus-visible:ring-transparent !important bg-purple-gradient bg-cover"
					>
						<Link href="/sign-in">Login</Link>
					</Button>
				</SignedOut>
			</nav>
		</header>
	);
};

export default MobileNav;
