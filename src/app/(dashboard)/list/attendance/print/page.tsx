import { supabaseAdmin } from "@/lib/supabaseAdmin";
import Image from "next/image";

// This is a Server Component
export default async function PrintAttendancePage({
	searchParams,
}: {
	searchParams: { classId?: string; date?: string };
}) {
	const classId = searchParams.classId;
	const date = searchParams.date || new Date().toISOString().split("T")[0];

	// 1. Fetch Classes for Dropdown
	const { data: classes } = await supabaseAdmin
		.from("classes")
		.select("id, name")
		.order("name");

	// 2. Fetch Students if class selected
	let students = [];
	let className = "";

	if (classId) {
		// Get class name
		const selectedClass = classes?.find((c) => c.id.toString() === classId);
		className = selectedClass?.name || "";

		// Get students in this class via class_enrollments
		// Note: Your schema uses 'class_enrollments' to link students to classes
		const { data: enrollmentData } = await supabaseAdmin
			.from("class_enrollments")
			.select(
				`
        student_id,
        students (
          id,
          admission_number,
          users (first_name, last_name)
        )
      `,
			)
			.eq("class_id", classId); // Assuming 'class_id' is integer in DB

		if (enrollmentData) {
			students = enrollmentData
				.map((e: any) => e.students)
				.sort((a: any, b: any) =>
					a.users.last_name.localeCompare(b.users.last_name),
				);
		}
	}

	return (
		<div className='p-6 max-w-5xl mx-auto bg-white min-h-screen text-black'>
			{/* Controls - Hidden when printing */}
			<div className='mb-8 print:hidden bg-gray-100 p-4 rounded-lg flex flex-wrap gap-4 items-end'>
				<form className='flex gap-4 items-end w-full'>
					<div className='flex flex-col gap-1 w-full md:w-1/3'>
						<label className='text-sm font-semibold text-gray-700'>
							Select Class
						</label>
						<select
							name='classId'
							defaultValue={classId}
							className='p-2 border rounded-md w-full'
							// Auto-submit on change using a small script or just standard form submission button
						>
							<option value=''>-- Choose Class --</option>
							{classes?.map((c) => (
								<option key={c.id} value={c.id}>
									{c.name}
								</option>
							))}
						</select>
					</div>
					<div className='flex flex-col gap-1 w-full md:w-1/3'>
						<label className='text-sm font-semibold text-gray-700'>
							Week Commencing
						</label>
						<input
							type='date'
							name='date'
							defaultValue={date}
							className='p-2 border rounded-md w-full'
						/>
					</div>
					<button className='bg-blue-600 text-white px-6 py-2 rounded-md font-bold hover:bg-blue-700'>
						Load Sheet
					</button>
				</form>

				{classId && (
					<button
						onClick={() => window.print()} // Client-side print
						className='ml-auto bg-green-600 text-white px-6 py-2 rounded-md font-bold hover:bg-green-700 flex items-center gap-2'>
						<Image
							src='/attendance.png'
							alt=''
							width={20}
							height={20}
							className='brightness-0 invert'
						/>
						Print Sheet
					</button>
				)}
				<script
					dangerouslySetInnerHTML={{
						__html: `document.querySelector('.bg-green-600').onclick = () => window.print()`,
					}}
				/>
			</div>

			{/* Printable Sheet */}
			{classId ? (
				<div className='print:w-full'>
					{/* Header */}
					<div className='flex justify-between items-center border-b-2 border-black pb-4 mb-4'>
						<div className='flex items-center gap-4'>
							<Image src='/logo.jpg' alt='Logo' width={60} height={60} />
							<div>
								<h1 className='text-2xl font-bold uppercase tracking-wide'>
									Mercy Schools Limited
								</h1>
								<p className='text-sm text-gray-600'>
									Class Attendance Register
								</p>
							</div>
						</div>
						<div className='text-right'>
							<p className='text-xl font-bold'>Class: {className}</p>
							<p className='text-sm'>
								Week of: {new Date(date).toLocaleDateString()}
							</p>
						</div>
					</div>

					{/* Table */}
					<table className='w-full border-collapse border border-black text-sm'>
						<thead>
							<tr className='bg-gray-200 print:bg-gray-100'>
								<th className='border border-black p-2 w-10'>#</th>
								<th className='border border-black p-2 text-left'>
									Student Name
								</th>
								<th className='border border-black p-2 text-left w-24'>ID</th>
								{/* Days of the Week Columns */}
								{["Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => (
									<th
										key={day}
										className='border border-black p-2 w-16 text-center'>
										{day}
									</th>
								))}
								<th className='border border-black p-2 w-24 text-center'>
									Remarks
								</th>
							</tr>
						</thead>
						<tbody>
							{students.length > 0 ? (
								students.map((student: any, index: number) => (
									<tr key={student.id} className='break-inside-avoid'>
										<td className='border border-black p-2 text-center'>
											{index + 1}
										</td>
										<td className='border border-black p-2 font-medium'>
											{student.users?.last_name}, {student.users?.first_name}
										</td>
										<td className='border border-black p-2 font-mono text-xs'>
											{student.admission_number}
										</td>
										{/* Empty cells for marking */}
										<td className='border border-black p-2'></td>
										<td className='border border-black p-2'></td>
										<td className='border border-black p-2'></td>
										<td className='border border-black p-2'></td>
										<td className='border border-black p-2'></td>
										<td className='border border-black p-2'></td>
									</tr>
								))
							) : (
								<tr>
									<td
										colSpan={9}
										className='border border-black p-8 text-center text-gray-500 italic'>
										No students found in this class.
									</td>
								</tr>
							)}
						</tbody>
					</table>

					{/* Footer */}
					<div className='mt-8 flex justify-between text-xs'>
						<div>
							<p>Class Teacher Signature: __________________________</p>
						</div>
						<div>
							<p>Date: __________________________</p>
						</div>
					</div>
				</div>
			) : (
				<div className='text-center p-20 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg'>
					Select a class above to generate the attendance sheet.
				</div>
			)}
		</div>
	);
}
