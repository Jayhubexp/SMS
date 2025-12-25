import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getFinanceReportByClass } from "@/lib/actions";
import Link from "next/link";

const ClassFinanceReportPage = async ({
	params,
}: {
	params: { [key: string]: string };
}) => {
	const { id } = params;
	const classId = parseInt(id);

	const { data: classData } = await supabaseAdmin
		.from("classes")
		.select("id, name")
		.eq("id", classId)
		.single();

	const report = await getFinanceReportByClass(classId);

	if (!report.success) {
		return <div className="p-4 text-red-500">Failed to load report</div>;
	}

	const { students, totals } = report.data;

	return (
		<div className="bg-white dark:bg-dark-bgSecondary p-4 rounded-md m-4 flex-1">
			<div className="mb-6">
				<h1 className="text-2xl font-bold dark:text-dark-text">
					Class Finance Report
				</h1>
				{classData && (
					<p className="text-gray-600 dark:text-gray-400">
						Class: {classData.name}
					</p>
				)}
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
				<div className="bg-blue-50 dark:bg-blue-900 p-4 rounded">
					<h3 className="text-sm font-semibold dark:text-blue-200">
						Total Billed
					</h3>
					<p className="text-2xl font-bold text-blue-600 dark:text-blue-300">
						GHS {(totals?.totalBilled || 0).toFixed(2)}
					</p>
				</div>

				<div className="bg-green-50 dark:bg-green-900 p-4 rounded">
					<h3 className="text-sm font-semibold dark:text-green-200">
						Total Paid
					</h3>
					<p className="text-2xl font-bold text-green-600 dark:text-green-300">
						GHS {(totals?.totalPaid || 0).toFixed(2)}
					</p>
				</div>

				<div className="bg-red-50 dark:bg-red-900 p-4 rounded">
					<h3 className="text-sm font-semibold dark:text-red-200">
						Outstanding Balance
					</h3>
					<p className="text-2xl font-bold text-red-600 dark:text-red-300">
						GHS {(totals?.outstandingBalance || 0).toFixed(2)}
					</p>
				</div>
			</div>

			{/* Students Report Table */}
			<div className="mb-6">
				<h2 className="text-lg font-bold mb-2 dark:text-dark-text">
					Student Breakdown
				</h2>
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead className="bg-gray-100 dark:bg-dark-border">
							<tr>
								<th className="p-2 text-left">Student ID</th>
								<th className="p-2 text-left">Name</th>
								<th className="p-2 text-right">Total Billed</th>
								<th className="p-2 text-right">Total Paid</th>
								<th className="p-2 text-right">Balance</th>
								<th className="p-2 text-center">Action</th>
							</tr>
						</thead>
						<tbody>
							{students && students.length > 0 ? (
								students.map((student: any) => (
									<tr
										key={student.studentId}
										className="border-b dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-border">
										<td className="p-2 font-mono text-xs">
											{student.studentId}
										</td>
										<td className="p-2">{student.name}</td>
										<td className="p-2 text-right font-semibold">
											GHS {student.totalBilled.toFixed(2)}
										</td>
										<td className="p-2 text-right text-green-600 dark:text-green-400 font-semibold">
											GHS {student.totalPaid.toFixed(2)}
										</td>
										<td className={`p-2 text-right font-semibold ${
											student.balance > 0
												? "text-red-600 dark:text-red-400"
												: "text-green-600 dark:text-green-400"
										}`}>
											GHS {student.balance.toFixed(2)}
										</td>
										<td className="p-2 text-center">
											<Link
												href={`/finance/reports/student/${student.studentId}`}
												className="text-blue-500 hover:underline text-xs">
												View
											</Link>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td colSpan={6} className="p-2 text-center text-gray-500">
										No students in this class
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			<Link
				href="/finance"
				className="inline-block mt-4 bg-blue-400 text-white p-2 rounded hover:bg-blue-500">
				Back to Finance
			</Link>
		</div>
	);
};

export default ClassFinanceReportPage;
