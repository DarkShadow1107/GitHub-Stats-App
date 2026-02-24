
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const username = searchParams.get("username");
  const theme = searchParams.get("theme") || "default";
  const hideBorder = searchParams.get("hide_border") || "false";
  const countPrivate = searchParams.get("count_private") || "true";
  const gradeFormat = searchParams.get("grade_format") || "number"; // "number" or "letter"

  if (!username) {
    return new NextResponse("Username is required", { status: 400 });
  }

  try {
    // 1. Fetch the base stats SVG from the external mirror
    const statsUrl = `https://github-readme-stats-eight-theta.vercel.app/api?username=${username}&theme=${theme}&show_icons=true&hide_border=${hideBorder}&count_private=${countPrivate}`;
    const statsRes = await fetch(statsUrl);
    if (!statsRes.ok) {
      return new NextResponse("Failed to fetch stats", { status: statsRes.status });
    }
    const svgContent = await statsRes.text();

    // 2. Fetch user profile for public_repos and followers count
    const userUrl = `https://api.github.com/users/${username}`;
    const userRes = await fetch(userUrl);
    let publicRepos = 0;
    let followers = 0;
    if (userRes.ok) {
      const userData = await userRes.json();
      publicRepos = userData.public_repos || 0;
      followers = userData.followers || 0;
    }

    // 3. Parse SVG content
    const extractStat = (id: string) => {
      const match = svgContent.match(new RegExp(`data-testid="${id}"[^>]*>([^<]*)<`));
      return match ? match[1] : "0";
    };

    const starsStr = extractStat("stars");
    const commitsStr = extractStat("commits");
    const prsStr = extractStat("prs");
    const issuesStr = extractStat("issues");
    const contribsStr = extractStat("contribs");

    // Helper to parse "1k" etc.
    const parseStat = (value: string): number => {
      if (!value) return 0;
      const v = value.trim().toLowerCase();
      if (v.endsWith("k")) {
        return parseFloat(v.replace("k", "")) * 1000;
      }
      return parseFloat(v.replace(/,/g, ""));
    };

    const stars = parseStat(starsStr);
    const commits = parseStat(commitsStr);
    const prs = parseStat(prsStr);
    const issues = parseStat(issuesStr);
    const contribs = parseStat(contribsStr);

    // 4. Calculate Harsh Grade
    // Formula: Score = weighted sum.
    // Harsh mapping: 100 * (1 - e^(-score / K)) with K=500
    const score = (commits * 0.1) + (stars * 2) + (prs * 0.5) + (issues * 0.2) + (contribs * 0.5) + (followers * 0.5);
    const K = 500;
    const rawRank = 100 * (1 - Math.exp(-score / K));
    const calculatedScore = Math.min(100, Math.max(0, rawRank));

    let displayRank = "";
    if (gradeFormat === "letter") {
      if (calculatedScore >= 95) displayRank = "S";
      else if (calculatedScore >= 90) displayRank = "A+";
      else if (calculatedScore >= 80) displayRank = "A";
      else if (calculatedScore >= 70) displayRank = "B+";
      else if (calculatedScore >= 60) displayRank = "B";
      else if (calculatedScore >= 50) displayRank = "C+";
      else if (calculatedScore >= 40) displayRank = "C";
      else if (calculatedScore >= 30) displayRank = "D+";
      else if (calculatedScore >= 20) displayRank = "D";
      else displayRank = "F";
    } else {
      displayRank = calculatedScore.toFixed(2);
    }

    // 5. Calculate Rank Circle Offset
    // For number grade, we map 0-100 directly.
    // For letter grade, we map back to percentage.
    // Actually, calculatedScore IS the percentage (0-100).
    const percentage = calculatedScore;
    const circumference = 250;
    const offset = circumference - (circumference * percentage) / 100;

    // 6. Construct new SVG
    const styleMatch = svgContent.match(/<style>([\s\S]*?)<\/style>/);
    let style = styleMatch ? styleMatch[1] : "";

    // Extract background color
    const bgMatch = svgContent.match(/<rect data-testid="card-bg"[^>]*fill="([^"]+)"/);
    const bgColor = bgMatch ? bgMatch[1] : "#fff";

    style += `
      @keyframes rankAnimation {
        from { stroke-dashoffset: ${circumference}; }
        to { stroke-dashoffset: ${offset}; }
      }
    `;

    // Extract icon paths
    const iconPathMatches = svgContent.match(/<path[^>]*d="([^"]+)"/g);
    const iconPaths = iconPathMatches ? iconPathMatches.map(p => {
        const m = p.match(/d="([^"]+)"/);
        return m ? m[1] : "";
    }) : [];

    // Icons
    // 0: stars, 1: commits, 2: prs, 3: issues, 4: contribs
    const repoIconPath = "M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z";
    const followersIconPath = "M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10Z";

    const items = [
      { label: "Total Stars", value: starsStr, icon: iconPaths[0] },
      { label: "Total Commits", value: commitsStr, icon: iconPaths[1] },
      { label: "Total PRs", value: prsStr, icon: iconPaths[2] },
      { label: "Total Issues", value: issuesStr, icon: iconPaths[3] },
      { label: "Contributed to", value: contribsStr, icon: iconPaths[4] },
      { label: "Total Repos", value: publicRepos, icon: repoIconPath },
      { label: "Followers", value: followers, icon: followersIconPath }
    ];

    // Calculate height based on number of items
    // Original was 195 for 5 items.
    // Each item is 25px.
    // Padding top 55 (header + title).
    // Padding bottom ~20.
    // 5 items * 25 = 125. 55 + 125 + 15 = 195.
    // 7 items * 25 = 175. 55 + 175 + 15 = 245.
    const height = 55 + (items.length * 25) + 15;
    const width = 495;

    const createItem = (index: number, iconPath: string, label: string, value: string, delay: number) => `
      <g transform="translate(0, ${index * 25})">
        <g class="stagger" style="animation-delay: ${delay}ms" transform="translate(25, 0)">
          <svg class="icon" viewBox="0 0 16 16" version="1.1" width="16" height="16">
            <path fill-rule="evenodd" d="${iconPath}" />
          </svg>
          <text class="stat bold" x="25" y="12.5">${label}:</text>
          <text class="stat" x="200" y="12.5">${value}</text>
        </g>
      </g>
    `;

    let listContent = "";
    items.forEach((item, index) => {
        const delay = 450 + index * 150;
        const icon = item.icon || repoIconPath;
        listContent += createItem(index, icon, item.label, item.value.toString(), delay);
    });

    // Extract Title
    const titleMatch = svgContent.match(/<text[^>]*class="header"[^>]*>([^<]*)<\/text>/);
    const title = titleMatch ? titleMatch[1] : "My GitHub Statistics";

    // Adjust Rank Circle Position if needed
    // Centered vertically relative to the list?
    // height / 2 - 35
    const rankCircleY = height / 2 - 35;

    // Adjust font size for number grade if it's long (e.g. 100.00)
    // Actually 100.00 is 6 chars. rank-text might need adjustment.
    // The default font-size for rank is usually large.
    // If number, maybe smaller?
    const rankFontSize = gradeFormat === "number" ? "24px" : "40px"; // Default is likely big
    // But I can't easily change the class definition unless I inject more CSS.
    // Let's modify the style for .rank-text text.

    style += `
      .rank-text { font-size: ${rankFontSize}; }
    `;

    const newSvg = `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>${style}</style>
        <rect data-testid="card-bg" x="0.5" y="0.5" rx="4.5" height="99%" stroke="#E4E2E2" width="${width - 1}" fill="${bgColor}" stroke-opacity="0" />

        <g data-testid="card-title" transform="translate(25, 35)">
          <g transform="translate(0, 0)">
            <text x="0" y="0" class="header" data-testid="header">${title}</text>
          </g>
        </g>

        <g data-testid="main-card-body" transform="translate(0, 55)">
          <g data-testid="rank-circle" transform="translate(400, ${rankCircleY})">
            <circle class="rank-circle-rim" cx="-10" cy="8" r="40" />
            <circle class="rank-circle" cx="-10" cy="8" r="40" />
            <g class="rank-text">
              <text x="-10" y="8" alignment-baseline="central" dominant-baseline="central" text-anchor="middle" class="stat">${displayRank}</text>
            </g>
          </g>

          <svg x="0" y="0">
            ${listContent}
          </svg>
        </g>
      </svg>
    `;

    return new NextResponse(newSvg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "max-age=60, s-maxage=60, stale-while-revalidate=120",
      },
    });

  } catch (error) {
    console.error(error);
    return new NextResponse("Error generating stats", { status: 500 });
  }
}
