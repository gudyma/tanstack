"use client";

import { CheckIcon, Moon, Sun, Settings } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const themeOptions = [
	{ value: "theme-light", label: "Light", icon: Sun },
	{ value: "dark", label: "Dark", icon: Moon },
	{ value: "system", label: "System", icon: Settings },
] as const;

export function ModeToggle() {
	const [theme, setThemeState] = React.useState<
		"theme-light" | "dark" | "system"
	>("theme-light");

	React.useEffect(() => {
		const isDarkMode = document.documentElement.classList.contains("dark");
		setThemeState(isDarkMode ? "dark" : "theme-light");
	}, []);

	React.useEffect(() => {
		const isDark =
			theme === "dark" ||
			(theme === "system" &&
				window.matchMedia("(prefers-color-scheme: dark)").matches);
		document.documentElement.classList[isDark ? "add" : "remove"]("dark");
	}, [theme]);

	return (
		<ol
			aria-label="Choose theme"
			className="divide-text/20 divide-y divide-dashed rounded-2xl overflow-y-auto p-1"
		>
			{themeOptions.map(({ value, label, icon: Icon }) => (
				<li className="py-1" key={value}>
					<button
						type="button"
						aria-pressed={theme === value}
						onClick={() => setThemeState(value)}
						className={cn(
							"flex w-full flex-row items-center hover:bg-muted rounded-md justify-between gap-3 px-2 py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
							theme === value ? "border" : "",
						)}
					>
						<span className="flex flex-row items-center text-nowrap">
							{theme === value ? (
								<CheckIcon size={20} className="mr-2" aria-hidden="true" />
							) : null}
							{label}
						</span>
						<Icon size={20} className="text-neutral shrink-0" aria-hidden="true" />
					</button>
				</li>
			))}
		</ol>
	);
}
