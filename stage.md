


{
  "name": "Kinderz ECD Dev",
  "image": "mcr.microsoft.com/devcontainers/javascript-node:18-bullseye",

  "features": {
    "ghcr.io/devcontainers/features/git:1": {}
  },

  "onCreateCommand": "sudo apt-get update && sudo apt-get install -y openssl libvips-dev build-essential && npm install -g typescript@5.4.5",

  "customizations": {
    "vscode": {
      "extensions": [
        "prisma.prisma",
        "esbenp.prettier-vscode",
        "dbaeumer.vscode-eslint"
      ],
      "settings": {
        "typescript.tsdk": "node_modules/typescript/lib",
        "editor.formatOnSave": true
      }
    }
  },

  "forwardPorts": [3000, 8081],
  "remoteUser": "node",
  "postCreateCommand": "npm install"
}



import { auth } from "@/lib/betterAuth";
import { headers } from "next/headers";

export default async function DashboardPage() {
    // We fetch the session just to get user details
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    // We can safely assume session exists because the Layout handled the guard!
    const user = session!.user; 

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">ECD Dashboard</h1>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <p className="text-gray-600">Welcome back,</p>
                <h2 className="text-xl font-semibold text-blue-600">{user.name}</h2>
                
                <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded">
                        <span className="block text-xs text-gray-400 uppercase">Role</span>
                        <span className="font-mono font-bold">{user.role}</span>
                    </div>
                    <div className="p-4 bg-gray-50 rounded">
                        <span className="block text-xs text-gray-400 uppercase">Status</span>
                        <span className="text-green-600 font-bold">Authenticated</span>
                    </div>
                </div>
            </div>
        </div>
    );
}






import { auth } from "@/lib/betterAuth";
import { headers } from "next/headers";
import React from "react";

interface PageProps {
  params: { id: string };
}

// Individual document view.  This page would show metadata and a link to the
// stored file (S3 or other).  For now we display the id only.
export default async function DocumentPage({ params }: PageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return <p className="p-8">Access denied</p>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Document {params.id}</h1>
      <p>Details would be fetched from the backend.</p>
    </div>
  );
}




import React from "react";
import { auth } from "@/lib/betterAuth";
import { headers } from "next/headers";
import DocumentList from "@/components/DocumentList";

// Documents page lists all uploaded documents that the current user may view.
// The list can be filtered by center or by report. For now we render a placeholder
// list; later this will fetch from an API (e.g. GET /api/documents?centerId=...)

export default async function DocumentsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return <p className="p-8">Access denied</p>;
  }

  // fetch documents here later
  const dummy = [
    { id: "doc1", filename: "bankstatement.pdf", url: "/docs/bankstatement.pdf", category: "BANK_STATEMENT" },
    { id: "doc2", filename: "receipt.jpg", url: "/docs/receipt.jpg", category: "OTHER" },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Uploaded Documents</h1>
      <DocumentList docs={dummy} />
    </div>
  );
}



import { auth } from "@/lib/betterAuth";
import { headers } from "next/headers";

export default async function ProfilePage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const user = session!.user;

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
            
            <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
                <div className="p-6 space-y-4">
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-500 font-medium">Full Name</span>
                        <span className="text-gray-900">{user.name}</span>
                    </div>
                    
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-500 font-medium">Email Address</span>
                        <span className="text-gray-900">{user.email}</span>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-500 font-medium">Account Role</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-bold">
                            {user.role}
                        </span>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-500 font-medium">Member Since</span>
                        <span className="text-gray-900">
                            {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </div>
            
            <p className="mt-4 text-sm text-gray-400 text-center">
                User ID: {user.id}
            </p>
        </div>
    );
}



import { getSession } from "@/lib/get-session";

export default async function ProvincialDashboardPage() {
  const session = await getSession();
  if (!session || session.user.role !== "PROVINCIAL") {
    return <p className="p-8">Access denied</p>;
  }

  // Would fetch data such as counts of submitted reports, status by district, etc.

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Provincial Dashboard</h1>
      <p>Overview stats and links will be displayed here.</p>
    </div>
  );
}

import { getSession } from "@/lib/get-session";
import ReconciliationTable, { ReconciliationRow } from "@/components/ReconciliationTable";

// Auditor review page displays a submitted report and allows the auditor to
// compare their own figures, enter comments, and mark as reviewed. For now,
// the page shows the reconciliation table component with static data.

interface PageProps {
  params: { id: string };
}

export default async function AuditorReportPage({ params }: PageProps) {
  const session = await getSession();
  if (!session || session.user.role !== "AUDITOR") {
    return <p className="p-8">Access denied</p>;
  }

  const { id } = params;

  // placeholder static reconciliation data
  const rows: ReconciliationRow[] = [
    { label: "Allocation received", supervisorValue: 1000 },
    { label: "Attendance count", supervisorValue: 45 },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auditor Review of Report {id}</h1>
      <ReconciliationTable rows={rows} />
      <p className="mt-4">Audit comments and mark-as-reviewed form will go here.</p>
    </div>
  );
}



import { getSession } from "@/lib/get-session";
import ReportList from "@/components/ReportList";

// Auditors' view lists the reports they need to audit for their province.
// Status shows SUBMITTED (awaiting audit) or REVIEWED (audited).

export default async function AuditorReportsPage() {
  const session = await getSession();
  if (!session || session.user.role !== "AUDITOR") {
    return <p className="p-8">Access denied</p>;
  }

  // In a real implementation we'd fetch reports from an API endpoint here.
  // For now render placeholder list of IDs.
  const dummy: { id: string; year: number; month: number; status: string }[] = [
    { id: "abc", year: 2026, month: 1, status: "SUBMITTED" },
    { id: "def", year: 2026, month: 2, status: "REVIEWED" },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auditor - Reports to Review</h1>
      <ReportList reports={dummy} />
    </div>
  );
}



import { getSession } from "@/lib/get-session";
import ReportForm from "@/components/ReportForm";

// The supervisor submission page is only accessible to authenticated supervisors/ECD users.
// It renders a simple form that posts to /api/monthly-reports via fetch.

export default async function CreateReportPage() {
  const session = await getSession();
  if (!session || (session.user.role !== "SUPERVISOR" && session.user.role !== "ECD_USER")) {
    // In a real app we might redirect but server component cannot redirect inside async
    return <p className="p-8">Access denied</p>;
  } 

  const centerId = session.user.ecdCenterId;
   
  if (!centerId) {
    return <p className="p-8">Error: No ECD center assigned to this account</p>;
  }   

  return (
    <div className="p-8"> 
      <h1 className="text-2xl font-bold mb-4">Submit Monthly Report</h1>
      <ReportForm centerId={centerId} />
    </div>
  );
}


import React from "react";
import RegisterForm from "@/components/RegisterForm";

// Server component page that wraps the client-side registration form.  This
// allows the page to perform server-side guards or fetch data if needed.
export default function RegisterUserPage() {
  return (
    <div className="p-8 max-w-lg">
      <h1 className="text-2xl font-bold mb-4">Register User</h1>
      <RegisterForm />
    </div>
  );
}


import { auth } from "@/lib/betterAuth";
import { headers } from "next/headers";
import React from "react";

// User management landing page. Admins can view and navigate to registration or
// edit existing accounts. Actual list retrieval will be implemented later.
export default async function UsersPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "ADMIN") {
    return <p className="p-8">Access denied</p>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">User Administration</h1>
      <p>List of users will appear here.</p>
      <p>
        <a className="text-blue-600" href="/users/register">
          Register new user
        </a>
      </p>
    </div>
  );
}


import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getSession } from "@/lib/get-session";


export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Layer 2 Security: Enriched session check
  // getSession():
  //   - Returns null if user is banned/frozen/inactive
  //   - Returns enriched session with role, ecdCenterId, districtId
  //   - Queries DB to ensure user status is current
  const session = await getSession();

  // Redirect unauthenticated OR blocked users (banned, frozen, inactive) back to login
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation for all protected pages could go here */}
      <nav className="border-b bg-white p-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <span className="font-bold text-blue-800">Kinderz-ECD System</span>
          <div className="flex items-center gap-4">
            {/* Display user info + role for context */}
            <div className="text-sm text-gray-600">
              <div className="font-semibold">{session.user.email}</div>
              <div className="text-xs text-gray-500">
                Role: <span className="font-mono">{session.user.role}</span>
              </div>
              {/* Show jurisdiction hint for Auditor/Supervisor/ECD_USER */}
              {session.user.ecdCenterId && (
                <div className="text-xs text-gray-500">
                  Center ID: <span className="font-mono">{session.user.ecdCenterId}</span>
                </div>
              )}
            </div>
            <SignOutButton /> 
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4">
        {children}
      </main>
    </div>
  );
}



import { prisma } from "@kinderz/db";
import { requireSession, requireRole, ApiError, errorResponse } from "@/lib/api-guards";

// CRUD for provincial-level records. ADMIN uses this to create or reassign a
// provincial user, and optionally update the province metadata.

