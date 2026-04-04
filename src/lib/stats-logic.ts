
import { themesData } from "@/themes/themes";

export function generateStatsSvg(
  userData: {
    name: string;
    public_repos: number;
    followers: number;
    following: number;
    public_gists: number;
    totalContributions?: number;
    currentStreak?: number;
    longestStreak?: number;
    stars: number;
    commits: number;
    prs: number;
    issues: number;
    contribs: number;
  },
  options: {
    theme: string;
    hideBorder: string;
    countPrivate: string;
    gradeFormat: string;
    scoreSize?: string;
    showTotalContributions?: string;
    showStreak?: string;
    progressionBars?: string;
    titleColor?: string;
    textColor?: string;
    iconColor?: string;
    bgColor?: string;
    borderColor?: string;
    borderRadius?: string;
    disableAnimations?: string;
  }
): string {
  const { gradeFormat, scoreSize, showTotalContributions, showStreak, progressionBars, hideBorder } = options;

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

  const {
    name,
    stars,
    commits,
    prs,
    issues,
    contribs,
    public_repos: publicRepos,
    followers,
    following,
    public_gists: publicGists,
    totalContributions,
    currentStreak,
    longestStreak
  } = userData;

  // 2. Calculate Harsh Grade
  // Formula: Score = weighted sum.
  // Harsh mapping: 100 * (1 - e^(-score / K)) with K=500
  const score = (commits * 0.1) + (stars * 2) + (prs * 0.5) + (issues * 0.2) + (contribs * 0.5) + (followers * 0.5);
  const K = 500;
  const rawRank = 100 * (1 - Math.exp(-score / K));
  const calculatedScore = Math.min(100, Math.max(0, rawRank));

  // S (top 1%), A+ (12.5%), A (25%), A- (37.5%), B+ (50%), B (62.5%), B- (75%), C+ (87.5%), C (everyone)
  let displayRank = "";
  if (gradeFormat === "letter") {
    if (calculatedScore >= 99) displayRank = "S";
    else if (calculatedScore >= 87.5) displayRank = "A+";
    else if (calculatedScore >= 75) displayRank = "A";
    else if (calculatedScore >= 62.5) displayRank = "A-";
    else if (calculatedScore >= 50) displayRank = "B+";
    else if (calculatedScore >= 37.5) displayRank = "B";
    else if (calculatedScore >= 25) displayRank = "B-";
    else if (calculatedScore >= 12.5) displayRank = "C+";
    else displayRank = "C";
  } else {
    displayRank = calculatedScore.toFixed(2).toString();
  }

  // 3. Calculate Rank Circle Offset
  // 3. Calculate Rank Circle Size and Offset
  const circleRadius = scoreSize === "large" ? 48 : 40;
  const circumference = 2 * Math.PI * circleRadius;
  const percentage = 100 - calculatedScore; // User request: "circle around rank shows `100 - global percentile`"
  const offset = circumference - (circumference * percentage) / 100;

  // 4. Construct new SVG
  const themeData = themesData[options.theme] || themesData["default"];
  const finalBgColor = options.bgColor || themeData.bg_color;
  const finalPrimaryColor = options.titleColor || themeData.title_color;
  const finalTextColor = options.textColor || themeData.text_color;
  const finalIconColor = options.iconColor || themeData.icon_color;
  const finalBorderColor = options.borderColor || "#E4E2E2";
  const finalBorderRadius = options.borderRadius || "4.5";
  const disableAnim = options.disableAnimations === "true";

  let style = `
    .header { font: 600 18px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${finalPrimaryColor}; ${disableAnim ? "" : "animation: fadeInAnimation 0.8s ease-in-out forwards;"} }
    .stat { font: 600 14px 'Segoe UI', Ubuntu, "Helvetica Neue", Sans-Serif; fill: ${finalTextColor}; }
    .stagger { ${disableAnim ? "opacity: 1;" : "opacity: 0; animation: fadeInAnimation 0.3s ease-in-out forwards;"} }
    .icon { fill: ${finalIconColor}; display: block; }
    ${disableAnim ? "" : "@keyframes fadeInAnimation { from { opacity: 0; } to { opacity: 1; } }"}
    ${disableAnim ? "" : `@keyframes customRankAnimation {
      from { stroke-dashoffset: ${circumference}; }
      to { stroke-dashoffset: ${offset}; }
    }`}
  `;

  style += `
    .custom-rank-circle-rim {
      stroke: ${finalPrimaryColor};
      opacity: 0.2;
      stroke-width: ${scoreSize === "large" ? 8 : 6};
      fill: none;
    }
    .custom-rank-circle {
      stroke: ${finalPrimaryColor};
      stroke-width: ${scoreSize === "large" ? 8 : 6};
      stroke-dasharray: ${circumference};
      ${disableAnim ? `stroke-dashoffset: ${offset};` : ""}
      fill: none;
      stroke-linecap: round;
      opacity: 0.8;
      transform-origin: 0 0;
      transform: rotate(-90deg);
      ${disableAnim ? "" : "animation: customRankAnimation 1s forwards ease-in-out;"}
    }
    .progression-bar-bg {
      fill: ${finalPrimaryColor};
      opacity: 0.2;
      rx: 4;
    }
    .progression-bar {
      fill: ${finalPrimaryColor};
      opacity: 0.8;
      rx: 4;
      ${disableAnim ? "" : "animation: fadeInAnimation 0.8s ease-in-out forwards;"}
    }
  `;

  // Icons
  const starsIconPath = "M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z";
  const commitsIconPath = "M10.5 7.75a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zm1.43.75a4.002 4.002 0 01-7.86 0H.75a.75.75 0 110-1.5h3.32a4.001 4.001 0 017.86 0h3.32a.75.75 0 110 1.5h-3.32z";
  const prsIconPath = "M7.177 3.073L9.573.677A.25.25 0 0110 .854v4.792a.25.25 0 01-.427.177L7.177 3.427a.25.25 0 010-.354zM3.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122v5.256a2.25 2.25 0 11-1.5 0V5.372A2.25 2.25 0 011.5 3.25zM11 2.5h-1V4h1a1 1 0 011 1v5.628a2.25 2.25 0 101.5 0V5A2.5 2.5 0 0011 2.5zm1 10.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM3.75 12a.75.75 0 100 1.5.75.75 0 000-1.5z";
  const issuesIconPath = "M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM0 8a8 8 0 1116 0A8 8 0 010 8zm9 3a1 1 0 11-2 0 1 1 0 012 0zm-.25-6.25a.75.75 0 00-1.5 0v3.5a.75.75 0 001.5 0v-3.5z";
  const contribsIconPath = "M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z";
  const repoIconPath = contribsIconPath;
  const followersIconPath = "M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10Z";
  const followingIconPath = "M10.5 5.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM4.5 13.5v-1a2.5 2.5 0 0 1 5 0v1h-5Zm9.75-5.5h-2.5a.75.75 0 0 0 0 1.5h2.5a.75.75 0 0 0 0-1.5Z";
  const gistIconPath = "M2.75 1.5a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25V4.664a.25.25 0 0 0-.073-.177l-2.914-2.914a.25.25 0 0 0-.177-.073H2.75ZM1 1.75C1 .784 1.784 0 2.75 0h7.429c.199 0 .39.079.53.22l2.914 2.914c.141.14.22.331.22.53v10.586A1.75 1.75 0 0 1 12.086 16H2.75A1.75 1.75 0 0 1 1 14.25V1.75Z";

  const repoLabel = options.countPrivate === "true" ? "Total Repos" : "Public Repos";

  const fireIconPath = "M8.032.228A.75.75 0 0 1 8.874.5c1.865 2.148 2.505 3.518 2.505 4.966 0 1.258-.595 2.593-1.42 3.42a1 1 0 0 0 .707 1.707c1.782 0 3.334-1.353 3.334-3.327 0-.54-.265-1.077-.427-1.4a.75.75 0 0 1 .494-1.036c1.603-.541 3.23 0 3.23 2.155 0 3.323-2.613 5.485-5.918 5.485-3.304 0-5.918-2.162-5.918-5.485 0-2.316.89-4.246 2.38-5.836A.75.75 0 0 1 8.032.228Z";

  let items = [
    { label: "Total Stars", value: stars.toString(), icon: starsIconPath, numericValue: stars },
    { label: "Total Commits", value: commits.toString(), icon: commitsIconPath, numericValue: commits },
    { label: "Total PRs", value: prs.toString(), icon: prsIconPath, numericValue: prs },
    { label: "Total Issues", value: issues.toString(), icon: issuesIconPath, numericValue: issues },
    { label: "Contributed to", value: contribs.toString(), icon: contribsIconPath, numericValue: contribs },
    { label: repoLabel, value: publicRepos, icon: repoIconPath, numericValue: publicRepos },
    { label: "Following", value: following, icon: followingIconPath, numericValue: following },
    { label: "Public Gists", value: publicGists, icon: gistIconPath, numericValue: publicGists },
    { label: "Followers", value: followers, icon: followersIconPath, numericValue: followers }
  ];

  if (showTotalContributions === "true" && totalContributions !== undefined) {
    items.splice(1, 0, { label: "Total Contributions", value: totalContributions.toString(), icon: commitsIconPath, numericValue: totalContributions });
  }

  if (showStreak === "true" && currentStreak !== undefined && longestStreak !== undefined) {
    items.push({ label: "Current Streak", value: currentStreak.toString(), icon: fireIconPath, numericValue: currentStreak });
    items.push({ label: "Longest Streak", value: longestStreak.toString(), icon: fireIconPath, numericValue: longestStreak });
  }

  const rowHeight = progressionBars === "true" ? 35 : 25;

  // Calculate height based on number of items
  const height = 55 + (items.length * rowHeight) + 15;
  const width = scoreSize === "large" ? 540 : 495;

  const maxStatValue = Math.max(...items.map(item => item.numericValue || 0));

  const createItem = (index: number, iconPath: string, label: string, value: string, delay: number, numericValue: number) => {
    return `
      <g transform="translate(0, ${index * rowHeight})">
        <g class="stagger" style="animation-delay: ${delay}ms" transform="translate(25, 0)">
          <svg class="icon" viewBox="0 0 16 16" version="1.1" width="16" height="16">
            <path fill-rule="evenodd" d="${iconPath}" />
          </svg>
          <text class="stat bold" x="25" y="12.5">${label}:</text>
          <text class="stat" x="180" y="12.5">${escapeXml(value)}</text>
        </g>
      </g>
    `;
  };

  let listContent = "";
  items.forEach((item, index) => {
      const delay = disableAnim ? 0 : 450 + index * 150;
      const icon = item.icon || repoIconPath;
      listContent += createItem(index, icon, item.label, item.value.toString(), delay, item.numericValue || 0);
  });

  // Extract Title
  const title = `${name}'s GitHub Stats`;

  // Adjust Rank Circle Position
  const rankCircleY = (items.length * 25) / 2;

  // Adjust font size for number grade
  // The user requested smaller score text font or bigger score circle. We'll make the font smaller to avoid overlaps.
  let rankFontSize = gradeFormat === "number" ? 28 : 34;
  if (scoreSize === "large") {
    // Keep font size same or slightly smaller, circle is larger so it looks bigger
    rankFontSize = gradeFormat === "number" ? 30 : 36;
  }

  style += `
    .custom-rank-text { font-size: ${rankFontSize}px; }
    .custom-rank-score-text { font-size: ${rankFontSize}px; fill: ${finalPrimaryColor}; font-family: 'Segoe UI', Ubuntu, "Helvetica Neue", Sans-Serif; font-weight: bold; }
  `;

  const borderOpacity = hideBorder === "true" ? 0 : 1;

  const newSvg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>${style}</style>
      <rect data-testid="card-bg" x="0.5" y="0.5" rx="${finalBorderRadius}" height="${height - 1}" stroke="${finalBorderColor}" width="${width - 1}" fill="${finalBgColor}" stroke-opacity="${borderOpacity}" />

      <g data-testid="card-title" transform="translate(25, 35)">
        <g transform="translate(0, 0)">
          <text x="0" y="0" class="header" data-testid="header">${escapeXml(title)}</text>
        </g>
      </g>

      <g data-testid="main-card-body" transform="translate(0, 55)">
        <g data-testid="rank-circle" transform="translate(${scoreSize === "large" ? 470 : 430}, ${rankCircleY})">
          ${progressionBars === "true" ? `
          <g class="custom-rank-text">
            <text x="0" y="-10" alignment-baseline="central" dominant-baseline="central" text-anchor="middle" class="custom-rank-score-text">${escapeXml(displayRank)}</text>
          </g>
          <g transform="translate(-40, 15)">
            <rect class="progression-bar-bg" x="0" y="0" width="80" height="8" />
            <rect class="progression-bar" x="0" y="0" width="${(calculatedScore / 100) * 80}" height="8" style="${disableAnim ? "" : "animation-delay: 1000ms"}" />
          </g>
          ` : `
          <circle class="custom-rank-circle-rim" cx="0" cy="0" r="${circleRadius}" />
          <circle class="custom-rank-circle" cx="0" cy="0" r="${circleRadius}" />
          <g class="custom-rank-text">
            <text x="0" y="0" alignment-baseline="central" dominant-baseline="central" text-anchor="middle" class="custom-rank-score-text">${escapeXml(displayRank)}</text>
          </g>
          `}
        </g>

        <svg x="0" y="0">
          ${listContent}
        </svg>
      </g>
    </svg>
  `;

  return newSvg;
}
