// /apps/web/app/(roles)/auditor/monthly-review/[monthId]/components/DocumentList.tsx
"use client";

import { Document } from "@prisma/client";
import { FileText, Eye, Paperclip, Loader2 } from "lucide-react";
import { useState } from "react";

interface DocumentListProps {
  documents: Document[];
  onPreview?: (url: string) => void; // Added for side-by-side view
}

export function DocumentList({ documents, onPreview }: DocumentListProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleFetchAndPreview = async (docId: string) => {
    setLoadingId(docId);
    try {
      const res = await fetch(`/api/documents/download?id=${docId}`);
      const data = await res.json();
      
      if (data.url) {
        if (onPreview) {
          onPreview(data.url); // Show in the side panel
        } else {
          window.open(data.url, "_blank"); // Fallback to new tab
        }
      }
    } catch (err) {
      alert("Security Error: Could not generate a safe view link.");
    } finally {
      setLoadingId(null);
    }
  };

  if (documents.length === 0) {
    return (
      <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl text-center bg-white">
        <Paperclip className="mx-auto h-8 w-8 text-slate-300 mb-2" />
        <p className="text-slate-500 text-sm">No evidence uploaded.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <div key={doc.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-400 transition-all">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-md">
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
            <div className="max-w-[150px]">
              <p className="text-xs font-bold text-slate-800 truncate">{doc.filename}</p>
              <p className="text-[9px] text-slate-400 uppercase font-black">{doc.category.replace("_", " ")}</p>
            </div>
          </div>
          
          <button 
            type="button"
            onClick={() => handleFetchAndPreview(doc.id)}
            disabled={loadingId === doc.id}
            className="p-2 bg-slate-50 hover:bg-blue-600 hover:text-white rounded-md text-slate-400 transition-colors"
          >
            {loadingId === doc.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      ))}
    </div>
  );
}