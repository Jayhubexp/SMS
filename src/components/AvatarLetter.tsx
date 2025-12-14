"use client";

import React from "react";

interface AvatarLetterProps {
	firstName: string;
	lastName?: string;
	size?: "sm" | "md" | "lg";
	className?: string;
}

const AvatarLetter: React.FC<AvatarLetterProps> = ({
	firstName,
	lastName,
	size = "md",
	className = "",
}) => {
	// Get the first letter of the first name
	const letter = firstName?.charAt(0)?.toUpperCase() || "?";

	// Define size classes
	const sizeClasses = {
		sm: "w-6 h-6 text-xs",
		md: "w-8 h-8 text-sm",
		lg: "w-12 h-12 text-lg",
	};

	// Generate a consistent color based on the first letter
	const getBackgroundColor = (letter: string) => {
		const colors = [
			"bg-red-500",
			"bg-blue-500",
			"bg-green-500",
			"bg-yellow-500",
			"bg-purple-500",
			"bg-pink-500",
			"bg-indigo-500",
			"bg-teal-500",
			"bg-orange-500",
			"bg-cyan-500",
		];

		const charCode = letter.charCodeAt(0);
		return colors[charCode % colors.length];
	};

	return (
		<div
			className={`
        ${sizeClasses[size]}
        ${getBackgroundColor(letter)}
        rounded-full
        flex items-center justify-center
        text-white
        font-semibold
        cursor-pointer
        transition-transform
        hover:scale-110
        ${className}
      `}
			title={`${firstName}${lastName ? " " + lastName : ""}`}>
			{letter}
		</div>
	);
};

export default AvatarLetter;
