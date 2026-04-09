import { User } from "@prisma/client";
import { User as UserIcon, Mail, Shield, Calendar, MapPin } from "lucide-react";

export default function UserProfileCard({ user }: { user: any }) {
  return (
    <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-slate-200">
      <div className="bg-slate-50 p-6 border-b border-slate-100 flex items-center gap-4">
        <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
          <UserIcon size={32} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">{user.name || "User"}</h2>
          <p className="text-sm text-slate-500">{user.email}</p>
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between py-2 border-b border-slate-50">
          <span className="text-slate-500 text-sm flex items-center gap-2">
            <Shield size={16} /> Role
          </span>
          <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-black uppercase">
            {user.role}
          </span>
        </div>

        {user.ecdCenterId && (
          <div className="flex items-center justify-between py-2 border-b border-slate-50">
            <span className="text-slate-500 text-sm flex items-center gap-2">
              <MapPin size={16} /> Center ID
            </span>
            <span className="text-slate-900 font-mono text-sm">{user.ecdCenterId}</span>
          </div>
        )}

        <div className="flex items-center justify-between py-2">
          <span className="text-slate-500 text-sm flex items-center gap-2">
            <Calendar size={16} /> Joined
          </span>
          <span className="text-slate-900 text-sm">
            {new Date(user.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
          </span>
        </div>
      </div>
    </div>
  );
}