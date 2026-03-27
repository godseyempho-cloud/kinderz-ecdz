/**
 * Maps a fiscal quarter number to its constituent months.
 * Fiscal Year Start: April 1st (Q1: Apr-Jun)
 */
export function getMonthsForQuarter(quarter: number): number[] {
  switch (quarter) {
    case 1: return [4, 5, 6];    // Apr, May, Jun
    case 2: return [7, 8, 9];    // Jul, Aug, Sep
    case 3: return [10, 11, 12]; // Oct, Nov, Dec
    case 4: return [1, 2, 3];    // Jan, Feb, Mar (Next calendar year)
    default: return [];
  }
}

/**
 * Returns a short string name for a month number (1-12).
 */
export function getMonthName(monthNum: number): string {
  const date = new Date();
  // monthNum is 1-based, Date constructor expects 0-based
  date.setMonth(monthNum - 1); 
  return date.toLocaleString('en-US', { month: 'short' });
}

/**
 * Determines the correct calendar year for a specific month 
 * based on the Fiscal Year and Quarter.
 */
export function getCalendarYearForMonth(fiscalYear: number, quarter: number): number {
  // If it's Q4 (Jan-Mar), the calendar year is Fiscal Year + 1
  return quarter === 4 ? fiscalYear + 1 : fiscalYear;
}