export async function GET(req: Request) {
  try {
    const session = await requireSession();
    requireRole(session, ["ADMIN"]);
    const provincials = await prisma.user.findMany({ where: { role: "PROVINCIAL" } });
    return new Response(JSON.stringify(provincials), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return errorResponse(err);
  }
} 

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    requireRole(session, ["ADMIN"]);
    const { email, provinceId } = await req.json();
    // in practice we'd create an invite instead; this endpoint is a shortcut.
    const user = await prisma.user.create({
      data: { email, role: "PROVINCIAL", provinceId },
    });
    return new Response(JSON.stringify(user), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return errorResponse(err);
  }
}


import { prisma } from "@kinderz/db";
import { requireSession, requireRole, ApiError, errorResponse } from "@/lib/api-guards";

// Admin users endpoint: list users, change roles/flags, ban/unban, freeze
// This is invoked by the ADMIN web UI under /admin/users.

export async function GET(req: Request) {
  try {
    const session = await requireSession();
    requireRole(session, ["ADMIN"]);
    const users = await prisma.user.findMany({});
    return new Response(JSON.stringify(users), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await requireSession();
    requireRole(session, ["ADMIN"]);
    const { id, role, isActive, banned } = await req.json();
    if (!id) throw new ApiError(400, "user id required");
    const user = await prisma.user.update({
      where: { id },
      data: { role, isActive, banned },
    });
    return new Response(JSON.stringify(user), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return errorResponse(err);
  }
}


import { prisma } from "@kinderz/db";
import {
  requireSession,
  requireRole,
  requireCenterAccess,
  errorResponse,
  ApiError,
} from "@/lib/api-guards";

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    requireRole(session, ["SUPERVISOR", "ECD_USER"]);

    const body = await req.json();
    const { childId, date, present, reportId } = body;
    if (!childId || date === undefined || present === undefined) {
      throw new ApiError(400, "Missing required fields");
    }

    // verify child belongs to same center
    const child = await prisma.child.findUnique({ where: { id: childId } });
    if (!child) throw new ApiError(404, "Child not found");
    requireCenterAccess(session, child.ecdCenterId);

    const data: any = {
      childId,
      date: new Date(date),
      present,
    };
    if (reportId) data.reportId = reportId;

    const attendance = await prisma.attendance.create({ data });

    return new Response(JSON.stringify(attendance), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return errorResponse(err);
  }
}


import { prisma } from "@kinderz/db";
import {
  requireSession,
  requireRole,
  requireProvinceAccess,
  ApiError,
  errorResponse,
} from "@/lib/api-guards";

// PROVINCIAL reviews an audit finding (approve/flag/corrections_required)
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireSession();
    requireRole(session, ["PROVINCIAL"]);

    const findingId = params.id;
    const body = await req.json();
    const { status } = body; // expected to be one of the FindingStatus enum values

    if (!status) {
      throw new ApiError(400, "Missing new status");
    }

    // load existing finding + its report's province via relation
    const existing = await prisma.auditFinding.findUnique({
      where: { id: findingId },
      include: { report: { include: { ecdCenter: { include: { district: true } } } } },
    });

    if (!existing) {
      throw new ApiError(404, "Audit finding not found");
    }

    // ensure the provincial user is assigned to same province
    const reportProvinceId = existing.report.ecdCenter.district.provinceId;
    requireProvinceAccess(session, reportProvinceId);

    const updated = await prisma.auditFinding.update({
      where: { id: findingId },
      data: {
        status,
        reviewedById: session.user.id,
      },
    });

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return errorResponse(error);
  }
}


import { prisma } from "@kinderz/db";
import {
  requireSession,
  requireRole,
  requireDistrictAccess,
  ApiError,
  errorResponse,
} from "@/lib/api-guards";

// AUDITOR creates a finding tied to a quarterly report
export async function POST(req: Request) {
  try {
    const session = await requireSession();
    requireRole(session, ["AUDITOR"]);

    const body = await req.json();
    const { reportId, comments, compliant } = body;

    if (!reportId || comments === undefined || compliant === undefined) {
      throw new ApiError(400, "Missing required fields");
    }

    // ensure report exists and belongs to the auditor's district
    const report = await prisma.quarterlyReport.findUnique({
      where: { id: reportId },
      include: { ecdCenter: { select: { districtId: true } } },
    });

    if (!report) {
      throw new ApiError(404, "Quarterly report not found");
    }

    if (report.ecdCenter.districtId !== session.user.districtId) {
      throw new ApiError(403, "Forbidden: Report outside your district.");
    }

    const finding = await prisma.auditFinding.create({
      data: {
        comments,
        compliant,
        reportId,
      },
    });

    return new Response(JSON.stringify(finding), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return errorResponse(error);
  }
}


// import { auth } from "@/lib/betterAuth";

// /**
//  * Handles all GET requests for authentication
//  */
// export async function GET(req: Request) {
//   return auth.handler(req);
// }

// /**
//  * Handles all POST requests for authentication
//  */
// export async function POST(req: Request) {
//   return auth.handler(req);
// }



import { auth } from "@/lib/betterAuth"; // Adjust this path to your auth config file
import { toNextJsHandler } from "better-auth/next-js";

console.log("AUTH ROUTE TRIGGERED"); // If this doesn't show in terminal, the proxy is broken

export const { GET, POST } = toNextJsHandler(auth);



import { prisma } from "@kinderz/db";
import {
  requireSession,
  requireRole,
  requireProvinceAccess,
  ApiError,
  errorResponse,
} from "@/lib/api-guards";

// PROVINCIAL updates center-level governance fields (funding status, BAS, expiry, etc.)
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireSession();
    requireRole(session, ["PROVINCIAL"]);

    const body = await req.json();

    // load center with province context
    const center = await prisma.ecdCenter.findUnique({
      where: { id: params.id },
      include: { district: { select: { provinceId: true } } },
    });

    if (!center) {
      throw new ApiError(404, "ECD center not found");
    }

    if (center.district.provinceId !== session.user.provinceId) {
      throw new ApiError(403, "Forbidden: Center outside your province.");
    }

    // prepare update data; only allow the specific provincial fields
    const updateData: any = {};
    if (body.fundingStatus !== undefined) updateData.fundingStatus = body.fundingStatus;
    if (body.basNumber !== undefined) updateData.basNumber = body.basNumber;
    if (body.registrationExpiryDate !== undefined) updateData.registrationExpiryDate = new Date(body.registrationExpiryDate);
    if (body.registrationLevel !== undefined) updateData.registrationLevel = body.registrationLevel;
    // additional fields could be added later (comments, budget, etc.)

    const updated = await prisma.ecdCenter.update({
      where: { id: params.id },
      data: updateData,
    });

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return errorResponse(error);
  }
}




import { prisma } from "@kinderz/db";
import { requireSession, requireRole, ApiError, errorResponse } from "@/lib/api-guards";

