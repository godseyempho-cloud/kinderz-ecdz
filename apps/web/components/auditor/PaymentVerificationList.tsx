export default function PaymentVerificationList({ documents }: { documents: any[] }) {
  return (
    <div className="bg-white p-4 shadow rounded">
      <h3 className="font-bold mb-3">Supporting Documents (PoP)</h3>
      <ul className="divide-y">
        {documents.map((doc) => (
          <li key={doc.id} className="py-2 flex justify-between items-center">
            <span>{doc.name}</span>
            <a href={doc.url} target="_blank" className="text-blue-600 underline text-sm">View File</a>
          </li>
        ))}
        {documents.length === 0 && <p className="text-gray-400">No documents uploaded.</p>}
      </ul>
    </div>
  );
}