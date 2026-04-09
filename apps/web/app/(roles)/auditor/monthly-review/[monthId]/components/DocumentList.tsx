import { Document } from "@prisma/client";
import { FileText, ExternalLink, Paperclip } from "lucide-react";

interface DocumentListProps {
  documents: Document[];
}

export function DocumentList({ documents }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="p-10 border-2 border-dashed border-slate-200 rounded-2xl text-center">
        <Paperclip className="mx-auto h-10 w-10 text-slate-300 mb-2" />
        <p className="text-slate-500 font-medium">No documents uploaded for this report.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
        Attached Evidence ({documents.length})
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {documents.map((doc) => (
          <div 
            key={doc.id} 
            className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-blue-300 transition-colors group"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="bg-blue-50 p-2 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-800 truncate">
                  {doc.filename}
                </p>
                <p className="text-[10px] text-slate-400 uppercase font-black">
                  {doc.category.replace("_", " ")}
                </p>
              </div>
            </div>
            
            <a 
              href={doc.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-blue-600 transition-all"
              title="View Document"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}