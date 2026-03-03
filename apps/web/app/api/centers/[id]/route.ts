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