// This route handles the invite system described in the design doc:
//  - ADMIN/PROVINCIAL/SUPERVISOR create invite records for users beneath them
//  - an invite contains email, role, optional province or center, expiration
//  - a mobile/web registration page will consume the token and "use" the invite
//  - once used or expired the token is invalidated

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    // only privileged users can generate invites; the UI will additionally
    // enforce that ADMIN invites PROVINCIAL/AUDITOR, PROVINCIAL invites
    // SUPERVISOR/ECD_USER, SUPERVISOR invites ECD_USER.
    requireRole(session, ["ADMIN", "PROVINCIAL", "SUPERVISOR"]);

    const { email, role, provinceId, districtId, ecdCenterId } = await req.json();

    // Validate payload and enforce hierarchical constraints
    if (!email || !role) throw new ApiError(400, "email and role are required");

    if (role === "PROVINCIAL") {
      if (!provinceId) throw new ApiError(400, "provinceId required for PROVINCIAL invites");
      // PROVINCIAL can only invite for their own province; ADMIN can invite for any
      if (session.user.role === "PROVINCIAL" && session.user.provinceId !== provinceId) {
        throw new ApiError(403, "Cannot invite PROVINCIAL outside your province");
      }
    } else if (role === "AUDITOR") {
      if (!districtId) throw new ApiError(400, "districtId required for AUDITOR invites");
      // Validate district exists and belongs to inviter's province (if PROVINCIAL)
      const district = await prisma.district.findUnique({
        where: { id: districtId },
        include: { province: true },
      });
      if (!district) throw new ApiError(404, "District not found");
      if (session.user.role === "PROVINCIAL" && district.provinceId !== session.user.provinceId) {
        throw new ApiError(403, "Cannot invite AUDITOR outside your province");
      }
    } else if (role === "SUPERVISOR" || role === "ECD_USER") {
      if (!ecdCenterId) throw new ApiError(400, "ecdCenterId required for SUPERVISOR/ECD_USER invites");
      // Validate center exists and belongs to inviter's province/district/center
      const center = await prisma.ecdCenter.findUnique({
        where: { id: ecdCenterId },
        include: { district: { include: { province: true } } },
      });
      if (!center) throw new ApiError(404, "ECD center not found");
      if (session.user.role === "PROVINCIAL" && center.district.provinceId !== session.user.provinceId) {
        throw new ApiError(403, "Cannot invite for center outside your province");
      }
      if (session.user.role === "SUPERVISOR" && center.id !== session.user.ecdCenterId) {
        throw new ApiError(403, "Can only invite for your own center");
      }
    } else {
      throw new ApiError(400, "Invalid role");
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // one week

    const invite = await prisma.invite.create({
      data: { email, role, provinceId, districtId, ecdCenterId, token, expiresAt },
    });

    return new Response(JSON.stringify(invite), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function GET(req: Request) {
  try {
    // retrieve invite by token query param; public endpoint used by the
    // registration page to validate
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    if (!token) throw new ApiError(400, "token is required");

    const invite = await prisma.invite.findUnique({ where: { token } });
    if (!invite || invite.used || invite.expiresAt < new Date()) {
      throw new ApiError(404, "Invite not found or expired");
    }

    return new Response(JSON.stringify(invite), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(req: Request) {
  try {
    // mark invite as used; called by registration handler after user creation
    const { token } = await req.json();
    if (!token) throw new ApiError(400, "token is required");

    const invite = await prisma.invite.update({
      where: { token },
      data: { used: true },
    });
    return new Response(JSON.stringify(invite), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return errorResponse(err);
  }
}


import { prisma } from "@kinderz/db";
import {
  requireSession,
  requireRole,
  requireCenterAccess,
  errorResponse,
  ApiError,
} from "@/lib/api-guards";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireSession();
    requireRole(session, ["SUPERVISOR", "ECD_USER"]);

    const body = await req.json();
    const { fullName, funded, dateOfBirth } = body;

    // load existing child to verify center
    const existing = await prisma.child.findUnique({ where: { id: params.id } });
    if (!existing) throw new ApiError(404, "Child not found");
    requireCenterAccess(session, existing.ecdCenterId);

    const updated = await prisma.child.update({
      where: { id: params.id },
      data: {
        fullName: fullName ?? existing.fullName,
        funded: funded ?? existing.funded,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : existing.dateOfBirth,
      },
    });

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireSession();
    requireRole(session, ["SUPERVISOR", "ECD_USER"]);

    const existing = await prisma.child.findUnique({ where: { id: params.id } });
    if (!existing) throw new ApiError(404, "Child not found");
    requireCenterAccess(session, existing.ecdCenterId);

    await prisma.child.delete({ where: { id: params.id } });
    return new Response(null, { status: 204 });
  } catch (err) {
    return errorResponse(err);
  }
}



import { prisma } from "@kinderz/db";
import {
  requireSession,
  requireRole,
  requireCenterAccess,
  errorResponse,
  ApiError,
} from "@/lib/api-guards";

// Manage child masterlist for a center (SUPERVISOR/ECD_USER)
export async function GET(req: Request) {
  try {
    const session = await requireSession();
    requireRole(session, ["SUPERVISOR", "ECD_USER"]);

    const url = new URL(req.url);
    const centerId = url.searchParams.get("centerId");
    if (!centerId) {
      throw new ApiError(400, "centerId query parameter required");
    }
    requireCenterAccess(session, centerId);

    const skip = parseInt(url.searchParams.get("skip") || "0");
    const take = parseInt(url.searchParams.get("take") || "50");

    const children = await prisma.child.findMany({
      where: { ecdCenterId: centerId },
      skip,
      take,
      orderBy: { fullName: "asc" },
    });

    return new Response(JSON.stringify(children), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    requireRole(session, ["SUPERVISOR", "ECD_USER"]);

    const body = await req.json();
    const { fullName, funded = false, dateOfBirth, ecdCenterId } = body;
    if (!fullName || !dateOfBirth || !ecdCenterId) {
      throw new ApiError(400, "Missing required fields");
    }
    requireCenterAccess(session, ecdCenterId);

    const created = await prisma.child.create({
      data: {
        fullName,
        funded,
        dateOfBirth: new Date(dateOfBirth),
        ecdCenterId,
      },
    });

    return new Response(JSON.stringify(created), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return errorResponse(err);
  }
}



import { prisma } from "@kinderz/db";
import {
  requireSession,
  requireRole,
  requireCenterAccess,
  errorResponse,
  ApiError,
} from "@/lib/api-guards";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireSession();
    requireRole(session, ["SUPERVISOR", "ECD_USER"]);

    const body = await req.json();
    const { fullName, role, salary } = body;

    const existing = await prisma.practitioner.findUnique({ where: { id: params.id } });
    if (!existing) throw new ApiError(404, "Practitioner not found");
    requireCenterAccess(session, existing.ecdCenterId);

    const updated = await prisma.practitioner.update({
      where: { id: params.id },
      data: {
        fullName: fullName ?? existing.fullName,
        role: role ?? existing.role,
        salary: salary ? salary.toString() : existing.salary,
      },
    });

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireSession();
    requireRole(session, ["SUPERVISOR", "ECD_USER"]);

    const existing = await prisma.practitioner.findUnique({ where: { id: params.id } });
    if (!existing) throw new ApiError(404, "Practitioner not found");
    requireCenterAccess(session, existing.ecdCenterId);

    await prisma.practitioner.delete({ where: { id: params.id } });
    return new Response(null, { status: 204 });
  } catch (err) {
    return errorResponse(err);
  }
}


import { prisma } from "@kinderz/db";
import {
  requireSession,
  requireRole,
  requireCenterAccess,
  errorResponse,
  ApiError,
} from "@/lib/api-guards";

// Manage practitioner masterlist for a center
export async function GET(req: Request) {
  try {
    const session = await requireSession();
    requireRole(session, ["SUPERVISOR", "ECD_USER"]);

    const url = new URL(req.url);
    const centerId = url.searchParams.get("centerId");
    if (!centerId) {
      throw new ApiError(400, "centerId query parameter required");
    }
    requireCenterAccess(session, centerId);

    const skip = parseInt(url.searchParams.get("skip") || "0");
    const take = parseInt(url.searchParams.get("take") || "50");

    const list = await prisma.practitioner.findMany({
      where: { ecdCenterId: centerId },
      skip,
      take,
      orderBy: { fullName: "asc" },
    });

    return new Response(JSON.stringify(list), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    requireRole(session, ["SUPERVISOR", "ECD_USER"]);

    const body = await req.json();
    const { fullName, role, salary, ecdCenterId } = body;
    if (!fullName || !role || !ecdCenterId) {
      throw new ApiError(400, "Missing required fields");
    }
    requireCenterAccess(session, ecdCenterId);

    const created = await prisma.practitioner.create({
      data: {
        fullName,
        role,
        salary: salary ? salary.toString() : undefined,
        ecdCenterId,
      },
    });

    return new Response(JSON.stringify(created), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return errorResponse(err);
  }
}


import { prisma } from "@kinderz/db";
import {
  requireSession,
  requireRole,
  requireDistrictAccess,
  preventSelfReview,
  errorResponse,
} from "@/lib/api-guards";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireSession();
    requireRole(session, ["AUDITOR"]);

    const reportId = params.id; 

    // load existing report with center/district so we can apply district guard
    const existing = await prisma.monthlyReport.findUnique({
      where: { id: reportId },
      include: { ecdCenter: { select: { districtId: true } } },
    });

    if (!existing) {
      throw new Error("Monthly report not found");
    }

    // enforce that auditor belongs to same district
    requireDistrictAccess(session, existing.ecdCenter.districtId);

    // conflict of interest check
    preventSelfReview(existing.submittedById, session.user.id);

    // parse incoming review fields
    const {
      salariesDepCalc,
      foodDepCalc,
      overheadsDepCalc,
      attendanceCount,
      childrenFunded,
    } = await req.json();

    const updated = await prisma.monthlyReport.update({
      where: { id: reportId },
      data: {
        salariesDepCalc,
        foodDepCalc,
        overheadsDepCalc,
        attendanceCount,
        childrenFunded,
        reviewedById: session.user.id,
        reviewedAt: new Date(),
      },
    });

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return errorResponse(error);
  }
}


import { prisma } from "@kinderz/db";
import {
  requireSession,
  requireRole,
  isReportLocked,
  errorResponse,
  ApiError,
} from "@/lib/api-guards";

/**
 * POST /api/monthly-reports/[id]/submit
 * 
 * Supervisor transitions a DRAFT report to SUBMITTED (locked).
 * Once SUBMITTED, the supervisor cannot edit; the auditor begins review.
 * This enforces data integrity: prevents supervisor from changing data after auditor has seen it.
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireSession();
    requireRole(session, ["SUPERVISOR", "ECD_USER"]);

    const reportId = params.id;

    // Load the report to check status and ownership
    const report = await prisma.monthlyReport.findUnique({
      where: { id: reportId },
      select: {
        id: true,
        status: true,
        submittedById: true,
        ecdCenterId: true,
      },
    });

    if (!report) {
      throw new ApiError(404, "Monthly report not found");
    }

    // Verify the supervisor owns this report (can only submit your own)
    if (report.submittedById !== session.user.id) {
      throw new ApiError(403, "You can only submit reports you created");
    }

    // Verify report is still in DRAFT status; cannot re-submit already submitted reports
    isReportLocked(report.status, ["DRAFT"]);

    // Transition to SUBMITTED and set submittedAt timestamp
    const updated = await prisma.monthlyReport.update({
      where: { id: reportId },
      data: {
        status: "SUBMITTED",
        submittedAt: new Date(),
      },
    });

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return errorResponse(error);
  }
}


import { prisma } from "@kinderz/db";
import type { DocumentCategory } from "@prisma/client";
import {
  requireSession,
  requireRole,
  requireCenterAccess,
  errorResponse,
  ApiError,
} from "@/lib/api-guards";

// Input types used for validation and clarity
// category is narrowed to the Prisma-generated enum
// Amount/date are also typed appropriately
// We'll still validate on receipt to protect against bad JSON.

type AllocationInput = {
  category: DocumentCategory;
  amount: number | string;
  date: string; // ISO date string
};

export async function POST(req: Request) {
  try {
    // 1. Authentication & authorization
    const session = await requireSession();
    requireRole(session, ["SUPERVISOR", "ECD_USER"]);

    // 2. Parse payload
    const body = await req.json();
    const {
      year,
      month,
      ecdCenterId,
      allocation,
      salariesExpense = 0,
      foodExpense = 0,
      overheadsExpense = 0,
      otherExpense = 0,
      // we don't trust the incoming JSON, so coerce into the correct type
      allocations: rawAllocations,
      attendanceCount,
      childrenFunded,
      notes,
      signatureUrl,
    } = body; 

    const allocations: AllocationInput[] = Array.isArray(rawAllocations)
      ? // perform basic runtime check on each element
        rawAllocations.map((a) => {
          // ensure category is one of the enum values, otherwise default to OTHER
          const cat = a.category as DocumentCategory;
          const allowed: DocumentCategory[] = [
            "FOOD",
            "SALARIES",
            "OVERHEADS",
            "BANK_STATEMENT",
            "FINANCIAL_REPORT",
            "AFFIDAVIT",
            "OTHER",
          ];
          return {
            category: allowed.includes(cat) ? cat : "OTHER",
            amount: a.amount,
            date: a.date,
          };
        })
      : [];

    // 3. Basic validation
    if (
      year === undefined ||
      month === undefined ||
      !ecdCenterId ||
      allocation === undefined
    ) {
      throw new ApiError(400, "Missing required fields");
    }
    if (month < 1 || month > 12) {
      throw new ApiError(400, "Month must be between 1 and 12");
    }

    // 4. Enforce center-level access
    // also load center to verify funding status
    const center = await prisma.ecdCenter.findUnique({ where: { id: ecdCenterId } });
    if (!center) {
      throw new ApiError(404, "ECD center not found");
    }
    if (center.fundingStatus === "DISCONTINUED") {
      throw new ApiError(403, "Center is closed");
    }
    requireCenterAccess(session, ecdCenterId);

    // OPTIONAL: prevent ECD_USERs from calling via desktop/web client by checking user-agent
    if (session.user.role === "ECD_USER") {
      const ua = req.headers.get("user-agent") || "";
      const isWeb = /Mozilla|Chrome|Safari/i.test(ua);
      if (isWeb) {
        throw new ApiError(403, "ECD users must use mobile app");
      }
    }

    // 5. Compute totals and perform server-side sanity checks
    // const totalExpenditure = allocations.reduce(
    //   (sum: number, a: AllocationInput) => sum + parseFloat(String(a.amount)),
    //   0
    // );

    // 5. Compute totals and perform server-side sanity checks
const totalExpenditure = allocations.reduce(
  (sum: number, a: AllocationInput) => sum + parseFloat(String(a.amount)),
  0
);

    // 6. Create report in DRAFT status, allowing supervisor to edit before final submission
    // status: "DRAFT" means the supervisor can still modify this report.
    // When they click "Submit", the status moves to "SUBMITTED" and locks further edits.
    const report = await prisma.monthlyReport.create({
      data: {
        year,
        month,
        ecdCenterId,
        submittedById: session.user.id,
        allocation: allocation.toString(),
        totalExpenditure: totalExpenditure.toString(),
        salariesExpense: salariesExpense?.toString(),
        foodExpense: foodExpense?.toString(),
        overheadsExpense: overheadsExpense?.toString(),
        otherExpense: otherExpense?.toString(),
        attendanceCount,
        childrenFunded,
        notes,
        signatureUrl,
        status: "DRAFT", // New reports start in DRAFT; supervisor can edit freely
        // submittedAt remains null until the supervisor explicitly submits (status -> SUBMITTED)
        allocations: {
          create: allocations.map((a: AllocationInput) => ({
            category: a.category,
            amount: a.amount.toString(),
            date: new Date(a.date),
          })),
        },
      },
    });

    return new Response(JSON.stringify(report), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return errorResponse(error);
  }
}


// /api/provincial/centers/route.ts
// Handles CRUD operations for ECD centers within the provincial's province.
// PROVINCIAL can create, update, or deactivate centers in their province.
// Guards: requireRole(PROVINCIAL), requireProvinceAccess.

import { prisma } from "@kinderz/db";
import { requireSession, requireRole, requireProvinceAccess, ApiError, errorResponse } from "@/lib/api-guards";

export async function GET(req: Request) {
  try {
    const session = await requireSession();
    requireRole(session, ["PROVINCIAL"]);
    const centers = await prisma.ecdCenter.findMany({
      where: { district: { provinceId: session.user.provinceId } },
      include: { district: true, supervisor: true },
    });
    return new Response(JSON.stringify(centers), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    requireRole(session, ["PROVINCIAL"]);
    const { name, districtId, basNumber, registrationExpiryDate, registrationLevel } = await req.json();
    // Validate district belongs to province
    const district = await prisma.district.findUnique({ where: { id: districtId } });
    if (!district || district.provinceId !== session.user.provinceId) throw new ApiError(403, "Invalid district");
    const center = await prisma.ecdCenter.create({
      data: { name, districtId, basNumber, registrationExpiryDate: registrationExpiryDate ? new Date(registrationExpiryDate) : null, registrationLevel },
    });
    return new Response(JSON.stringify(center), { status: 201, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return errorResponse(err);
  }
}





import { NextRequest } from "next/server";
import { errorResponse, ApiError, requireSession } from "@/lib/api-guards";

// Placeholder presign endpoint. Returns 501 if S3 is not configured.
export async function POST(req: Request) {
  try {
    // Keep protected: only authenticated users may request presigned URLs
    const session = await requireSession();

    // Check environment for S3 configuration
    const bucket = process.env.S3_BUCKET;
    const region = process.env.S3_REGION;

    if (!bucket || !region) {
      throw new ApiError(501, "S3 presign not configured. Provide S3_BUCKET and S3_REGION to enable presigned uploads.");
    }

    // If S3 is configured but server does not have AWS SDK integration, return 501 for now.
    // A full implementation would call the AWS SDK to create a presigned PUT URL.
    throw new ApiError(501, "S3 presign not implemented on this server. Install AWS SDK and implement presign logic.");
  } catch (err) {
    return errorResponse(err);
  }
}


import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}


import { prisma } from "@kinderz/db";

export default async function Page() {
  // Minimal test: count users table or any model
  let count = 0;
  try {
    count = await prisma.user.count();
    console.log("User count:", count);
  } catch (err) {
    console.error("Prisma DB connection error:", err);
  }

  return <div>Hello — Users in DB: {count}</div>;
}


"use client";
import React from "react";
import Link from "next/link";

export type DocumentSummary = {
  id: string;
  filename: string;
  url: string;
  category: string;
};

// Simple table listing documents with a link to their detail page.
export default function DocumentList({ docs }: { docs: DocumentSummary[] }) {
  return (
    <table className="w-full table-auto border-collapse">
      <thead>
        <tr>
          <th className="border px-2 py-1">Filename</th>
          <th className="border px-2 py-1">Category</th>
          <th className="border px-2 py-1">Action</th>
        </tr>
      </thead>
      <tbody>
        {docs.map((d) => (
          <tr key={d.id}>
            <td className="border px-2 py-1">{d.filename}</td>
            <td className="border px-2 py-1">{d.category}</td>
            <td className="border px-2 py-1">
              <Link href={`/documents/${d.id}`}>View</Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}


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


"use client";
import React from "react";

export type ReconciliationRow = {
  label: string;
  supervisorValue: string | number;
  auditorValue?: string | number;
};

export default function ReconciliationTable({
  rows,
}: {
  rows: ReconciliationRow[];
}) {
  return (
    <table className="w-full table-auto border-collapse">
      <thead>
        <tr>
          <th className="border px-2 py-1">Item</th>
          <th className="border px-2 py-1">Supervisor</th>
          <th className="border px-2 py-1">Auditor</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.label}>
            <td className="border px-2 py-1 font-medium">{r.label}</td>
            <td className="border px-2 py-1">{r.supervisorValue}</td>
            <td className="border px-2 py-1">{r.auditorValue ?? "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}


"use client";
import React, { useState } from "react";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("ECD_USER");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Failed to register");
      }
      setMessage("User registered successfully");
    } catch (err: any) {
      setMessage(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && <p className="mb-4">{message}</p>}
      <div>
        <label className="block">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-1 w-full"
        /> 
      </div>
      <div>
        <label className="block">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-1 w-full"
        />
      </div>
      <div>
        <label className="block">Role</label>
        <select value={role} onChange={(e) => setRole(e.target.value)} className="border p-1 w-full">
          <option>ADMIN</option>
          <option>PROVINCIAL</option>
          <option>AUDITOR</option>
          <option>SUPERVISOR</option>
          <option>ECD_USER</option>
        </select>
      </div>
      <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">
        Create user
      </button>
    </form>
  );
}

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


"use client";
import Link from "next/link";
import React from "react";

export type ReportSummary = {
  id: string;
  year: number;
  month: number;
  status: string;
};

export default function ReportList({ reports }: { reports: ReportSummary[] }) {
  return (
    <table className="w-full table-auto border-collapse">
      <thead>
        <tr>
          <th className="border px-2 py-1">Year</th>
          <th className="border px-2 py-1">Month</th>
          <th className="border px-2 py-1">Status</th>
          <th className="border px-2 py-1">Action</th>
        </tr>
      </thead>
      <tbody>
        {reports.map((r) => (
          <tr key={r.id}>
            <td className="border px-2 py-1">{r.year}</td>
            <td className="border px-2 py-1">{r.month}</td>
            <td className="border px-2 py-1">{r.status}</td>
            <td className="border px-2 py-1">
              <Link href={`/reports/auditor/${r.id}`}>View</Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}


/**
 * API Guards: Role-based and jurisdiction-based access control for endpoints
 * Used in /api routes to enforce multi-tenancy, role restrictions, and status checks
 */

// Import the enriched session helper and its TypeScript type.
// getSession() returns an EnrichedSession (or null) which includes role, jurisdiction, and status flags.
import { getSession, EnrichedSession } from "@/lib/get-session";

// -------------------------
// Guard 1: requireSession
// -------------------------
// Purpose: Ensure the request is authenticated and the user is in good standing.
// - Calls getSession() to fetch the session and user snapshot from the DB.
// - Throws ApiError(401) when the user is not authenticated or blocked.
export async function requireSession(): Promise<EnrichedSession> {
  // Retrieve enriched session (may be null)
  const session = await getSession();

  // If no session, user is not authenticated
  if (!session) {
    // 401 Unauthorized for unauthenticated or blocked users
    throw new ApiError(401, "Unauthorized: Please log in");
  }

  // Return the enriched session for downstream guards or handlers
  return session;
}

// -------------------------
// Guard 2: requireRole
// -------------------------
// Purpose: Ensure the current user has one of the allowed roles to perform an action.
// Usage example: requireRole(session, ["SUPERVISOR", "ADMIN"])
export function requireRole(session: EnrichedSession, allowedRoles: string[]): void {
  // If the user's role is not in the allowed list, block with 403 Forbidden
  if (!allowedRoles.includes(session.user.role)) {
    throw new ApiError(
      403,
      `Forbidden: This action requires one of [${allowedRoles.join(", ")}]. You are ${session.user.role}`
    );
  }
}

// -------------------------
// Guard 3: requireCenterAccess
// -------------------------
// Purpose: Ensure that the user can access data for a specific ECD center.
// Rules implemented here:
// - ADMIN: full access
// - PROVINCIAL: broad access (province-level enforcement happens in queries)
// - SUPERVISOR/ECD_USER: may only access their assigned center
// - AUDITOR: handled separately (district-level checks should be applied in DB queries)
export function requireCenterAccess(
  session: EnrichedSession,
  targetCenterId: string
): void {
  // ADMIN bypass
  if (session.user.role === "ADMIN") return;

  // PROVINCIAL bypass for center-level checks (they oversee districts/province)
  if (session.user.role === "PROVINCIAL") return;

  // Supervisor or ECD user: enforce same-center restriction
  if (session.user.role === "SUPERVISOR" || session.user.role === "ECD_USER") {
    // If the user's assigned center doesn't match the target, deny access
    if (session.user.ecdCenterId !== targetCenterId) {
      throw new ApiError(403, `Forbidden: You do not have access to center ${targetCenterId}`);
    }
    return; // allowed
  }

  // AUDITOR case intentionally not enforced here because auditor access is determined by district.
  // When implementing queries, always filter centers by `District.id = session.user.districtId`.
}

// -------------------------
// Guard 4: requireProvinceAccess
// -------------------------
// Purpose: Ensure the user can access a specific Province.
// Rules implemented here:
// - ADMIN: full access to all provinces
// - PROVINCIAL: must be assigned to the target province (cross-province access prevented)
// - Other roles: should not call this guard; deny by omission
export function requireProvinceAccess(
  session: EnrichedSession,
  targetProvinceId: string
): void {
  // ADMIN bypass
  if (session.user.role === "ADMIN") return;

  // PROVINCIAL: must be assigned to the target province
  if (session.user.role === "PROVINCIAL") {
    if (session.user.provinceId !== targetProvinceId) {
      throw new ApiError(403, `Forbidden: You do not have access to province ${targetProvinceId}`);
    }
    return; // allowed
  }

  // Other roles (SUPERVISOR, ECD_USER, AUDITOR) should not call this guard
  throw new ApiError(403, "Forbidden: Insufficient privileges for province access");
}

// -------------------------
// Guard 5: requireDistrictAccess 
// -------------------------
// Purpose: Ensure the user can access a specific District.
// Rules implemented here:
// - ADMIN: full access
// - PROVINCIAL: bypass here (province-level scoping enforced elsewhere)
// - AUDITOR: must match assigned districtId
export function requireDistrictAccess(
  session: EnrichedSession,
  targetDistrictId: string
): void {
  // ADMIN bypass
  if (session.user.role === "ADMIN") return;

  // PROVINCIAL bypass for district-level checks
  if (session.user.role === "PROVINCIAL") return;

  // AUDITOR: must be assigned to the target district
  if (session.user.role === "AUDITOR") {
    if (session.user.districtId !== targetDistrictId) {
      throw new ApiError(403, `Forbidden: You do not have access to district ${targetDistrictId}`);
    }
    return; // allowed
  }
 
  // Other roles (SUPERVISOR, ECD_USER) should not call this guard; if they do, deny by omission.
  throw new ApiError(403, "Forbidden: Insufficient privileges for district access");
}

// -------------------------
// Guard 6: isReportLocked
// -------------------------
// Purpose: Ensure a monthly report is not locked preventing supervisor edits.
// - status: the report's current status (DRAFT, SUBMITTED, LATE, REVIEWED, APPROVED)
// - allowedStatuses: which statuses permit editing (default: only DRAFT)
// Used to prevent double edits: once SUBMITTED, supervisor cannot modify until auditor flags CORRECTIONS_REQUIRED
export function isReportLocked(
  status: string,
  allowedStatuses: string[] = ["DRAFT"]
): void {
  if (!allowedStatuses.includes(status)) {
    throw new ApiError(403, `Report is locked. Current status: ${status}. Editing only allowed in [${allowedStatuses.join(", ")}]`);
  }
}

// -------------------------
// Guard 7: preventSelfReview 
// -------------------------
// Purpose: Prevent a user from reviewing their own upload (conflict of interest).
// - uploadedById: the user who uploaded the resource
// - reviewedById: the user attempting to review
export function preventSelfReview(uploadedById: string, reviewedById: string): void {
  if (uploadedById === reviewedById) {
    throw new ApiError(403, "Conflict of Interest: You cannot review your own submissions");
  }
}

// -------------------------
// ApiError: Structured API error
// -------------------------
// A small Error subclass that carries an HTTP status for consistent handling in routes.
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError"; 
  }
}

// -------------------------
// errorResponse helper
// -------------------------
// Convert ApiError or unknown exceptions into Response objects usable in Next API routes.
export function errorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Log unexpected errors and return generic 500
  console.error("[API Error]", error);
  return new Response(JSON.stringify({ error: "Internal Server Error" }), {
    status: 500,
    headers: { "Content-Type": "application/json" },
  });
}


// lib/auth-client.ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: "https://zany-umbrella-pjq645v6jvq62769g-3000.app.github.dev", // Your site URL
});


