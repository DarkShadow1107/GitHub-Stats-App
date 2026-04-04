import { NextRequest, NextResponse } from "next/server";
import { themesData } from "@/themes/themes";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const username = searchParams.get("username");
  const theme = searchParams.get("theme") || "default";
  const hideBorder = searchParams.get("hide_border") || "false";

  const titleColor = searchParams.get("title_color");
  const textColor = searchParams.get("text_color");
  const bgColor = searchParams.get("bg_color");
  const borderColor = searchParams.get("border_color");
  const borderRadius = searchParams.get("border_radius");
  const disableAnimations = searchParams.get("disable_animations") || "false";

  if (!username) {
    return new NextResponse("Username is required", { status: 400 });
  }

  const encodedUsername = encodeURIComponent(username);
  const headers: Record<string, string> = {
    "Accept": "application/vnd.github.v3+json",
    "User-Agent": "GitHub-Stats-Generator",
  };
  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const reposUrl = `https://api.github.com/users/${encodedUsername}/repos?per_page=100`;
    const reposRes = await fetch(reposUrl, { headers });

    if (!reposRes.ok) {
      return new NextResponse("Failed to fetch repositories", { status: reposRes.status });
    }

    const repos = await reposRes.json();
    const langCounts: Record<string, number> = {};

    for (const repo of repos) {
      if (repo.language && !repo.fork) {
        langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
      }
    }

    const sortedLangs = Object.entries(langCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const totalRepos = Object.values(langCounts).reduce((a, b) => a + b, 0);

    const themeData = themesData[theme] || themesData["default"];
    const finalBgColor = bgColor || themeData.bg_color;
    const finalPrimaryColor = titleColor || themeData.title_color;
    const finalTextColor = textColor || themeData.text_color;
    const borderOpacity = hideBorder === "true" ? 0 : 1;
    const finalBorderColor = borderColor || "#e4e2e2";
    const finalBorderRadius = borderRadius || "4.5";

    // SVG Generation for Top Languages
    const height = Math.max(150, 60 + (sortedLangs.length * 25));
    const width = 300;

    let itemsHtml = "";
    sortedLangs.forEach((lang, index) => {
      const percentage = ((lang[1] / totalRepos) * 100).toFixed(1);
      const delay = disableAnimations === "true" ? 0 : 450 + index * 150;
      const animationStyle = disableAnimations === "true" ? "" : `animation: fadeInAnimation 0.3s ease-in-out forwards; animation-delay: ${delay}ms; opacity: 0;`;
      itemsHtml += `
        <g transform="translate(0, ${index * 25})" style="${animationStyle}">
          <text x="25" y="15" style="font: 600 13px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${finalTextColor};">${lang[0]}</text>
          <text x="200" y="15" style="font: 400 13px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${finalTextColor};">${percentage}%</text>
          <rect x="25" y="20" width="${parseFloat(percentage) * 1.5}" height="5" fill="${finalPrimaryColor}" rx="2" />
        </g>
      `;
    });

    const titleAnimation = disableAnimations === "true" ? "" : "animation: fadeInAnimation 0.8s ease-in-out forwards;";

    const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <style>
        @keyframes fadeInAnimation { from { opacity: 0; } to { opacity: 1; } }
      </style>
      <rect x="0.5" y="0.5" rx="${finalBorderRadius}" width="${width - 1}" height="${height - 1}" fill="${finalBgColor}" stroke="${finalBorderColor}" stroke-opacity="${borderOpacity}"/>
      <text x="25" y="35" style="font: 600 18px 'Segoe UI', Ubuntu, Sans-Serif; fill: ${finalPrimaryColor}; ${titleAnimation}">Most Used Languages</text>
      <g transform="translate(0, 55)">
        ${itemsHtml}
      </g>
    </svg>`;

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "max-age=60, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse("Error generating top languages stats", { status: 500 });
  }
}
