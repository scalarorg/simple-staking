import Link from "next/link";

export const ToastContent = ({
  txid,
  link,
}: {
  txid: string;
  link: string;
}) => {
  return (
    <div className="mt-2 w-[640px] rounded-md bg-slate-950">
      <p className="text-white">
        Txid:{" "}
        <Link className="text-blue-500 underline" href={link} target="_blank">
          {txid.slice(0, 8)}...{txid.slice(-8)} (click to view)
        </Link>
      </p>
    </div>
  );
};
