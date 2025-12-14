"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import InputField from "../InputField";
import { createAnnouncement, updateAnnouncement, deleteAnnouncement } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const schema = z.object({
  title: z.string().min(1, { message: "Title is required!" }),
  description: z.string().min(1, { message: "Description is required!" }),
  classId: z.string().optional(),
});

type Inputs = z.infer<typeof schema>;

const AnnouncementForm = ({
  type,
  data,
  setOpen,
}: {
  type: "create" | "update" | "delete";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: data,
  });

  const router = useRouter();
  const [state, setState] = useState<{ success: boolean; error: boolean; message?: string }>({
    success: false,
    error: false,
  });
  
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
      const fetchClasses = async () => {
          const { data } = await supabase.from("classes").select("id, name");
          if (data) setClasses(data);
      };
      fetchClasses();
  }, []);

  const onSubmit = handleSubmit(async (formData) => {
    let result;
    const form = new FormData();
    
    if (type === "delete") {
       // For delete, we just need to trigger the action
       // The actual deletion happens in the handleDelete function below
       return; 
    }

    form.append("title", formData.title);
    form.append("description", formData.description);
    if (formData.classId) form.append("classId", formData.classId);

    if (type === "create") {
      result = await createAnnouncement(form);
    } else if (type === "update") {
      form.append("id", data.id);
      result = await updateAnnouncement(form);
    }

    if (result?.success) {
      setOpen(false);
      router.refresh();
    } else {
      setState({ success: false, error: true, message: result?.error || "Operation failed" });
    }
  });

  const handleDelete = async (e: React.FormEvent) => {
      e.preventDefault();
      const result = await deleteAnnouncement(data.id);
      if (result.success) {
          setOpen(false);
          router.refresh();
      } else {
          setState({ success: false, error: true, message: result.error || "Deletion failed" });
      }
  };

  // DELETE VIEW
  if (type === "delete") {
      return (
          <form onSubmit={handleDelete} className="p-4 flex flex-col gap-4">
              <span className="text-center font-medium text-gray-700 dark:text-gray-200">
                  Are you sure you want to delete this announcement?
              </span>
              <button className="bg-red-600 text-white py-2 px-4 rounded-md w-max self-center hover:bg-red-700">
                  Delete
              </button>
              {state.error && <p className="text-red-500 text-sm text-center">{state.message}</p>}
          </form>
      );
  }

  // CREATE / UPDATE VIEW
  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold dark:text-dark-text">
        {type === "create" ? "New Announcement" : "Update Announcement"}
      </h1>
      
      <div className="flex flex-col gap-4">
        <InputField 
            label="Title" 
            name="title" 
            register={register} 
            error={errors.title} 
        />
        
        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs text-gray-500 dark:text-dark-textSecondary">Class (Optional)</label>
          <select 
            {...register("classId")} 
            className="ring-[1.5px] ring-gray-300 dark:ring-dark-border dark:bg-dark-bg dark:text-dark-text p-2 rounded-md text-sm w-full"
            defaultValue={data?.class_id}
          >
            <option value="">All Classes</option>
            {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs text-gray-500 dark:text-dark-textSecondary">Description</label>
          <textarea
            className="ring-[1.5px] ring-gray-300 dark:ring-dark-border dark:bg-dark-bg dark:text-dark-text p-2 rounded-md text-sm w-full h-32 resize-none"
            {...register("description")}
          />
          {errors.description?.message && (
            <p className="text-xs text-red-400">{errors.description.message}</p>
          )}
        </div>
      </div>

      {state.error && <p className="text-red-500 text-sm">{state.message}</p>}
      
      <button className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default AnnouncementForm;
// ```

// **Update `ui/src/components/FormModal.tsx`**: Ensure the form receives the correct `type` prop.

// The existing `FormModal.tsx` logic is:
// ```typescript
// return type === "delete" && id ? (
//     // Generic delete form logic inside FormModal component itself
// ) : ...
// ```
// Wait, your `FormModal.tsx` currently has a *generic* delete form hardcoded inside it.
// ```typescript
// const Form = () => {
//     return type === "delete" && id ? (
//         <form action="" className="p-4 flex flex-col gap-4">
//             <span className="text-center font-medium dark:text-dark-text">
//                 All data will be lost. Are you sure you want to delete this {table}?
//             </span>
//             <button className="bg-red-700 text-white py-2 px-4 rounded-md border-none w-max self-center">
//                 Delete
//             </button>
//         </form>
//     ) : ...


// "use client";

// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import InputField from "../InputField";
// import { createAnnouncement } from "@/lib/actions";
// import { useRouter } from "next/navigation";
// import { Dispatch, SetStateAction, useState } from "react";

// const schema = z.object({
// 	title: z.string().min(1, { message: "Title is required!" }),
// 	description: z.string().min(1, { message: "Description is required!" }),
// 	classId: z.string().optional(), // Optional: specific class ID
// });

// type Inputs = z.infer<typeof schema>;

// const AnnouncementForm = ({
// 	type,
// 	data,
// 	setOpen,
// }: {
// 	type: "create" | "update";
// 	data?: any;
// 	setOpen: Dispatch<SetStateAction<boolean>>;
// }) => {
// 	const {
// 		register,
// 		handleSubmit,
// 		formState: { errors },
// 	} = useForm<Inputs>({
// 		resolver: zodResolver(schema),
// 		defaultValues: data || {},
// 	});

// 	const router = useRouter();
// 	const [state, setState] = useState<{
// 		success: boolean;
// 		error: boolean;
// 		message?: string;
// 	}>({ success: false, error: false });

// 	const onSubmit = handleSubmit(async (data) => {
// 		if (type === "create") {
// 			const formData = new FormData();
// 			formData.append("title", data.title);
// 			formData.append("description", data.description);
// 			if (data.classId) formData.append("classId", data.classId);

// 			const result = await createAnnouncement(formData);

// 			if (result.success) {
// 				setOpen(false);
// 				router.refresh();
// 			} else {
// 				setState({
// 					success: false,
// 					error: true,
// 					message: result.error as string,
// 				});
// 			}
// 		}
// 	});

// 	return (
// 		<form className='flex flex-col gap-8' onSubmit={onSubmit}>
// 			<h1 className='text-xl font-semibold dark:text-dark-text'>
// 				{type === "create" ? "New Announcement" : "Update Announcement"}
// 			</h1>

// 			<div className='flex flex-col gap-4'>
// 				<InputField
// 					label='Title'
// 					name='title'
// 					register={register}
// 					error={errors.title}
// 				/>

// 				<div className='flex flex-col gap-2 w-full'>
// 					<label className='text-xs text-gray-500 dark:text-dark-textSecondary'>
// 						Description
// 					</label>
// 					<textarea
// 						className='ring-[1.5px] ring-gray-300 dark:ring-dark-border dark:bg-dark-bg dark:text-dark-text p-2 rounded-md text-sm w-full'
// 						{...register("description")}
// 						rows={4}
// 					/>
// 					{errors.description?.message && (
// 						<p className='text-xs text-red-400'>{errors.description.message}</p>
// 					)}
// 				</div>

// 				{/* Optional: Class Selection if you want to target specific classes */}
// 			</div>

// 			{state.error && <p className='text-red-500 text-sm'>{state.message}</p>}
// 			<button className='bg-blue-400 text-white p-2 rounded-md'>Create</button>
// 		</form>
// 	);
// };

// export default AnnouncementForm;
