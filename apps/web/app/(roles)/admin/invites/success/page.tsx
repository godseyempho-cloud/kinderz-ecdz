"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function InviteSuccessPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  // Logic to handle GitHub Codespaces proxy URLs correctly
  const inviteLink = typeof window !== "undefined" 
    ? `${window.location.protocol}//${window.location.host.replace(':3000', '')}/register/${token}` 
    : "";

  return (
    <div className="p-8 max-w-2xl mx-auto text-center">
      <div className="bg-green-50 border border-green-200 p-8 rounded-2xl shadow-sm">
        <div className="flex justify-center mb-4">
          <div className="bg-green-100 p-3 rounded-full">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-green-800 mb-2">Invite Generated!</h1>
        <p className="text-green-700 mb-6">
          An invitation for <span className="font-semibold">{email}</span> is ready for testing.
        </p>

        <div className="bg-white p-4 rounded-lg border border-green-100 shadow-inner mb-6 text-left">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">
            Testing Registration Link
          </p>
          <code className="text-xs break-all text-blue-600 block bg-gray-50 p-2 rounded">
            {inviteLink}
          </code>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              navigator.clipboard.writeText(inviteLink);
              alert("Link copied to clipboard!");
            }}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-medium"
          >
            Copy Invitation Link
          </button>
          
          <Link 
            href={inviteLink} 
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Click here to open registration form directly
          </Link>

          <hr className="my-2 border-green-100" />

          <Link href="/admin" className="text-gray-500 hover:underline text-xs">
            Return to Admin Dashboard
          </Link>
        </div>
      </div>
    </div> 
  );
} 