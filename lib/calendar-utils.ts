/**
 * Utilities for generating Google Calendar event URLs and handling Google Meet links.
 */

export function formatGoogleCalendarDate(date: Date | string): string {
  const d = new Date(date);
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export interface GoogleCalendarEventOptions {
  title: string;
  description?: string;
  location?: string;
  startDate: Date | string;
  durationMinutes: number;
}

/**
 * Builds a direct 1-click Google Calendar web template URL
 * so users can add the confirmed session to their Google Calendar.
 */
export function getGoogleCalendarUrl({
  title,
  description = "",
  location = "",
  startDate,
  durationMinutes,
}: GoogleCalendarEventOptions): string {
  const start = new Date(startDate);
  const end = new Date(start.getTime() + durationMinutes * 60_000);

  const startFormatted = formatGoogleCalendarDate(start);
  const endFormatted = formatGoogleCalendarDate(end);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${startFormatted}/${endFormatted}`,
  });

  if (description) {
    params.set("details", description);
  }

  if (location) {
    params.set("location", location);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
