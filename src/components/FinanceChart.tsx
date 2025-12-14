"use client";

import Image from "next/image";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";

const data = [
	{
		name: "Jan",
		academic_fees: 4000,
		book_fees: 1500,
		souvenirs: 300,
		expense: 2400,
	},
	{
		name: "Feb",
		academic_fees: 3000,
		book_fees: 2000,
		souvenirs: 500,
		expense: 1398,
	},
	{
		name: "Mar",
		academic_fees: 2000,
		book_fees: 1000,
		souvenirs: 200,
		expense: 9800,
	},
	{
		name: "Apr",
		academic_fees: 2780,
		book_fees: 1200,
		souvenirs: 400,
		expense: 3908,
	},
	{
		name: "May",
		academic_fees: 1890,
		book_fees: 800,
		souvenirs: 100,
		expense: 4800,
	},
	{
		name: "Jun",
		academic_fees: 2390,
		book_fees: 1100,
		souvenirs: 600,
		expense: 3800,
	},
	{
		name: "Jul",
		academic_fees: 3490,
		book_fees: 1300,
		souvenirs: 300,
		expense: 4300,
	},
	// ... add data for other months
];

const FinanceChart = () => {
	return (
		<div className='bg-white dark:bg-dark-bgSecondary rounded-xl w-full h-full p-4'>
			<div className='flex justify-between items-center'>
				<h1 className='text-lg font-semibold dark:text-dark-text'>Finance</h1>
				<Image src='/moreDark.png' alt='' width={20} height={20} />
			</div>
			<ResponsiveContainer width='100%' height='90%'>
				<LineChart
					width={500}
					height={300}
					data={data}
					margin={{
						top: 5,
						right: 30,
						left: 20,
						bottom: 5,
					}}>
					<CartesianGrid
						strokeDasharray='3 3'
						stroke='#ddd dark:stroke-dark-border'
					/>
					<XAxis
						dataKey='name'
						axisLine={false}
						tick={{ fill: "#d1d5db" }}
						tickLine={false}
						tickMargin={10}
					/>
					<YAxis
						type='number'
						axisLine={false}
						tick={{ fill: "#d1d5db" }}
						tickLine={false}
						tickMargin={20}
						width={40}
					/>
					<Tooltip
						contentStyle={{
							backgroundColor: "black",
							borderRadius: "5px",
							border: "none",
						}}
						labelStyle={{ color: "white" }}
					/>
					<Legend
						align='center'
						verticalAlign='top'
						wrapperStyle={{ paddingTop: "10px", paddingBottom: "30px" }}
					/>
					<Line
						type='monotone'
						dataKey='academic_fees'
						stroke='#C3EBFA'
						strokeWidth={5}
						name='Academic Fees'
					/>
					<Line
						type='monotone'
						dataKey='book_fees'
						stroke='#FAE27C'
						strokeWidth={5}
						name='Book Fees'
					/>
					<Line
						type='monotone'
						dataKey='souvenirs'
						stroke='#FDBA74' // orange
						strokeWidth={5}
						name='Souvenirs'
					/>
					<Line
						type='monotone'
						dataKey='expense'
						stroke='#CFCEFF'
						strokeWidth={5}
						name='Expense'
					/>
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
};

export default FinanceChart;
