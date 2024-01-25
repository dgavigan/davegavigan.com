// A helper to convert "Month Year" strings to a comparable value (like a timestamp)
function parseDateString(dateString: string): number {
  // eslint-disable-next-line unused-imports/no-unused-vars
  const [month, year] = dateString.split(' ');
  const monthIndex = new Date(dateString).getMonth() + 1; // getMonth() is zero-based
  const parsedDate = new Date(`${year}-${monthIndex}-01`).getTime();
  return parsedDate;
}

// The main function to sort job descriptions
export function sortJobsByEndDate(jobs: any[]): any[] {
  return jobs.sort((a, b) => {
    const dateA = parseDateString(a.frontmatter.endDate);
    const dateB = parseDateString(b.frontmatter.endDate);
    return dateB - dateA; // For descending order
  });
}