// import { betterAuth } from "better-auth";
// import { prismaAdapter } from "better-auth/adapters/prisma";
// import { prisma } from "@kinderz/db";
// import bcrypt from "bcryptjs";

// // PrismaConfig — database type
// const config = {
//   provider: "postgresql" as const,
// };

// export const auth = betterAuth({
//   // Connect to Prisma
//   adapter: prismaAdapter(prisma, config),

//   // Secret for signing cookies
//   secret: process.env.BETTER_AUTH_SECRET!,

//   // Credentials provider (email/password)
//   credentials: {
//     async authorize(
//       credentials: { email: string; password: string } // <- type added
//     ) {
//       const { email, password } = credentials;

//       // Find user by email
//       const user = await prisma.user.findUnique({
//         where: { email },
//       });

//       // Reject if no user or no password stored
//       if (!user || !user.password) return null;

//       // Check password
//       const isValid = await bcrypt.compare(password, user.password);
//       if (!isValid) return null;

//       // Return user for session
//       return {
//         id: user.id,
//         email: user.email,
//         role: user.role,
//       };
//     },
//   },
  
// });



// import { betterAuth } from "better-auth";
// import { prismaAdapter } from "better-auth/adapters/prisma";
// import { prisma } from "@kinderz/db";
// import bcrypt from "bcryptjs";

