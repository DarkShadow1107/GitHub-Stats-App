
function parseStat(value: string): number {
  if (!value) return 0;
  const v = value.trim().toLowerCase();
  if (v.endsWith("k")) {
    return parseFloat(v.replace("k", "")) * 1000;
  }
  return parseFloat(v.replace(/,/g, ""));
}

function calculateRank(stats: { commits: number, stars: number, prs: number, issues: number, contribs: number, followers: number }): number {
  const score = (stats.commits * 0.1) + (stats.stars * 2) + (stats.prs * 0.5) + (stats.issues * 0.2) + (stats.contribs * 0.5) + (stats.followers * 0.5);
  const K = 833; // Tuned for "harsh" grading
  const rank = 100 * (1 - Math.exp(-score / K));
  return Math.min(100, Math.max(0, rank));
}

// Test cases
const cases = [
  { commits: 100, stars: 10, prs: 5, issues: 5, contribs: 0, followers: 10 },
  { commits: 1000, stars: 100, prs: 50, issues: 50, contribs: 10, followers: 50 },
  { commits: 5000, stars: 1000, prs: 200, issues: 100, contribs: 100, followers: 500 },
];

cases.forEach(c => {
  console.log(`Stats: ${JSON.stringify(c)} -> Score: ${calculateRank(c).toFixed(2)}`);
});
