"use client";

const PrintButton = () => {
  return (
    <button
      onClick={() => window.print()}
      className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold shadow-lg hover:bg-blue-700"
    >
      Print Receipt
    </button>
  );
};

export default PrintButton;