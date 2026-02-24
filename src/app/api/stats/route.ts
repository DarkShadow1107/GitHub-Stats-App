
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const username = searchParams.get("username");
  const theme = searchParams.get("theme") || "default";
  const hideBorder = searchParams.get("hide_border") || "false";
  const countPrivate = searchParams.get("count_private") || "true";

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

    // 2. Fetch user profile for public_repos count
    const userUrl = `https://api.github.com/users/${username}`;
    const userRes = await fetch(userUrl);
    let publicRepos = 0;
    if (userRes.ok) {
      const userData = await userRes.json();
      publicRepos = userData.public_repos || 0;
    }

    // 3. Parse SVG content
    const extractStat = (id: string) => {
      const match = svgContent.match(new RegExp(`data-testid="${id}"[^>]*>([^<]*)<`));
      return match ? match[1] : "0";
    };

    const stars = extractStat("stars");
    const commits = extractStat("commits");
    const prs = extractStat("prs");
    const issues = extractStat("issues");
    const contribs = extractStat("contribs");

    const rankMatch = svgContent.match(/class="rank-text"[^>]*>\s*<text[^>]*>\s*([^<]+)\s*<\/text>/);
    const rank = rankMatch ? rankMatch[1].trim() : "C";

    // 4. Calculate Rank Circle Offset
    const rankMap: Record<string, number> = {
      "S": 100,
      "A+": 95,
      "A": 90,
      "A-": 85,
      "B+": 80,
      "B": 75,
      "B-": 70,
      "C+": 65,
      "C": 60,
    };
    const percentage = rankMap[rank] || 50;
    const circumference = 250;
    const offset = circumference - (circumference * percentage) / 100;

    // 5. Construct new SVG
    const styleMatch = svgContent.match(/<style>([\s\S]*?)<\/style>/);
    let style = styleMatch ? styleMatch[1] : "";

    // Modify the animation in style for the rank circle
    // Append the new animation to override the previous one
    style += `
      @keyframes rankAnimation {
        from { stroke-dashoffset: ${circumference}; }
        to { stroke-dashoffset: ${offset}; }
      }
    `;

    // Height: Original 195. We add 25 -> 220.
    const height = 220;
    const width = 495;

    // Extract icon paths
    // The regex matches <path ... d="..." ...>
    // We assume the order is: Stars, Commits, PRs, Issues, Contribs
    const iconPathMatches = svgContent.match(/<path[^>]*d="([^"]+)"/g);
    const iconPaths = iconPathMatches ? iconPathMatches.map(p => {
        const m = p.match(/d="([^"]+)"/);
        return m ? m[1] : "";
    }) : [];

    // Helper to create an item
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

    // Repo icon (Octicon 'repo')
    const repoIconPath = "M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z";

    // Build items list
    // We'll insert Total Repos at the end for now, or maybe before "Contributed to"?
    // The image order: Stars, Commits, PRs, Issues, Contribs.
    // I'll put Total Repos after Issues and before Contribs, or at the end.
    // Let's put it at the end.

    const items = [
      { label: "Total Stars", value: stars, icon: iconPaths[0] },
      { label: "Total Commits", value: commits, icon: iconPaths[1] },
      { label: "Total PRs", value: prs, icon: iconPaths[2] },
      { label: "Total Issues", value: issues, icon: iconPaths[3] },
      { label: "Contributed to", value: contribs, icon: iconPaths[4] },
      { label: "Total Repos", value: publicRepos, icon: repoIconPath }
    ];

    let listContent = "";
    items.forEach((item, index) => {
        // Delay starts at 450ms and increments by 150ms
        const delay = 450 + index * 150;
        // Check if icon exists, fallback to repo icon if missing (e.g. if extraction failed)
        const icon = item.icon || repoIconPath;
        listContent += createItem(index, icon, item.label, item.value.toString(), delay);
    });

    // Extract Title
    const titleMatch = svgContent.match(/<text[^>]*class="header"[^>]*>([^<]*)<\/text>/);
    const title = titleMatch ? titleMatch[1] : "My GitHub Statistics";

    const newSvg = `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <style>${style}</style>
        <rect data-testid="card-bg" x="0.5" y="0.5" rx="4.5" height="99%" stroke="#E4E2E2" width="${width - 1}" fill="#1a1b27" stroke-opacity="0" />

        <g data-testid="card-title" transform="translate(25, 35)">
          <g transform="translate(0, 0)">
            <text x="0" y="0" class="header" data-testid="header">${title}</text>
          </g>
        </g>

        <g data-testid="main-card-body" transform="translate(0, 55)">
          <g data-testid="rank-circle" transform="translate(400, ${height / 2 - 35})">
            <circle class="rank-circle-rim" cx="-10" cy="8" r="40" />
            <circle class="rank-circle" cx="-10" cy="8" r="40" />
            <g class="rank-text">
              <text x="0" y="0" alignment-baseline="central" dominant-baseline="central" text-anchor="middle">${rank}</text>
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
