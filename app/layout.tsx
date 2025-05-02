import { cn } from "@/lib/utils";
import { jaJP } from "@clerk/localizations";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

const IBMPlex = IBM_Plex_Sans({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	variable: "--font-ibm-plex",
});

export const metadata: Metadata = {
	title: "AI station",
	description: "AI-powered image generator",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<ClerkProvider
			localization={jaJP}
			appearance={{
				variables: { colorPrimary: "#624cf5" }, // Clerk のボタンの色を変えることができる
			}}
			afterSignOutUrl="/"
		>
			<html lang="en" suppressHydrationWarning>
				<body
					className={cn("font-IBMPlex antialiased", IBMPlex.variable)}
				>
					{children}
				</body>
			</html>
		</ClerkProvider>
	);
}
