"use client";
import React, { useEffect, useState } from "react";

export default function DocumentUpload({ centerId }: { centerId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState("");
  const [filename, setFilename] = useState("");
  const [category, setCategory] = useState("OTHER");
  const [comment, setComment] = useState("");
  const [presignAvailable, setPresignAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // probe presign availability
    fetch("/api/uploads/presign", { method: "POST" })
      .then((r) => {
        if (!r.ok) throw new Error("no presign");
        return r.json();
      })
      .then(() => setPresignAvailable(true))
      .catch(() => setPresignAvailable(false));
  }, []);

  async function handleUpload() {
    setMessage(null);
    if (!filename && !file) {
      setMessage("Please select a file or provide a filename and URL.");
      return;
    }
    if (!fileUrl) {
      setMessage("Please provide a public file URL (or configure S3 presign).\n(For now enter an uploaded file URL)");
      return;
    }

    setLoading(true);
    try {
      const body = {
        filename: filename || (file ? file.name : "unnamed"),
        url: fileUrl,
        category,
        ecdCenterId: centerId,
        comment,
      };

      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }
      setMessage("Document recorded successfully");
      setFile(null);
      setFileUrl("");
      setFilename("");
      setComment("");
    } catch (err: any) {
      setMessage(String(err.message || err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border p-4 rounded">
      <h3 className="font-semibold mb-2">Upload Supporting Document</h3>
      <div className="mb-2">
        <label className="block">File (select file to auto-fill name)</label>
        <input
          type="file"
          onChange={(e) => {
            const f = e.target.files ? e.target.files[0] : null;
            setFile(f);
            if (f) {
              setFilename(f.name);
            }
          }}
        />
      </div>

      <div className="mb-2">
        <label className="block">Filename</label>
        <input value={filename} onChange={(e) => setFilename(e.target.value)} className="border p-1 w-full" />
      </div>

      <div className="mb-2">
        <label className="block">File URL</label>
        <input
          value={fileUrl}
          onChange={(e) => setFileUrl(e.target.value)}
          placeholder={presignAvailable ? "Upload will use presigned URL (not configured)" : "Enter public file URL"}
          className="border p-1 w-full"
        />
      </div>

      <div className="mb-2">
        <label className="block">Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="border p-1 w-full">
          <option value="FOOD">FOOD</option>
          <option value="SALARIES">SALARIES</option>
          <option value="OVERHEADS">OVERHEADS</option>
          <option value="BANK_STATEMENT">BANK_STATEMENT</option>
          <option value="FINANCIAL_REPORT">FINANCIAL_REPORT</option>
          <option value="AFFIDAVIT">AFFIDAVIT</option>
          <option value="OTHER">OTHER</option>
        </select>
      </div>

      <div className="mb-2">
        <label className="block">Comment (optional, max 1000 chars)</label>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="border p-1 w-full" />
      </div>

      <div className="flex gap-2">
        <button onClick={handleUpload} disabled={loading} className="bg-blue-600 text-white px-3 py-1 rounded">
          {loading ? "Uploading..." : "Record Document"}
        </button>
        <button onClick={() => { setFile(null); setFileUrl(""); setFilename(""); setComment(""); }} className="px-3 py-1 border rounded">
          Reset
        </button>
      </div>

      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  );
}
