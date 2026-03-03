
export function generateStatsSvg(
  svgContent: string,
  userData: { public_repos: number; followers: number; following: number; public_gists: number },
  options: {
    theme: string;
    hideBorder: string;
    countPrivate: string;
    gradeFormat: string;
  }
): string {
  const { gradeFormat } = options;

  // Simple XML escaping function
  const escapeXml = (unsafe: string): string => {
    return unsafe.replace(/[<>&"']/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '"': return '&quot;';
        case '\'': return '&apos;';
        default: return c;
      }
    });
  };

  // 1. Parse SVG content
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
  const { public_repos: publicRepos, followers, following, public_gists: publicGists } = userData;

  // 2. Calculate Harsh Grade
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
    displayRank = calculatedScore.toFixed(2).toString();
  }

  // 3. Calculate Rank Circle Offset
  const percentage = calculatedScore;
  const circumference = 251.327;
  const offset = circumference - (circumference * percentage) / 100;

  // 4. Construct new SVG
  const styleMatch = svgContent.match(/<style>([\s\S]*?)<\/style>/);
  let style = styleMatch ? styleMatch[1] : "";

  // Extract background color
  const rectMatch = svgContent.match(/<rect[^>]*data-testid="card-bg"[^>]*>/);
  let bgColor = "#fff";
  if (rectMatch) {
    const bgFillMatch = rectMatch[0].match(/fill="([^"]+)"/);
    if (bgFillMatch) {
      bgColor = bgFillMatch[1];
    }
  }

  // Extract primary color from .header or use default
  const headerColorMatch = style.match(/\.header\s*{[^}]*fill:\s*([^;}]*)/);
  const primaryColor = headerColorMatch ? headerColorMatch[1].trim() : "#2f80ed";

  style += `
    @keyframes customRankAnimation {
      from { stroke-dashoffset: ${circumference}; }
      to { stroke-dashoffset: ${offset}; }
    }
  `;

  style += `
    .custom-rank-circle-rim {
      stroke: ${primaryColor};
      opacity: 0.2;
      stroke-width: 6;
      fill: none;
    }
    .custom-rank-circle {
      stroke: ${primaryColor};
      stroke-width: 6;
      stroke-dasharray: ${circumference};
      fill: none;
      stroke-linecap: round;
      opacity: 0.8;
      transform-origin: 0 0;
      transform: rotate(-90deg);
      animation: customRankAnimation 1s forwards ease-in-out;
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
  const followingIconPath = "M10.5 5.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM4.5 13.5v-1a2.5 2.5 0 0 1 5 0v1h-5Zm9.75-5.5h-2.5a.75.75 0 0 0 0 1.5h2.5a.75.75 0 0 0 0-1.5Z";
  const gistIconPath = "M2.75 1.5a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25V4.664a.25.25 0 0 0-.073-.177l-2.914-2.914a.25.25 0 0 0-.177-.073H2.75ZM1 1.75C1 .784 1.784 0 2.75 0h7.429c.199 0 .39.079.53.22l2.914 2.914c.141.14.22.331.22.53v10.586A1.75 1.75 0 0 1 12.086 16H2.75A1.75 1.75 0 0 1 1 14.25V1.75Z";

  const repoLabel = options.countPrivate === "true" ? "Total Repos" : "Public Repos";

  const items = [
    { label: "Total Stars", value: starsStr, icon: iconPaths[0] },
    { label: "Total Commits", value: commitsStr, icon: iconPaths[1] },
    { label: "Total PRs", value: prsStr, icon: iconPaths[2] },
    { label: "Total Issues", value: issuesStr, icon: iconPaths[3] },
    { label: "Contributed to", value: contribsStr, icon: iconPaths[4] },
    { label: repoLabel, value: publicRepos, icon: repoIconPath },
    { label: "Following", value: following, icon: followingIconPath },
    { label: "Public Gists", value: publicGists, icon: gistIconPath },
    { label: "Followers", value: followers, icon: followersIconPath }
  ];

  // Calculate height based on number of items
  const height = 55 + (items.length * 25) + 15;
  const width = 495;

  const createItem = (index: number, iconPath: string, label: string, value: string, delay: number) => `
    <g transform="translate(0, ${index * 25})">
      <g class="stagger" style="animation-delay: ${delay}ms" transform="translate(25, 0)">
        <svg class="icon" viewBox="0 0 16 16" version="1.1" width="16" height="16">
          <path fill-rule="evenodd" d="${iconPath}" />
        </svg>
        <text class="stat bold" x="25" y="12.5">${label}:</text>
        <text class="stat" x="200" y="12.5">${escapeXml(value)}</text>
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

  // Adjust Rank Circle Position
  const rankCircleY = (items.length * 25) / 2;

  // Adjust font size for number grade
  const rankFontSize = gradeFormat === "number" ? "34.4px" : "38.25px";

  style += `
    .custom-rank-text { font-size: ${rankFontSize}; }
    .custom-rank-score-text { font-size: ${rankFontSize}; fill: ${primaryColor}; font-family: 'Segoe UI', Ubuntu, "Helvetica Neue", Sans-Serif; font-weight: bold; }
  `;

  const newSvg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>${style}</style>
      <rect data-testid="card-bg" x="0.5" y="0.5" rx="4.5" height="99%" stroke="#E4E2E2" width="${width - 1}" fill="${bgColor}" stroke-opacity="0" />

      <g data-testid="card-title" transform="translate(25, 35)">
        <g transform="translate(0, 0)">
          <text x="0" y="0" class="header" data-testid="header">${escapeXml(title)}</text>
        </g>
      </g>

      <g data-testid="main-card-body" transform="translate(0, 55)">
        <g data-testid="rank-circle" transform="translate(430, ${rankCircleY})">
          <circle class="custom-rank-circle-rim" cx="0" cy="0" r="40" />
          <circle class="custom-rank-circle" cx="0" cy="0" r="40" />
          <g class="custom-rank-text">
            <text x="0" y="0" alignment-baseline="central" dominant-baseline="central" text-anchor="middle" class="custom-rank-score-text">${escapeXml(displayRank)}</text>
          </g>
        </g>

        <svg x="0" y="0">
          ${listContent}
        </svg>
      </g>
    </svg>
  `;

  return newSvg;
}
