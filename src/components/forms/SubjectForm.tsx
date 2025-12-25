"use client";

import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { createSubject, updateSubject, getClasses, getTeachersForDropdown } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useState, useEffect } from "react";

const SubjectForm = ({
  setOpen,
  type,
  data,
}: {
  setOpen: Dispatch<SetStateAction<boolean>>;
  type?: "create" | "update";
  data?: any;
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: data,
  });
  const router = useRouter();
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const clsRes = await getClasses();
      const tchRes = await getTeachersForDropdown();
      if (clsRes.success) setClasses(clsRes.data);
      if (tchRes.success) setTeachers(tchRes.data);
    };
    fetchData();
  }, []);

  const onSubmit = handleSubmit(async (formData: any) => {
    const payload = new FormData();
    payload.append("name", formData.name);
    if (formData.classId) payload.append("classId", formData.classId);
    if (formData.teacherId) payload.append("teacherId", formData.teacherId);

    let res;
    if (type === "update") {
      payload.append("id", data.id);
      res = await updateSubject(payload);
    } else {
      res = await createSubject(payload);
    }

    if (res.success) {
      setOpen(false);
      router.refresh();
    } else {
      alert(res.error || "Operation failed");
    }
  });

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <h1 className="text-xl font-bold">
        {type === "create" ? "Create Subject" : "Edit Subject"}
      </h1>

      <InputField
        label="Subject Name"
        name="name"
        register={register}
        error={errors.name}
      />

      <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-500">Class</label>
        <select
          {...register("classId")}
          className="p-2 border rounded-md text-sm"
          defaultValue={data?.class_id}
        >
          <option value="">Select Class</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-500">Teacher</label>
        <select
          {...register("teacherId")}
          className="p-2 border rounded-md text-sm"
          defaultValue={data?.teacher_id}
        >
          <option value="">Select Teacher</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.first_name} {t.last_name}
            </option>
          ))}
        </select>
      </div>

      <button className="bg-blue-600 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default SubjectForm;