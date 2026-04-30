"use client";

import { useState } from "react";
import { DocumentList } from "./DocumentList";
import { X } from "lucide-react";

interface Props {
  children: React.ReactNode; // This will be your FinancialCalculator & Notes
  documents: any[];
}

export function AuditViewWrapper({ children, documents }: Props) {
  const [activeUrl, setActiveUrl] = useState<string | null>(null);

  return (
    <div className="flex flex-col lg:flex-row gap-6 transition-all duration-500">
      {/* LEFT COLUMN: Data & Evidence List */}
      <div className={`${activeUrl ? "lg:w-1/3" : "lg:w-2/3"} space-y-8 transition-all`}>
        <section className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Evidence Documents</h3>
          <DocumentList 
            documents={documents} 
            onPreview={(url) => setActiveUrl(url)} 
          />
        </section>
        
        {/* If no document is open, the main content (stats) takes more space */}
        {!activeUrl && <div className="animate-in fade-in slide-in-from-bottom-4">{children}</div>}
      </div>

      {/* RIGHT COLUMN: The Viewer OR the Data */}
      {activeUrl ? (
        <div className="lg:w-2/3 h-[80vh] sticky top-8 bg-slate-800 rounded-2xl overflow-hidden border-4 border-slate-200 shadow-2xl animate-in zoom-in-95">
          <div className="bg-slate-900 p-2 flex justify-between items-center text-white">
            <span className="text-xs font-bold px-3">Document Preview</span>
            <button 
              onClick={() => setActiveUrl(null)}
              className="p-1 hover:bg-red-500 rounded transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <iframe 
            src={activeUrl} 
            className="w-full h-full" 
            title="Document Preview"
          />
        </div>
      ) : null}

      {/* When a document is open, we move the Calculator/Notes to a 3rd state or keep them visible */}
      {activeUrl && (
        <div className="lg:w-1/3 animate-in fade-in">
          {children}
        </div>
      )}
    </div>
  );
}