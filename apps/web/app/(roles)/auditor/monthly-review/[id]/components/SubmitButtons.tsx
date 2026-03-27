"use client";
import { useFormStatus } from "react-dom";

export function SubmitButtons() {
  const { pending } = useFormStatus();

  return (
    <div className="grid gap-3">
      <button 
        type="submit" 
        name="status" 
        value="APPROVED" 
        disabled={pending}
        className="w-full py-3 bg-emerald-600 text-white rounded-lg font-bold disabled:opacity-50"
      >
        {pending ? "Processing..." : "Approve"}
      </button>
      <button 
        type="submit" 
        name="status" 
        value="REVISION_REQUIRED" 
        disabled={pending}
        className="w-full py-3 border border-amber-300 text-amber-700 rounded-lg font-bold disabled:opacity-50"
      >
        {pending ? "Processing..." : "Require Revision"}
      </button>
    </div>
  );
}