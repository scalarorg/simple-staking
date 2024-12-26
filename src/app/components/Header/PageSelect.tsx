import { useRouter } from "next/navigation";

export const PageSelect: React.FC = () => {
  const router = useRouter();

  return (
    <div className="flex rounded-lg">
      <button
        className="px-4 py-2 first:rounded-l-lg last:rounded-r-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 font-semibold text-sm"
        onClick={() => router.push("/")}
      >
        Home
      </button>
      <button
        className="px-4 py-2 first:rounded-l-lg last:rounded-r-lg hover:bg-orange-700 border-l focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 font-semibold text-sm"
        onClick={() => router.push("/protocols")}
      >
        Protocols
      </button>
      <button
        className="px-4 py-2 first:rounded-l-lg last:rounded-r-lg hover:bg-orange-700 border-l focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 font-semibold text-sm"
        onClick={() => router.push("/custodian-groups")}
      >
        Custodian Groups
      </button>
    </div>
  );
};
