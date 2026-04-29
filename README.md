- 👋 Hi, I’m @lionellink
- 👀 I’m interested in ...People
- 🌱 I’m currently learning ...JavaScript
- 💞️ I’m looking to collaborate on ...Projects
- 📫 How to reach me ... mpholincoln@gmail.com

<!---
lionellink/lionellink is a ✨ special ✨ repository because its `README.md` (this file) appears on your GitHub profile.
You can click the Preview link to take a look at your changes.
--->



at /workspaces/kinderz-ecdz/apps/web/app/(auth)/login/page.tsx, i have ""use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() { 
  const router = useRouter();
  const searchParams = useSearchParams(); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(""); 

  // Check if user arrived here via a successful registration redirect
  const registered = searchParams.get("registered");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error } = await authClient.signIn.email({
      email: email.toLowerCase().trim(),
      password,
    });

    if (error) {
      setError(error.message || "Invalid email or password");
      setLoading(false);
    } else {
      // Better-Auth automatically handles the session/cookie
      router.push("/dashboard");
      router.refresh(); // Ensure the layout recognizes the new session
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900">Tinyiko</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Sign in to manage your ECD Center or Audit
          </p>
        </div>

        {/* Success message after registration completion */}
        {registered && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-md">
            Account activated! You can now sign in.
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              required
              placeholder="admin@tinyiko.co.za"
              className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-900 text-white p-2 rounded-md font-semibold hover:bg-blue-800 transition disabled:bg-gray-400 shadow-md"
          >
            {loading ? "Authenticating..." : "Sign In"} 
          </button>
        </form>

        <div className="mt-6 text-center text-[11px] text-gray-400">
          <p>Access restricted to authorized DSD personnel and ECD Supervisors.</p>
        </div>
      </div>
    </div>
  );
}  "  and at /workspaces/kinderz-ecdz/apps/web/app/(auth)/register/[token]/page.tsx, i have "import { prisma } from "@kinderz/db";
import { notFound } from "next/navigation";
import RegisterForm from "@/components/RegisterForm";

export default async function RegisterPage({ params }: { params: { token: string } }) {
  const invite = await prisma.invite.findUnique({
    where: { token: params.token },
  });

  // This check prevents the 'never' type error
  if (!invite || invite.used || invite.expiresAt < new Date()) {
    return notFound();
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <RegisterForm 
        email={invite.email} 
        token={invite.token} 
        role={invite.role}
        provinceId={invite.provinceId}   
        districtId={invite.districtId}
        ecdCenterId={invite.ecdCenterId}  
      />
    </div>
  );
}"  and at /workspaces/kinderz-ecdz/apps/web/app/(auth)/signup/page.tsx, I have "// /**
//  * @file apps/web/app/signup/page.tsx
//  * @description Signup page that consumes invitation tokens to 
//  * automatically link users to Provinces, Districts, or ECD Centers.
//  */

// "use client";

// import { useEffect, useState } from "react";
// import { useSearchParams, useRouter } from "next/navigation";
// import { authClient } from "@/lib/auth-client"; // Your Better-Auth client

// export default function SignupPage() {
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const token = searchParams.get("token");

//   const [invite, setInvite] = useState<any>(null);
//   const [loading, setLoading] = useState(!!token);
//   const [error, setError] = useState("");

//   // 1. If a token exists, verify it immediately on load
//   useEffect(() => {
//     if (token) {
//       fetch(`/api/invites?token=${token}`)
//         .then((res) => res.json())
//         .then((data) => {
//           if (data.error) throw new Error(data.error);
//           setInvite(data);
//           setLoading(false);
//         })
//         .catch((err) => {
//           setError("This invitation is invalid or has expired.");
//           setLoading(false);
//         });
//     }
//   }, [token]);

//   const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     const formData = new FormData(e.currentTarget);
//     const password = formData.get("password") as string;
//     const name = formData.get("name") as string;

//     const { data, error } = await authClient.signUp.email({
//       email: invite.email, // Locked to the invite email
//       password,
//       name,
//       // Pass metadata so Better-Auth knows where to put this user
//       data: {
//         role: invite.role,
//         provinceId: invite.provinceId,
//         districtId: invite.districtId,
//         ecdCenterId: invite.ecdCenterId,
//       },
//     });

//     if (error) {
//       alert(error.message);
//     } else {
//       // 2. BURN THE TOKEN: Mark as used so it can't be reused
//       await fetch("/api/invites", {
//         method: "PATCH",
//         body: JSON.stringify({ token }),
//       });
      
