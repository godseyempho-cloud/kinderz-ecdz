import { z } from "zod";

export const monthlyReportSchema = z.object({
  year: z.number().int(),
  month: z.number().int().min(1).max(12),
  days: z.number().int().default(22), // Days the center was open
  
  // Financial fields from the Supervisor's receipts
  salariesExpense: z.coerce.number().min(0),
  foodExpense: z.coerce.number().min(0),
  overheadsExpense: z.coerce.number().min(0),


  // Operational stats
  attendanceCount: z.number().int().min(0),
  childrenFunded: z.number().int().min(0),
  
  notes: z.string().optional(),
  status: z.enum(["DRAFT", "SUBMITTED"]).default("DRAFT"),
});