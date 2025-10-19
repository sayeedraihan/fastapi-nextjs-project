/**
 * Converts a UTC datetime string into a locally formatted string.
 * @param utcDateString The ISO 8601 UTC datetime string from the API.
 * @returns A string formatted to the user's local time and locale (e.g., "10/19/2025, 6:30:00 PM")
 */
const formatUtcToLocal = (utcDateString: string | null | undefined): string => {
  if (!utcDateString) {
    return "N/A";
  }
  try {
    const date = new Date(utcDateString);
    // toLocaleString() automatically uses the user's browser settings
    // for timezone and locale.
    return date.toLocaleString(); 
  } catch (error) {
    console.error("Failed to format date:", utcDateString, error);
    return "Invalid Date";
  }
};

export { formatUtcToLocal }