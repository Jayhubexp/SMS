import { FieldError } from "react-hook-form";

type InputFieldProps = {
	label: string;
	type?: string;
	register: any;
	name: string;
	defaultValue?: string;
	error?: FieldError;
	inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
	widthClass?: string; // Add this prop
};

const InputField = ({
	label,
	type = "text",
	register,
	name,
	defaultValue,
	error,
	inputProps,
	widthClass = "w-full md:w-full", // Add default value
}: InputFieldProps) => {
	return (
		// Use the new prop here instead of the hardcoded class
		<div className={`flex flex-col gap-2 ${widthClass}`}>
			<label className='text-xs text-gray-500 dark:text-dark-textSecondary'>
				{label}
			</label>
			<input
				type={type}
				{...register(name)}
				className='ring-[1.5px] ring-gray-300 dark:ring-dark-border dark:bg-dark-bg dark:text-dark-text p-2 rounded-md text-sm w-full'
				{...inputProps}
				defaultValue={defaultValue}
			/>
			{error?.message && (
				<p className='text-xs text-red-400'>{error.message.toString()}</p>
			)}
		</div>
	);
};

export default InputField;
