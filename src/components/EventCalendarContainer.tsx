"use client";

import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const EventCalendarContainer = () => {
	const [value, onChange] = useState<Value>(new Date());
	return <Calendar onChange={onChange} value={value} />;
};

export default EventCalendarContainer;
