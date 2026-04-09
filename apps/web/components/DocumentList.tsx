import { Document, User } from "@prisma/client";
import { FileText, Eye, Download, User as UserIcon, Calendar } from "lucide-react";
import Link from "next/link";

interface DocumentListProps {
  /** * Expects the Document model from Prisma, 
   * optionally joined with the User who uploaded it 
   */
  docs: (Document & { uploadedBy?: User | null })[];
  viewMode: "auditor" | "supervisor";
}

export default function DocumentList({ docs, viewMode }: DocumentListProps) {
  // Empty State
  if (docs.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
        <div className="bg-slate-100 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3">
          <FileText className="h-6 w-6 text-slate-400" />
        </div>
        <p className="text-slate-500 font-semibold">No documents found</p>
        <p className="text-slate-400 text-sm">Upload evidence to see it listed here.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {docs.map((doc) => (
        <div 
          key={doc.id} 
          className="group flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-blue-300 hover:shadow-md transition-all"
        >
          {/* File Info Section */}
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold text-slate-900 leading-tight">{doc.filename}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded text-slate-500">
                  {doc.category.replace('_', ' ')}
                </span>
                
                {doc.uploadedBy && (
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <UserIcon className="h-3 w-3" /> {doc.uploadedBy.name || 'Staff'}
                  </span>
                )}

                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {doc.createdAt.toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <Link
              href={viewMode === "auditor" 
                ? `/auditor/verify-document/${doc.id}` 
                : `/supervisor/my-documents/${doc.id}`}
              className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              title="View Details"
            >
              <Eye className="h-5 w-5" />
            </Link>
            
            <a
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
              title="Download File"
            >
              <Download className="h-5 w-5" />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}