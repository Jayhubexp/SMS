"use client";

import { useFormStatus } from "react-dom";
import { assignFeeToClass } from "@/lib/actions/feeActions";
import { useState } from "react";
import Image from "next/image";

const AssignFeeButton = ({ feeId, classId }: { feeId: number; classId: number }) => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAssign = async () => {
    const confirm = window.confirm("Are you sure you want to assign this fee to all students in this class?");
    if (!confirm) return;

    setLoading(true);
    const result = await assignFeeToClass(feeId, classId);
    setLoading(false);
    
    if (result.success) {
      alert(result.message);
    } else {
      alert("Error: " + result.message);
    }
  };

  return (
    <button 
      onClick={handleAssign} 
      disabled={loading}
      className="w-7 h-7 flex items-center justify-center rounded-full bg-purple-100 hover:bg-purple-200 transition-colors"
      title="Assign to all students in class"
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></span>
      ) : (
        <Image src="/update.png" alt="Assign" width={16} height={16} />
      )}
    </button>
  );
};

export default AssignFeeButton;