// // REQUIRED by your adapter version
// const config = {
//   provider: "postgresql" as const,
// };

// export const auth = betterAuth({
//   // Prisma adapter (must include config)
//   adapter: prismaAdapter(prisma, config),

//   // Secret for cookies & tokens
//   secret: process.env.BETTER_AUTH_SECRET!,

//   // Credentials: Email + Password
//   credentials: {
//     async authorize(credentials: { email?: string; password?: string }) {
//       if (!credentials?.email || !credentials?.password) {
//         return null;
//       }

//       const user = await prisma.user.findUnique({
//         where: { email: credentials.email },
//       });

//       if (!user || !user.password) return null;

//       const isValid = await bcrypt.compare(
//         credentials.password,
//         user.password
//       );

//       if (!isValid) return null;

//       return {
//         id: user.id,
//         email: user.email,
//         role: user.role,
//       };
//     },
//   },
// });



// import { betterAuth } from "better-auth";
// import { prismaAdapter } from "better-auth/adapters/prisma";
// import { prisma } from "@kinderz/db";


// // REQUIRED by your adapter version
// const config = {
//   provider: "postgresql" as const,
// };

// export const auth = betterAuth({
//   // Prisma adapter (must include config)
//   database: prismaAdapter(prisma, config),

//   // Secret for cookies & tokens
//   secret: process.env.BETTER_AUTH_SECRET!,

