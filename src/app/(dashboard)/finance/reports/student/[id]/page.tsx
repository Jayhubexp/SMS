import { supabaseAdmin } from "@/lib/supabaseAdmin";
import Table from "@/components/Table";
import { getFinanceReportByStudent } from "@/lib/actions";
import Link from "next/link";

const StudentFinanceReportPage = async ({
	params,
}: {
	params: { [key: string]: string };
}) => {
	const { id } = params;
	const studentId = parseInt(id);

	const { data: student } = await supabaseAdmin
		.from("students")
		.select("id, student_id, users(first_name, last_name), classes(name)")
		.eq("id", studentId)
		.single();

	const report = await getFinanceReportByStudent(studentId);

	if (!report.success) {
		return <div className="p-4 text-red-500">Failed to load report</div>;
	}

	const { fees, payments, discounts } = report.data;

	const totalFees =
		fees?.reduce((sum: number, f: any) => sum + (f.fee_items?.amount || 0), 0) ||
		0;
	const totalPaid =
		payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0;
	const totalDiscount =
		discounts?.reduce((sum: number, d: any) => {
			if (d.type === "percentage") {
				return sum + (totalFees * d.value) / 100;
			}
			return sum + d.value;
		}, 0) || 0;

	const balance = Math.max(0, totalFees - totalDiscount - totalPaid);

	return (
		<div className="bg-white dark:bg-dark-bgSecondary p-4 rounded-md m-4 flex-1">
			<div className="mb-6">
				<h1 className="text-2xl font-bold dark:text-dark-text">
					Financial Report
				</h1>
				{student && (
					<p className="text-gray-600 dark:text-gray-400">
						Student: {student.first_name} {student.last_name} |
						ID: {student.admission_number} | Class: {student.classes?.name || "N/A"}
					</p>
				)}
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
				<div className="bg-blue-50 dark:bg-blue-900 p-4 rounded">
					<h3 className="text-sm font-semibold dark:text-blue-200">
						Total Billed
					</h3>
					<p className="text-2xl font-bold text-blue-600 dark:text-blue-300">
						GHS {totalFees.toFixed(2)}
					</p>
				</div>

				<div className="bg-green-50 dark:bg-green-900 p-4 rounded">
					<h3 className="text-sm font-semibold dark:text-green-200">
						Total Paid
					</h3>
					<p className="text-2xl font-bold text-green-600 dark:text-green-300">
						GHS {totalPaid.toFixed(2)}
					</p>
				</div>

				<div className="bg-purple-50 dark:bg-purple-900 p-4 rounded">
					<h3 className="text-sm font-semibold dark:text-purple-200">
						Total Discount
					</h3>
					<p className="text-2xl font-bold text-purple-600 dark:text-purple-300">
						GHS {totalDiscount.toFixed(2)}
					</p>
				</div>

				<div className={`p-4 rounded ${
					balance > 0 ? "bg-red-50 dark:bg-red-900" : "bg-green-50 dark:bg-green-900"
				}`}>
					<h3 className={`text-sm font-semibold ${
						balance > 0 ? "dark:text-red-200" : "dark:text-green-200"
					}`}>
						Outstanding Balance
					</h3>
					<p className={`text-2xl font-bold ${
						balance > 0 ? "text-red-600 dark:text-red-300" : "text-green-600 dark:text-green-300"
					}`}>
						GHS {balance.toFixed(2)}
					</p>
				</div>
			</div>

			{/* Fees Section */}
			<div className="mb-6">
				<h2 className="text-lg font-bold mb-2 dark:text-dark-text">
					Fees Assigned
				</h2>
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead className="bg-gray-100 dark:bg-dark-border">
							<tr>
								<th className="p-2 text-left">Fee Type</th>
								<th className="p-2 text-left">Amount</th>
							</tr>
						</thead>
						<tbody>
							{fees && fees.length > 0 ? (
								fees.map((fee: any) => (
									<tr
										key={fee.id}
										className="border-b dark:border-dark-border">
										<td className="p-2">
											{fee.fee_items?.fee_structures?.name || "Unknown"}
										</td>
										<td className="p-2 font-semibold">
											GHS {(fee.fee_items?.amount || 0).toFixed(2)}
										</td>
									</tr>
								))
							) : (
								<tr>
									<td colSpan={2} className="p-2 text-center text-gray-500">
										No fees assigned
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Payments Section */}
			<div className="mb-6">
				<h2 className="text-lg font-bold mb-2 dark:text-dark-text">
					Payments Recorded
				</h2>
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead className="bg-gray-100 dark:bg-dark-border">
							<tr>
								<th className="p-2 text-left">Date</th>
								<th className="p-2 text-left">Method</th>
								<th className="p-2 text-left">Amount</th>
							</tr>
						</thead>
						<tbody>
							{payments && payments.length > 0 ? (
								payments.map((payment: any, idx: number) => (
									<tr
										key={idx}
										className="border-b dark:border-dark-border">
										<td className="p-2">
											{new Date(payment.payment_date).toLocaleDateString()}
										</td>
										<td className="p-2">{payment.payment_method}</td>
										<td className="p-2 font-semibold">
											GHS {(payment.amount || 0).toFixed(2)}
										</td>
									</tr>
								))
							) : (
								<tr>
									<td colSpan={3} className="p-2 text-center text-gray-500">
										No payments recorded
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Discounts Section */}
			{discounts && discounts.length > 0 && (
				<div className="mb-6">
					<h2 className="text-lg font-bold mb-2 dark:text-dark-text">
						Applied Discounts
					</h2>
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead className="bg-gray-100 dark:bg-dark-border">
								<tr>
									<th className="p-2 text-left">Discount Name</th>
									<th className="p-2 text-left">Type</th>
									<th className="p-2 text-left">Value</th>
								</tr>
							</thead>
							<tbody>
								{discounts.map((discount: any, idx: number) => (
									<tr key={idx} className="border-b dark:border-dark-border">
										<td className="p-2">{discount.name}</td>
										<td className="p-2">
											{discount.type === "percentage" ? "Percentage" : "Fixed"}
										</td>
										<td className="p-2 font-semibold">
											{discount.type === "percentage"
												? `${discount.value}%`
												: `GHS ${discount.value.toFixed(2)}`}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}

			<Link
				href="/finance"
				className="inline-block mt-4 bg-blue-400 text-white p-2 rounded hover:bg-blue-500">
				Back to Finance
			</Link>
		</div>
	);
};

export default StudentFinanceReportPage;
