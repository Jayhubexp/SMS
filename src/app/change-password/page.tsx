import ChangePasswordForm from "@/components/forms/ChangePasswordForm";
import Image from "next/image";

const ChangePasswordPage = () => {
	return (
		<div className='min-h-screen bg-gray-100 flex items-center justify-center p-4'>
			<div className='w-full max-w-md'>
				<div className='flex justify-center mb-8'>
					<Image
						src='/logo.jpg'
						alt='Logo'
						width={80}
						height={80}
						className='rounded-full'
					/>
				</div>
				<ChangePasswordForm />
			</div>
		</div>
	);
};

export default ChangePasswordPage;
