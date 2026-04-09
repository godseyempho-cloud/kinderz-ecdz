import { prisma } from "@kinderz/db";
import { getSession } from "@/lib/get-session";
import { redirect, notFound } from "next/navigation";
import { FileText, ShieldCheck, Download } from "lucide-react";

export default async function SupervisorDocumentPage({ params }: { params: { id: string } }) {
  const session = await getSession();

  if (!session || session.user.role !== "SUPERVISOR") {
    redirect("/login");
  }

  const document = await prisma.document.findUnique({
    where: { id: params.id },
    include: { 
      uploadedBy: true // Corrected from 'uploader'
    }
  });

  // Security: Ensure this Supervisor belongs to the center that owns the document
  if (!document || document.ecdCenterId !== session.user.ecdCenterId) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="text-blue-600" /> {document.filename}
        </h1>
        <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-500">
          ID: {params.id}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="text-sm font-bold text-slate-400 uppercase mb-4">Document Details</h2>
          <ul className="space-y-4">
            <li className="flex justify-between text-sm">
              <span className="text-slate-500">Category:</span>
              <span className="font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md">
                {document.category}
              </span>
            </li>
            <li className="flex justify-between text-sm">
              <span className="text-slate-500">Uploaded By:</span>
              <span className="font-semibold">{document.uploadedBy.name || document.uploadedBy.email}</span>
            </li>
            <li className="flex justify-between text-sm">
              <span className="text-slate-500">Date:</span>
              <span className="font-semibold">{document.createdAt.toLocaleDateString()}</span>
            </li>
          </ul>
        </div>

        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex flex-col items-center justify-center text-center">
          <ShieldCheck className="h-12 w-12 text-blue-600 mb-2" />
          <h3 className="font-bold text-blue-900">Verification Access</h3>
          <p className="text-sm text-blue-700">
            This {document.category.toLowerCase()} is currently being used for audit verification.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="font-bold mb-4">Preview</h3>
        <div className="aspect-[4/3] bg-slate-900 rounded-lg overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center text-slate-500">
          {/* Use standard HTML iframe or object to preview the PDF/Image from URL */}
          <iframe 
            src={document.url} 
            className="w-full h-full" 
            title="Document Preview"
          />
        </div>
        <div className="mt-4">
           <a 
             href={document.url} 
             target="_blank" 
             className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors"
           >
             <Download className="h-4 w-4" /> Download Original File
           </a>
        </div>
      </div>
    </div>
  );
}