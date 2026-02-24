
import { NextRequest, NextResponse } from "next/server";
import { generateStatsSvg } from "@/lib/stats-logic";

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

    const newSvg = generateStatsSvg(
      svgContent,
      { public_repos: publicRepos, followers: followers },
      { theme, hideBorder, countPrivate, gradeFormat }
    );

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
