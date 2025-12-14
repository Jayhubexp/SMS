import Announcements from "@/components/Announcements";
import UserCard from "@/components/UserCard";
import Image from "next/image";
import Link from "next/link";

const SystemAdministratorPage = () => {
  return (
    <div className="p-4 flex gap-4 flex-col md:flex-row">
      {/* LEFT */}
      <div className="w-full lg:w-2/3 flex flex-col gap-8">
        <h1 className="text-2xl font-semibold dark:text-dark-text">System Administrator Dashboard</h1>
        {/* USER CARDS */}
        <div className="flex gap-4 justify-between flex-wrap">
          <UserCard type="student" />
          <UserCard type="teacher" />
          <UserCard type="parent" />
          <UserCard type="staff" />
        </div>

        {/* QUICK ACTIONS */}
        <div className="bg-white p-4 rounded-md dark:bg-dark-bgSecondary">
          <h2 className="text-xl font-semibold mb-4 dark:text-dark-text">System Management</h2>
          <div className="flex gap-4 flex-wrap">
            <Link href="/list/teachers">
              <button className="flex items-center gap-2 p-3 rounded-md bg-lamaSkyLight dark:bg-blue-800 dark:text-dark-text">
                <Image src="/teacher.png" alt="Manage Staff" width={20} height={20} />
                Manage Staff
              </button>
            </Link>
            <Link href="/list/students">
              <button className="flex items-center gap-2 p-3 rounded-md bg-lamaSkyLight dark:bg-blue-800 dark:text-dark-text">
                <Image src="/student.png" alt="Manage Students" width={20} height={20} />
                Manage Students
              </button>
            </Link>
             <Link href="/list/parents">
              <button className="flex items-center gap-2 p-3 rounded-md bg-lamaPurpleLight dark:bg-purple-800 dark:text-dark-text">
                <Image src="/parent.png" alt="Manage Parents" width={20} height={20} />
                Manage Parents
              </button>
            </Link>
            <Link href="/settings">
              <button className="flex items-center gap-2 p-3 rounded-md bg-lamaYellowLight dark:bg-yellow-800 dark:text-dark-text">
                <Image src="/setting.png" alt="System Settings" width={20} height={20} />
                System Settings
              </button>
            </Link>
          </div>
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full lg:w-1/3 flex flex-col gap-8">
        <Announcements />
      </div>
    </div>
  );
};

export default SystemAdministratorPage;