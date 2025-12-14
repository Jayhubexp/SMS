const Pagination = () => {
  return (
    <div className="p-4 flex items-center justify-between text-gray-500 dark:text-dark-textSecondary dark:min-h-screen">
      <button
        disabled
        className="py-2 px-4 rounded-md bg-slate-200 dark:bg-dark-border text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Prev
      </button>
      <div className="flex items-center gap-2 text-sm">
        <button className="px-2 rounded-sm bg-lamaSky dark:bg-blue-700 dark:text-white">1</button>
        <button className="px-2 rounded-sm ">2</button>
        <button className="px-2 rounded-sm ">3</button>
        ...
        <button className="px-2 rounded-sm ">10</button>
      </div>
      <button className="py-2 px-4 rounded-md bg-slate-200 dark:bg-dark-border text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
        Next
      </button>
    </div>
  );
};

export default Pagination;