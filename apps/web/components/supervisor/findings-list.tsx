"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle, MessageSquare, Send } from "lucide-react";

interface Finding {
  id: string;
  content: string;
  severity: string;
  status: string;
  comments: string[];
  report: {
    month: number | string; // Accept both to satisfy the compiler;
    year: number;
  };
}

export function FindingsList({ initialFindings }: { initialFindings: Finding[] }) {
  const [findings, setFindings] = useState(initialFindings);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleResolve = async (id: string) => {
    if (!comment.trim()) return alert("Please explain how you fixed this.");
    
    setLoading(true);
    try {
      const res = await fetch(`/api/supervisor/findings/${id}/resolve`, {
        method: "PATCH",
        body: JSON.stringify({ comment }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Failed to resolve");

      // Remove from the local list since it's no longer "Action Required"
      setFindings(findings.filter((f) => f.id !== id));
      setResolvingId(null);
      setComment("");
      router.refresh();
    } catch (err) {
      alert("Error resolving finding. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (findings.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
        <CheckCircle className="mx-auto h-12 w-12 text-green-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">All Clear!</h3>
        <p className="text-gray-500">No outstanding audit findings for your center.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {findings.map((finding) => (
        <div key={finding.id} className="bg-white border rounded-xl shadow-sm overflow-hidden">
          <div className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  finding.severity === 'HIGH' || finding.severity === 'CRITICAL' 
                  ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                }`}>
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">
                    {finding.report.month} {finding.report.year} Report Issue
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">{finding.content}</p>
                </div>
              </div>
              <span className="text-xs font-bold uppercase px-2 py-1 rounded bg-gray-100 text-gray-500">
                {finding.severity}
              </span>
            </div>

            {/* Comment History (If any) */}
            {finding.comments.length > 0 && (
              <div className="mt-4 bg-gray-50 p-3 rounded-lg space-y-2">
                {finding.comments.map((c, i) => (
                  <p key={i} className="text-xs text-gray-500 italic flex gap-2">
                    <MessageSquare size={14} /> {c}
                  </p>
                ))}
              </div>
            )}

            {/* Action Area */}
            <div className="mt-6 flex justify-end">
              {resolvingId === finding.id ? (
                <div className="w-full space-y-3">
                  <textarea
                    className="w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Describe the correction (e.g., 'Corrected the math in the attendance section' or 'Uploaded missing slip')..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                  />
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => setResolvingId(null)}
                      className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => handleResolve(finding.id)}
                      disabled={loading}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? "Saving..." : <><Send size={16} /> Mark as Resolved</>}
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setResolvingId(finding.id)}
                  className="text-sm font-bold text-blue-600 hover:text-blue-800 underline underline-offset-4"
                >
                  Respond to Finding
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}