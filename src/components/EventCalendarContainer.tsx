"use client";

import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const EventCalendarContainer = () => {
	const [value, onChange] = useState<Value>(new Date());
	const [isMounted, setIsMounted] = useState(false);

	//3. Set mounted to true only after the component loads in the browser
	useEffect(() => {
		setIsMounted(true);
	}, []);

	// 4. Don't render the Calendar on the server to avoid the mismatch
	if (!isMounted) {
		return null; // Or return <div className="h-[260px]" /> for a skeleton
	}

	return <Calendar onChange={onChange} value={value} />;
};

export default EventCalendarContainer;
