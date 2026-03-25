/**
 * @file apps/web/app/api/invites/route.ts
 * @description Centralized Invitation API. 
 * Handles creation, validation (GET), and consumption (PATCH) of invites.
 * Enforces the Provincial/District/Center hierarchy.
 */

import { prisma } from "@kinderz/db";
import { requireSession, requireRole, ApiError, errorResponse } from "@/lib/api-guards";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    // 1. Authenticate the user and ensure they have invitation privileges
    const session = await requireSession();
    requireRole(session, ["ADMIN", "PROVINCIAL", "SUPERVISOR"]);

    // 2. Extract and sanitize payload
    const body = await req.json();
    const { email, role, provinceId, districtId, ecdCenterId } = body;
    const cleanEmail = email?.toLowerCase().trim();

    if (!cleanEmail || !role) throw new ApiError(400, "Email and role are required");

    // 3. Hierarchical Constraint Logic
    // -------------------------------------------------------------------------
    
    if (role === "PROVINCIAL") {
      if (!provinceId) throw new ApiError(400, "provinceId required for PROVINCIAL invites");
      // Prevent a Provincial from creating another Provincial in a different province
      if (session.user.role === "PROVINCIAL" && session.user.provinceId !== provinceId) {
        throw new ApiError(403, "Cannot invite PROVINCIAL outside your province");
      }
    } 
    
    else if (role === "AUDITOR") {
      if (!districtId) throw new ApiError(400, "districtId required for AUDITOR invites");
      const district = await prisma.district.findUnique({ where: { id: districtId } });
      if (!district) throw new ApiError(404, "District not found");
      // Prevent Provincial from inviting an Auditor to a district they don't oversee
      if (session.user.role === "PROVINCIAL" && district.provinceId !== session.user.provinceId) {
        throw new ApiError(403, "Cannot invite AUDITOR outside your province");
      }
    } 
    
    else if (role === "SUPERVISOR" || role === "ECD_USER") {
      if (!ecdCenterId) throw new ApiError(400, "ecdCenterId required for Center-based invites");
      const center = await prisma.ecdCenter.findUnique({
        where: { id: ecdCenterId },
        include: { district: true },
      });
      if (!center) throw new ApiError(404, "ECD center not found");
      
      // Enforce Supervisor scope
      if (session.user.role === "SUPERVISOR" && center.id !== session.user.ecdCenterId) {
        throw new ApiError(403, "Can only invite for your own center");
      }
      // Enforce Provincial scope
      if (session.user.role === "PROVINCIAL" && center.district.provinceId !== session.user.provinceId) {
        throw new ApiError(403, "Cannot invite for center outside your province");
      }
    }

    // 4. Generate Security Token and Expiration (7 days)
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // 5. Save to Database
    const invite = await prisma.invite.create({
      data: { 
        email: cleanEmail, 
        role, 
        provinceId, 
        districtId, 
        ecdCenterId, 
        token, 
        expiresAt 
      },
    });

    // 6. Return the invite object + a generated link for the UI to display/copy
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/signup?token=${token}`;
    
    return NextResponse.json({ ...invite, inviteLink }, { status: 201 });

  } catch (err) {
    return errorResponse(err);
  }
}

/**
 * GET /api/invites?token=xyz
 * Public endpoint used by the Signup page to verify the invite exists and is valid.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    if (!token) throw new ApiError(400, "Token is required");

    const invite = await prisma.invite.findUnique({ where: { token } });
    
    // Check if valid, unused, and not expired
    if (!invite || invite.used || invite.expiresAt < new Date()) {
      throw new ApiError(404, "Invite not found, already used, or expired");
    }

    return NextResponse.json(invite, { status: 200 });
  } catch (err) {
    return errorResponse(err);
  }
}

/**
 * PATCH /api/invites
 * Private endpoint called during user registration to "burn" the token.
 */
export async function PATCH(req: Request) {
  try {
    const { token } = await req.json();
    if (!token) throw new ApiError(400, "Token is required");

    const invite = await prisma.invite.update({
      where: { token },
      data: { used: true },
    });

    return NextResponse.json(invite, { status: 200 });
  } catch (err) {
    return errorResponse(err);
  }
}