//   // This is the specific block that fixes your "not enabled" error
//   emailAndPassword: {
//     enabled: true,
//   },
  
//   // If you need the 'role' or other custom fields in the session
//   user: {
//     additionalFields: {
//       role: {
//         type: "string",
//         required: false,
//         defaultValue: "ECD_USER",
//       },
//     },
//   },
// });



// import { betterAuth } from "better-auth";
// import { prismaAdapter } from "better-auth/adapters/prisma";
// import { prisma } from "@kinderz/db"; // Complying with your workspace import
// import { admin } from "better-auth/plugins";

// // REQUIRED by your adapter version for PostgreSQL
// const adapterConfig = {
//   provider: "postgresql" as const,
// };

// export const auth = betterAuth({
//   // 1. Database Setup
//   database: prismaAdapter(prisma, adapterConfig),

//   // 2. Security
//   secret: process.env.BETTER_AUTH_SECRET!,

// // This is the "Nuclear Option" for Codespaces development.
//   // It tells Better Auth: "Don't block requests based on the URL origin."
//   advanced: {
//     disableCheckOrigin: true, 
//   },


//   // FIX: Explicitly allow both the Codespace URL AND localhost
//   trustedOrigins: [
//     "https://zany-umbrella-pjq645v6jvq62769g-3000.app.github.dev"
//   ],



//   // 3. Phase 1: Credentials (Email & Password)
//   emailAndPassword: {
//     enabled: true,
//     // Fix: Explicitly type the authorize arguments to avoid the 'any' error
//     async authorize({ email, password }: { email: string; password: string }) {
//       // 1. Find user in the Prisma DB
//       const user = await prisma.user.findUnique({
//         where: { email },
//       });

//       // 2. Simple password check (Note: Better Auth handles hashing, 
//       // but this is the manual hook if you need it)
//       if (!user || user.password !== password) {
//         return null; // Signals unauthorized
//       }

//       return user; // Returns user to create the session
//     },
//   },

//   // 4. Customizing the Session & User shape
//   user: {
//     additionalFields: {
//       role: {
//         type: "string",
//         required: false,
//         defaultValue: "ECD_USER", // Ensures new signups get this role
//       },
//     },
//   },

//   // 5. Plugins (Prepares for Phase 3 Role Guards)
//   plugins: [
//     admin(), // Enables role-based logic server-side
//   ],
// });




import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@kinderz/db"; 
import { admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";

// REQUIRED by your adapter version for PostgreSQL
const adapterConfig = {
  provider: "postgresql" as const,
};

export const auth = betterAuth({
  // 1. Database Setup
  database: prismaAdapter(prisma, adapterConfig),

  baseURL: "https://zany-umbrella-pjq645v6jvq62769g-3000.app.github.dev",

  // 2. Security & Origin Configuration
  secret: process.env.BETTER_AUTH_SECRET!,

  // In 1.4.7, we use trustedOrigins + useSecureCookies to bypass the origin block in Codespaces
  advanced: {
    // 1. Tell Better Auth it is behind a proxy (Codespaces)
    useSecureCookies: true, 
    // 2. This is the "Magic" setting for 1.4.7 to trust proxy headers
    trustHost: true, 
  },

  // This tells the server exactly which URLs to trust
  trustedOrigins: [
    "https://zany-umbrella-pjq645v6jvq62769g-3000.app.github.dev",
    "https://localhost:3000",
    "http://localhost:3000"
  ],

  // 3. Phase 1: Credentials (Email & Password)
  // Logic: In 1.4.7, 'enabled: true' handles the findUnique and password check automatically.
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true once you reach Phase 2
  },

  // 4. Customizing the Session & User shape
  user: {
          // 1. This "fields" block tells Better Auth: "Don't send 'banned' to Prisma"
      
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "ECD_USER", 
        input: false, // This prevents the client from accidentally sending "user"
      },
    },
  },

  // 5. Plugins
  plugins: [
    admin({
      // This is the secret fix: Tell the admin plugin NOT to 
      // use the default "user" string.
      defaultRole: "ECD_USER", 
    }), // Enables role-based logic
    nextCookies(), // Essential for Next.js App Router cookie handling
  ],
  
});


import { auth } from "@/lib/betterAuth";
import { headers } from "next/headers";
import { prisma } from "@kinderz/db";

/**
 * Enhanced session type that includes role, jurisdiction, and status checks.
 * This enriches the basic Better-Auth session with database-driven permissions.
 */
export interface EnrichedSession {
    user: {
        id: string;
        email: string;
        role: string; // ADMIN, PROVINCIAL, SUPERVISOR, AUDITOR, ECD_USER
        ecdCenterId: string | null; // Jurisdiction: which center this user belongs to
        districtId: string | null; // Jurisdiction: which district this user belongs to
        provinceId: string | null; // Jurisdiction: which province this user belongs to
        isActive: boolean; // false = blocked from all access
        isFrozen: boolean; // false = account temporarily locked
        banned: boolean; // false = account permanently locked
    };
    expiresAt: number;
}

/**
 * getSession()
 * 1. Fetch session from Better-Auth
 * 2. Query user record from DB to get role, jurisdictions, status
 * 3. Return null if user is banned/frozen/inactive (immediate blocklist)
 * 4. Return enriched session with role + jurisdiction for guards
 */
export async function getSession(): Promise<EnrichedSession | null> {
    return await auth.api.getSession({
        headers: await headers()
        }).then(async (session) => {
            // If no session, return null immediately
            if (!session?.user?.id) return null;

            // Query Prisma to get full user record including role, jurisdictions, status
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: {
                    id: true,
                    email: true,
                    role: true,
                    ecdCenterId: true,
                    districtId: true,
                    provinceId: true,
                    isActive: true,
                    isFrozen: true,
                    banned: true,
                },
            });

            // User not found in DB (should not happen, but be safe)
            if (!user) return null;

            // REJECT: User is banned (permanent block)
            if (user.banned) return null;

            // REJECT: User is frozen (temporary block)
            if (user.isFrozen) return null;

            // REJECT: User is marked inactive (administrative hold)
            if (!user.isActive) return null;

            // Return enriched session with role, jurisdictions, and status snapshot
            return {
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role, // Now includes ADMIN, PROVINCIAL, etc.
                    ecdCenterId: user.ecdCenterId, // null for Admin/Provincial; set for SUPERVISOR/ECD_USER
                    districtId: user.districtId, // null for non-Auditor; set for AUDITOR
                    provinceId: user.provinceId, // null for non-Provincial; set for PROVINCIAL
                    isActive: user.isActive,
                    isFrozen: user.isFrozen,
                    banned: user.banned,
                },
                // auth.api.getSession() returns { session: { expiresAt: Date }, user: {...} }
                // Convert to numeric ms timestamp for easier comparisons in guards
                expiresAt: session?.session?.expiresAt
                    ? new Date(session.session.expiresAt).getTime()
                    : Date.now(),
            };
    });
}  



