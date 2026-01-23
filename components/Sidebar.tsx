"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/AuthProvider";

const navItems = [
	{
		label: "Dashboard",
		href: "/",
		icon: (
			<svg
				className="w-5 h-5"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={1.5}
					d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
				/>
			</svg>
		),
	},
	{
		label: "Campaigns",
		href: "/campaigns",
		icon: (
			<svg
				className="w-5 h-5"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={1.5}
					d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
				/>
			</svg>
		),
	},
	{
		label: "Contacts",
		href: "/contacts",
		icon: (
			<svg
				className="w-5 h-5"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={1.5}
					d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
				/>
			</svg>
		),
	},
	{
		label: "New Discovery",
		href: "/discover",
		icon: (
			<svg
				className="w-5 h-5"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={1.5}
					d="M12 4v16m8-8H4"
				/>
			</svg>
		),
	},
];

const bottomNavItems = [
	{
		label: "Settings",
		href: "/settings",
		icon: (
			<svg
				className="w-5 h-5"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={1.5}
					d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
				/>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={1.5}
					d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
				/>
			</svg>
		),
	},
];

export function Sidebar() {
	const pathname = usePathname();
	const { user, logout } = useAuth();

	const getInitials = () => {
		if (!user) return "?";
		const first = user.first_name?.charAt(0) || "";
		const last = user.last_name?.charAt(0) || "";
		return (first + last).toUpperCase() || "?";
	};

	return (
		<aside className="fixed left-0 top-0 z-40 h-screen w-60 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 flex flex-col">
			{/* Logo */}
			<div className="flex h-14 items-center px-4 border-b border-slate-200 dark:border-slate-800">
				<Link href="/" className="flex items-center gap-2">
					<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 dark:bg-white">
						<span className="text-xs font-bold text-white dark:text-slate-900">
							CR
						</span>
					</div>
					<span className="text-sm font-semibold text-slate-900 dark:text-white">
						ContextReach
					</span>
				</Link>
			</div>

			{/* Main Navigation */}
			<nav className="flex-1 py-4 px-3 space-y-1">
				{navItems.map((item) => {
					const isActive =
						pathname === item.href ||
						(item.href !== "/" && pathname.startsWith(item.href));
					return (
						<Link
							key={item.href}
							href={item.href}
							className={cn(
								"flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
								isActive
									? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
									: "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white"
							)}
						>
							<span
								className={
									isActive
										? "text-slate-900 dark:text-white"
										: "text-slate-400"
								}
							>
								{item.icon}
							</span>
							{item.label}
						</Link>
					);
				})}
			</nav>

			{/* Bottom Section */}
			<div className="border-t border-slate-200 dark:border-slate-800">
				{/* Credits */}
				{user && (
					<div className="p-3">
						<div className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
							<div className="flex items-center justify-between">
								<span className="text-xs text-slate-500 dark:text-slate-400">
									Credits
								</span>
								<span className="text-sm font-semibold text-slate-900 dark:text-white">
									{user.credits?.toLocaleString() ?? 0}
								</span>
							</div>
						</div>
					</div>
				)}

				{/* Settings */}
				<div className="px-3 pb-2">
					{bottomNavItems.map((item) => {
						const isActive = pathname === item.href;
						return (
							<Link
								key={item.href}
								href={item.href}
								className={cn(
									"flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
									isActive
										? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
										: "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white"
								)}
							>
								<span
									className={
										isActive
											? "text-slate-900 dark:text-white"
											: "text-slate-400"
									}
								>
									{item.icon}
								</span>
								{item.label}
							</Link>
						);
					})}
				</div>

				{/* User */}
				<div className="p-3 border-t border-slate-200 dark:border-slate-800">
					{user && (
						<div className="flex items-center gap-3">
							<div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0">
								<span className="text-xs font-medium text-slate-600 dark:text-slate-300">
									{getInitials()}
								</span>
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium text-slate-900 dark:text-white truncate">
									{user.first_name} {user.last_name}
								</p>
								<p className="text-xs text-slate-500 truncate">
									{user.email}
								</p>
							</div>
							<button
								onClick={logout}
								className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
								title="Log out"
							>
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
									/>
								</svg>
							</button>
						</div>
					)}
				</div>
			</div>
		</aside>
	);
}
