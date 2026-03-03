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