/** @type {import('next').NextConfig} */
const nextConfig = {
  // This is the most common reason for "Page isn't working" in Codespaces
  async headers() {
    return [
      {
        source: "/api/auth/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "https://zany-umbrella-pjq645v6jvq62769g-3000.app.github.dev" },
        ],
      },
    ];
  },
  transpilePackages: ["@kinderz/db"],
  experimental: {
    serverActions: {
      allowedOrigins: [
        "zany-umbrella-pjq645v6jvq62769g-3000.app.github.dev",
        "localhost:3000"
      ],
    },
  },
};

export default nextConfig;



{
  "name": "web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@kinderz/db": "^0.0.1",
    "bcryptjs": "^3.0.3",
    "better-auth": "^1.4.7",
    "next": "14.2.35",
    "react": "^18",
    "react-dom": "^18"
  },
  "devDependencies": {
    "@types/node": "^20.19.33",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "eslint": "^8",
    "eslint-config-next": "14.2.35",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "ts-node": "^10.9.2",
    "tsx": "^4.21.0",
    "typescript": "^5.9.3"
  }
}



/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
  },
};

export default config;



import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
};
export default config;


{
  "compilerOptions": {
    "types": ["node"],
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}


generator client {
  provider = "prisma-client-js"
  output   = "../../../node_modules/.prisma/client"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                    String            @id @default(cuid())
  email                 String            @unique
  password              String?
  emailVerified         Boolean           @default(false)
  name                  String?
  image                 String?
  role                  Role              @default(ECD_USER)
  banned                Boolean           @default(false) // Add this line
  isActive              Boolean           @default(true)
  isFrozen              Boolean           @default(false)
  createdAt             DateTime          @default(now())
  updatedAt             DateTime          @updatedAt
  ecdCenterId           String? // Links ECD_USER/SUPERVISOR to their center for multi-tenancy isolation
  districtId            String? // Links AUDITOR to their district; prevents viewing other districts
  provinceId            String? // Links PROVINCIAL to their province; prevents cross-province access
  assignedById          String? // Tracks which AUDITOR assigned this user; ensures audit trail
  documents             Document[]
  ecdCenter             EcdCenter?
  district              District?         @relation(fields: [districtId], references: [id]) // AUDITOR's district scope
  province              Province?         @relation(fields: [provinceId], references: [id]) // PROVINCIAL's province scope
  assignedBy            User?             @relation("AssignedUsers", fields: [assignedById], references: [id]) // Who assigned me
  assignedUsers         User[]            @relation("AssignedUsers") // Users I (Auditor) assigned
  reviewedProofs        PaymentProof[]    @relation("ReviewedPayments")
  paymentProofs         PaymentProof[]    @relation("UploadedPayments")
  reports               QuarterlyReport[] @relation("CreatedReports")
  monthlyReports        MonthlyReport[]   @relation("MonthlySubmissions")
  auditFindingsReviewed AuditFinding[]    @relation("FindingReviewedBy") // PROVINCIAL findings this user approved/flagged
  accounts              Account[]
  sessions              Session[]
  verifications         Verification[]

  @@unique([provinceId, role]) // enforce at most one user with a given role per province (e.g. single PROVINCIAL per province)
  @@index([role])
  @@index([ecdCenterId])
  @@index([districtId]) // Speed up AUDITOR district-level queries
  @@index([provinceId]) // Speed up PROVINCIAL province-level queries
  @@map("user")
}

model Province {
  id          String     @id @default(cuid())
  name        String // Province name; PROVINCIAL user manages exactly one province
  districts   District[] // All districts within this province
  provincials User[] // PROVINCIAL users assigned to this province; stores their provinceId
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@index([name]) // Speed up PROVINCIAL user lookups
}

model District {
  id         String      @id @default(cuid())
  name       String // District name (e.g., "District A")
  provinceId String // Foreign key to Province; enforces hierarchy: Province → District → EcdCenter for PROVINCIAL role isolation
  province   Province    @relation(fields: [provinceId], references: [id], onDelete: Cascade) // Links to parent Province
  auditors   User[] // Auditors assigned to this district via districtId; stores their districtId
  ecdCenters EcdCenter[] // Centers in district; created by PROVINCIAL, reviewed by AUDITOR in this district
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt

  @@index([provinceId]) // Speed up PROVINCIAL user's district lookups
}

model EcdCenter {
  id           String   @id @default(cuid())
  name         String
  districtId   String // Foreign key to District; ensures center belongs to exactly one district
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  supervisorId String?  @unique // One SUPERVISOR per center; database enforced

  // fields maintained by PROVINCIAL
  basNumber              String? // tax ID or BAS number
  registrationExpiryDate DateTime? // compliance expiry
  registrationLevel      String? // e.g., "Level 1", "Level 2"
  fundingStatus          CenterFundingStatus @default(APPROVED)
  fundingRecords         EcdCenterFunding[] // Historical funding records for this center

  children       Child[]
  documents      Document[]
  district       District          @relation(fields: [districtId], references: [id], onDelete: Cascade) // Multi-tenancy anchor
  supervisor     User?             @relation(fields: [supervisorId], references: [id])
  practitioners  Practitioner[]
  reports        QuarterlyReport[]
  monthlyReports MonthlyReport[] // One-to-many relationship for monthly data ingestion (Supervisor submissions)
  subscription   Subscription?

  @@index([districtId]) // Speed up district-level queries for AUDITOR & PROVINCIAL
}

model Subscription {
  id          String             @id @default(cuid())
  ecdCenterId String             @unique
  status      SubscriptionStatus @default(INACTIVE)
  liable      Boolean            @default(false)
  graceUntil  DateTime?
  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt
  payments    PaymentProof[]
  ecdCenter   EcdCenter          @relation(fields: [ecdCenterId], references: [id], onDelete: Cascade)
}

model PaymentProof {
  id             String           @id @default(cuid())
  subscriptionId String
  uploadedById   String
  category       DocumentCategory
  fileUrl        String
  comment        String? // What the payment is for (e.g., "Food for Jan 2026", "Salary - Nov 2025"); filled by SUPERVISOR/ECD_USER
  status         PaymentStatus    @default(PENDING)
  reviewedById   String?
  createdAt      DateTime         @default(now())
  reviewedAt     DateTime?
  reviewedBy     User?            @relation("ReviewedPayments", fields: [reviewedById], references: [id])
  subscription   Subscription     @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)
  uploadedBy     User             @relation("UploadedPayments", fields: [uploadedById], references: [id])
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  expiresAt DateTime
  token     String   @unique
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token])
  @@map("session")
}

model Account {
  id                    String    @id @default(cuid())
  accountId             String
  providerId            String
  userId                String
  password              String?
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("account")
}

model Verification {
  id         String    @id @default(cuid())
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime? @default(now())
  updatedAt  DateTime? @updatedAt
  userId     String?
  user       User?     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("verification")
}

model Child {
  id          String       @id @default(cuid())
  fullName    String
  funded      Boolean
  dateOfBirth DateTime
  ecdCenterId String
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  attendance  Attendance[]
  ecdCenter   EcdCenter    @relation(fields: [ecdCenterId], references: [id], onDelete: Cascade)

  @@index([ecdCenterId])
}

model Practitioner {
  id          String    @id @default(cuid())
  fullName    String
  role        String
  salary      Decimal?
  ecdCenterId String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  ecdCenter   EcdCenter @relation(fields: [ecdCenterId], references: [id], onDelete: Cascade)
}

model QuarterlyReport {
  id                String                @id @default(cuid())
  year              Int
  quarter           Int
  status            SubmissionStatus
  // NARRATIVE: Supervisor fills these sections in the Quarterly Progress Report
  programmeName     String? // e.g., "Early Childhood Development Programme"
  achievements      String? // Summary of key achievements during the quarter
  challenges        String? // Summary of challenges encountered during the quarter
  totalIncome       Decimal               @default(0) // Level 2 financial ingestion: SUPERVISOR enters total income for verification against uploaded payment proofs
  totalExpenses     Decimal               @default(0) // Level 2 financial ingestion: SUPERVISOR enters total expenses for verification against uploaded payment proofs
  notes             String? // SUPERVISOR explains financial deviances or unusual patterns for AUDITOR context
  // COMPLIANCE: snapshot of the 80% attendance rule (computed at submission)
  is80PercentAttend Boolean? // true if >=80% attendance during the quarter; stored as snapshot
  isLate            Boolean               @default(false)
  submittedAt       DateTime?
  ecdCenterId       String
  createdById       String
  createdAt         DateTime              @default(now())
  updatedAt         DateTime              @updatedAt
  attendance        Attendance[]
  findings          AuditFinding?
  documents         Document[]
  allocations       FinancialAllocation[]
  createdBy         User                  @relation("CreatedReports", fields: [createdById], references: [id], onDelete: Cascade)
  ecdCenter         EcdCenter             @relation(fields: [ecdCenterId], references: [id], onDelete: Cascade)

  @@unique([ecdCenterId, year, quarter])
}