//       router.push("/dashboard");
//     }
//   };

//   if (loading) return <p className="p-10">Verifying invitation...</p>;
//   if (error) return <p className="p-10 text-red-500">{error}</p>;
//   if (!token) return <p className="p-10">Sign up is by invitation only.</p>;

//   return (
//     <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
//       <h1 className="text-xl font-bold mb-4">Complete your Registration</h1>
//       <p className="text-sm text-gray-600 mb-6">
//         Joining as <strong>{invite.role}</strong> for 
//         {invite.ecdCenterId ? " ECD Center" : invite.provinceId ? " Province" : " the System"}.
//       </p>

//       <form onSubmit={handleSignup} className="space-y-4">
//         <div>
//           <label className="block text-sm font-medium">Email (Locked)</label>
//           <input 
//             type="text" 
//             value={invite.email} 
//             disabled 
//             className="w-full p-2 bg-gray-100 border rounded cursor-not-allowed"
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium">Full Name</label>
//           <input name="name" type="text" required className="w-full p-2 border rounded" />
//         </div>
//         <div>
//           <label className="block text-sm font-medium">Password</label>
//           <input name="password" type="password" required className="w-full p-2 border rounded" />
//         </div>
//         <button 
//           type="submit" 
//           className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
//         >
//           Create Account
//         </button>
//       </form>
//     </div>
//   );
// }





"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Link from "next/link"; // For the login button

export default function SignupPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [invite, setInvite] = useState<any>(null);
  const [loading, setLoading] = useState(!!token);
  const [error, setError] = useState("");

  useEffect(() => {
    if (token) {
      fetch(`/api/invites?token=${token}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) throw new Error(data.error);
          setInvite(data);
          setLoading(false);
        })
        .catch(() => {
          setError("This invitation is invalid or has expired.");
          setLoading(false);
        });
    }
  }, [token]);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    // FIX: Properties are passed directly, not inside 'data'
    const { data, error } = await authClient.signUp.email({
      email: invite.email,
      password,
      name,
      role: invite.role,
      provinceId: invite.provinceId,
      districtId: invite.districtId,
      ecdCenterId: invite.ecdCenterId,
    }as any);

    if (error) {
      alert(error.message);
    } else {
      await fetch("/api/invites", {
        method: "PATCH",
        body: JSON.stringify({ token }),
      });
      router.push("/dashboard");
    }
  };

  if (loading) return <p className="p-10 text-center">Verifying invitation...</p>;
  
  if (error || !token) return (
    <div className="max-w-md mx-auto mt-20 p-6 text-center">
      <p className="mb-4 text-red-500">{error || "Sign up is by invitation only."}</p>
      <Link href="/login" className="text-blue-600 hover:underline">Go to Login</Link>
    </div>
  );

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow border border-gray-200">
      <h1 className="text-xl font-bold mb-4">Complete your Registration</h1>
      <p className="text-sm text-gray-600 mb-6">
        Joining as <strong>{invite.role}</strong> for 
        {invite.ecdCenterId ? " ECD Center" : invite.provinceId ? " Province" : " the System"}.
      </p>

      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Email (Locked)</label>
          <input 
            type="text" 
            value={invite.email} 
            disabled 
            className="w-full p-2 bg-gray-100 border rounded cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Full Name</label>
          <input name="name" type="text" required className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input name="password" type="password" required className="w-full p-2 border rounded" />
        </div>
        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white p-2 rounded font-semibold hover:bg-blue-700 transition"
        >
          Create Account
        </button>
      </form>

      <div className="mt-6 pt-6 border-t text-center">
        <p className="text-sm text-gray-500 mb-2">Already have an account?</p>
        <Link 
          href="/login" 
          className="inline-block w-full border border-blue-600 text-blue-600 p-2 rounded font-semibold hover:bg-blue-50 transition"
        >
          Sign In 
        </Link>
      </div> 
    </div>
  );
}"
    Kindly explain to me why i should delete all these (auth) files and only put yours ""




{
  "name": "Kinderz ECD Dev",
  "image": "node:18-bullseye-slim",
  "features": {
    "ghcr.io/devcontainers/features/git:1": {}
  },
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
  "postCreateCommand": "npm install",
  "remoteUser": "node"
}

previous schema;

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





invite/route.ts   - existing file replaced

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


// PREVIOUS REPORT FORM

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
 