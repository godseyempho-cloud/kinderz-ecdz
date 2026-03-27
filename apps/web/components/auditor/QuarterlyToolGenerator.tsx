"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface GeneratorProps {
    centerId: string;
    year: number;
    quarter: number;
    monthlyReportIds: string[];
}

export default function QuarterlyToolGenerator({ centerId, year, quarter, monthlyReportIds }: GeneratorProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/auditor/quarterly/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ centerId, year, quarter, monthlyReportIds }),
            });

            if (response.ok) {
                alert("Quarterly Monitoring Tool Generated & Submitted!");
                router.push("/dashboard");
            } else {
                const err = await response.json();
                alert(`Error: ${err.error}`);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-green-50 border border-green-200 p-6 rounded-xl">
            <h3 className="text-green-900 font-bold mb-2">Quarterly Submission Ready</h3>
            <p className="text-green-700 text-sm mb-4">
                All monthly reports for Q{quarter} are approved. You can now generate the official Quarterly Monitoring Tool.
            </p>
            <button 
                onClick={handleGenerate}
                disabled={loading}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50"
            >
                {loading ? "Generating..." : "Generate Quarterly Tool"}
            </button>
        </div>
    );
}