model Attendance {
  id        String          @id @default(cuid())
  date      DateTime
  present   Boolean
  childId   String
  reportId  String
  createdAt DateTime        @default(now())
  updatedAt DateTime        @updatedAt
  child     Child           @relation(fields: [childId], references: [id], onDelete: Cascade)
  report    QuarterlyReport @relation(fields: [reportId], references: [id], onDelete: Cascade)

  @@unique([childId, date])
}

model Document {
  id              String           @id @default(cuid())
  filename        String
  url             String
  category        DocumentCategory
  comment         String?
  uploadedById    String
  ecdCenterId     String
  reportId        String?
  monthlyReportId String? // Link document to a MonthlyReport when supporting monthly submissions
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  ecdCenter       EcdCenter        @relation(fields: [ecdCenterId], references: [id], onDelete: Cascade)
  report          QuarterlyReport? @relation(fields: [reportId], references: [id])
  monthlyReport   MonthlyReport?   @relation(fields: [monthlyReportId], references: [id])
  uploadedBy      User             @relation(fields: [uploadedById], references: [id], onDelete: Cascade)
}

model FinancialAllocation {
  id        String           @id @default(cuid())
  category  DocumentCategory
  amount    Decimal
  date      DateTime
  reportId  String
  createdAt DateTime         @default(now())
  updatedAt DateTime         @updatedAt
  report    QuarterlyReport  @relation(fields: [reportId], references: [id], onDelete: Cascade)
}

model AuditFinding {
  id           String          @id @default(cuid())
  comments     String // AUDITOR's detailed findings and observations
  compliant    Boolean // Quick compliance flag
  status       FindingStatus   @default(PENDING) // Audit workflow: PENDING (awaiting review) → APPROVED (funding released) | FLAGGED (futher investigation) | CORRECTIONS_REQUIRED (needs remediation)
  reviewedById String? // PROVINCIAL official who made the final funding decision; tracks accountability for approval/denial
  reportId     String          @unique
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt
  report       QuarterlyReport @relation(fields: [reportId], references: [id], onDelete: Cascade)
  reviewedBy   User?           @relation("FindingReviewedBy", fields: [reviewedById], references: [id]) // PROVINCIAL who reviewed this finding
}

// Monthly reports capture the month-by-month allocation and expenditure details
// The Supervisor fills these; they are later rolled up into QuarterlyReport
model MonthlyReport {
  id               String              @id @default(cuid())
  year             Int // e.g., 2025
  month            Int // 1-12
  ecdCenterId      String
  submittedById    String // Supervisor or ECD_USER who submitted the monthly report
  submittedBy      User                @relation("MonthlySubmissions", fields: [submittedById], references: [id], onDelete: Cascade)
  allocation       Decimal             @default(0) // Allocation received for this month
  totalExpenditure Decimal             @default(0) // Sum of categorized expenditures for quick validation
  salariesExpense  Decimal?            @default(0) // Breakdown for Level 2 financial ingestion (optional)
  foodExpense      Decimal?            @default(0)
  overheadsExpense Decimal?            @default(0)
  otherExpense     Decimal?            @default(0)
  // AUDITOR reconciliation values (Dep Calculations) — optional, filled by the Auditor during review
  salariesDepCalc  Decimal?            @default(0)
  foodDepCalc      Decimal?            @default(0)
  overheadsDepCalc Decimal?            @default(0)
  attendanceCount  Int? // Number of children on attendance register that month
  childrenFunded   Int? // Number of children funded that month
  notes            String? // Supervisor notes for the month (explain large variances)
  submittedAt      DateTime?
  signatureUrl     String? // Optional upload of signature image/proof
  documents        Document[] // Supporting attachments (bank statements, payslips, receipts)
  allocations      MonthlyAllocation[] // Line-item allocations for this month
  createdAt        DateTime            @default(now())
  updatedAt        DateTime            @updatedAt
  // REVIEW TRACKING: filled by the Auditor when they complete the monitoring tool
  reviewedById     String? // user.id of the auditor who reviewed this month
  reviewedAt       DateTime? // timestamp of that review
  // STATUS WORKFLOW: enforces data integrity. DRAFT allows supervisor edits; SUBMITTED locks supervisor, allows auditor review; REVIEWED means audited
  status           SubmissionStatus    @default(DRAFT)

  ecdCenter EcdCenter @relation(fields: [ecdCenterId], references: [id], onDelete: Cascade)

  @@unique([ecdCenterId, year, month])
  @@index([ecdCenterId])
}

// MonthlyAllocation represents categorical allocations/expenditures for the monthly report
model MonthlyAllocation {
  id        String           @id @default(cuid())
  reportId  String
  category  DocumentCategory
  amount    Decimal
  date      DateTime
  createdAt DateTime         @default(now())
  updatedAt DateTime         @updatedAt
  report    MonthlyReport    @relation(fields: [reportId], references: [id], onDelete: Cascade)
}

// Track changes to funding parameters for an ECD center across fiscal years
model EcdCenterFunding {
  id                 String              @id @default(cuid())
  ecdCenterId        String              @unique
  basNumber          String?
  registrationLevel  String?
  registrationExpiry DateTime?
  budgetPerAnnum     Decimal?
  budgetPerQuarter   Decimal?
  q1Actual           Decimal?            @default(0)
  q2Actual           Decimal?            @default(0)
  q3Actual           Decimal?            @default(0)
  q4Actual           Decimal?            @default(0)
  balance            Decimal?            @default(0)
  fundingStatus      CenterFundingStatus @default(APPROVED)
  createdAt          DateTime            @default(now())
  updatedAt          DateTime            @updatedAt
  ecdCenter          EcdCenter           @relation(fields: [ecdCenterId], references: [id], onDelete: Cascade)
}

// Invitation tokens used to bootstrap new users through the controlled flow
model Invite {
  id          String   @id @default(cuid())
  email       String
  role        Role
  provinceId  String? // for PROVINCIAL invites (they manage one province)
  districtId  String? // for AUDITOR invites (they work in one district)
  ecdCenterId String? // for SUPERVISOR/ECD_USER invites (they work at one center)
  token       String   @unique
  expiresAt   DateTime
  used        Boolean  @default(false)
  createdAt   DateTime @default(now())
}

enum Role {
  ADMIN
  SUPERVISOR
  ECD_USER
  AUDITOR
  PROVINCIAL
}

enum DocumentCategory {
  FOOD
  SALARIES
  OVERHEADS
  BANK_STATEMENT
  FINANCIAL_REPORT
  AFFIDAVIT
  OTHER
}

enum SubmissionStatus {
  DRAFT
  SUBMITTED
  LATE
  REVIEWED
  APPROVED
}

enum SubscriptionStatus {
  INACTIVE
  ACTIVE
  GRACE
  SUSPENDED
}

enum CenterFundingStatus {
  APPROVED
  DISCONTINUED
  DISAPPROVED
}

enum PaymentStatus {
  PENDING
  VERIFIED
  REJECTED
}

enum FindingStatus {
  PENDING // AUDITOR submitted finding, awaiting PROVINCIAL review for funding decision
  APPROVED // PROVINCIAL approved funding for this center; positive audit result
  FLAGGED // PROVINCIAL flagged for further investigation; center compliance incomplete
  CORRECTIONS_REQUIRED // Center must remediate issues before funding is released; action items assigned
}



import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;


export * from "./prisma";


{
  "name": "@kinderz/db",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "main": "index.ts",
  "scripts": {
    "prisma": "prisma",
    "generate": "prisma generate",
    "migrate": "prisma migrate dev"
  },
  "dependencies": {
    "@prisma/client": "5.22.0"
  },
  "devDependencies": {
    "prisma": "5.22.0"
  }
}


DATABASE_URL="postgresql://neondb_owner:npg_Xe1FT0SUAryI@ep-dark-mode-a7kcfnpu-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"



{
  "name": "kinderz-ecdz",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "apps/web": {
      "version": "0.1.0",
      "extraneous": true,
      "dependencies": {
        "@kinderz/db": "^0.0.1",
        "bcryptjs": "^3.0.3",
        "better-auth": "^1.4.7",
        "next": "14.2.35",
        "react": "^18",
        "react-dom": "^18"
      },
      "devDependencies": {
        "@types/node": "^20.19.33",
        "@types/react": "^18",
        "@types/react-dom": "^18",
        "eslint": "^8",
        "eslint-config-next": "14.2.35",
        "postcss": "^8",
        "tailwindcss": "^3.4.1",
        "ts-node": "^10.9.2",
        "tsx": "^4.21.0",
        "typescript": "^5.9.3"
      }
    },
    "packages/db": {
      "name": "@kinderz/db",
      "version": "0.0.1",
      "extraneous": true,
      "dependencies": {
        "@prisma/client": "5.22.0"
      },
      "devDependencies": {
        "prisma": "5.22.0"
      }
    }
  }
}



{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "resolveJsonModule": true
  }
}












