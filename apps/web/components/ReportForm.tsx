"use client";
import { useState } from "react";
import DocumentUpload from "@/components/DocumentUpload";

interface ReportFormProps {
  centerId: string;
}

export default function ReportForm({ centerId }: ReportFormProps) {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(1);
  const [allocation, setAllocation] = useState("");
  const [allocations, setAllocations] = useState<{ category: string; amount: string; date: string }[]>(
    [{ category: "FOOD", amount: "", date: new Date().toISOString().slice(0, 10) }]
  );
  const [attendanceCount, setAttendanceCount] = useState("");
  const [childrenFunded, setChildrenFunded] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const res = await fetch("/api/monthly-reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        year,
        month,
        ecdCenterId: centerId, // Supervisor's own center
        allocation,
        allocations,
        attendanceCount: attendanceCount ? parseInt(attendanceCount) : undefined,
        childrenFunded: childrenFunded ? parseInt(childrenFunded) : undefined,
        notes,
      }),
    });

    if (!res.ok) {
      const body = await res.json();
      setError(body.error || "Unexpected error");
      return;
    }
    const data = await res.json();
    setSuccess(`Created report ${data.id}`);
    setCreatedId(data.id);
  }
 
  function updateAllocation(index: number, field: string, value: string) {
    const copy = [...allocations];
    (copy[index] as any)[field] = value;
    setAllocations(copy);
  }

  function addRow() {
    setAllocations([...allocations, { category: "FOOD", amount: "", date: new Date().toISOString().slice(0, 10) }]);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      {error && <p className="text-red-600">{error}</p>}
      {success && <p className="text-green-600">{success}</p>}

      <div>
        <label className="block">Year</label>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          className="border p-1 w-full"
        />
      </div>

      <div>
        <label className="block">Month</label>
        <input
          type="number"
          min={1}
          max={12}
          value={month}
          onChange={(e) => setMonth(parseInt(e.target.value))}
          className="border p-1 w-full"
        />
      </div>

      <div>
        <label className="block">Allocation Received</label>
        <input
          type="text"
          value={allocation}
          onChange={(e) => setAllocation(e.target.value)}
          className="border p-1 w-full"
        />
      </div>

      <fieldset className="border p-2">
        <legend>Line Items</legend>
        {allocations.map((row, i) => (
          <div key={i} className="grid grid-cols-3 gap-2 mb-2">
            <input
              placeholder="Category"
              value={row.category}
              onChange={(e) => updateAllocation(i, "category", e.target.value)}
              className="border p-1"
            />
            <input
              placeholder="Amount"
              value={row.amount}
              onChange={(e) => updateAllocation(i, "amount", e.target.value)}
              className="border p-1"
            />
            <input
              type="date"
              value={row.date}
              onChange={(e) => updateAllocation(i, "date", e.target.value)}
              className="border p-1"
            />
          </div>
        ))}
        <button type="button" className="text-blue-600" onClick={addRow}>
          + add row
        </button>
      </fieldset>

      <div>
        <label className="block">Attendance Count</label>
        <input
          type="number"
          value={attendanceCount}
          onChange={(e) => setAttendanceCount(e.target.value)}
          className="border p-1 w-full"
        />
      </div>

      <div>
        <label className="block">Children Funded</label>
        <input
          type="number"
          value={childrenFunded}
          onChange={(e) => setChildrenFunded(e.target.value)}
          className="border p-1 w-full"
        />
      </div>

      <div>
        <label className="block">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="border p-1 w-full"
        />
      </div>

      <DocumentUpload centerId={centerId} />

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Save Draft
      </button>
      <button
        type="button"
        onClick={async (e) => {
          e.preventDefault();
          if (!createdId) {
            alert("You must save a draft before submitting.");
            return;
          }
          if (!confirm("Submit report? This will lock further edits.")) return;
          const res = await fetch(`/api/monthly-reports/${createdId}/submit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });
          if (res.ok) {
            setSuccess("Report submitted");
          } else {
            const body = await res.json();
            setError(body.error || "Submit failed");
          }
        }}
        className="ml-4 bg-green-600 text-white px-4 py-2 rounded"
      >
        Submit
      </button>
    </form>
  );
}
