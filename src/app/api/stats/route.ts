import { NextRequest, NextResponse } from "next/server";
import { generateStatsSvg } from "@/lib/stats-logic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const username = searchParams.get("username");
  const theme = searchParams.get("theme") || "default";
  const hideBorder = searchParams.get("hide_border") || "false";
  const countPrivate = searchParams.get("count_private") || "true";
  const gradeFormat = searchParams.get("grade_format") || "number"; // "number" or "letter"
  const scoreSize = searchParams.get("score_size") || "normal";
  const showTotalContributions = searchParams.get("show_total_contributions") || "false";
  const showStreak = searchParams.get("show_streak") || "false";
  const progressionBars = searchParams.get("progression_bars") || "false";

  // Customization options
  const titleColor = searchParams.get("title_color");
  const textColor = searchParams.get("text_color");
  const iconColor = searchParams.get("icon_color");
  const bgColor = searchParams.get("bg_color");
  const borderColor = searchParams.get("border_color");
  const borderRadius = searchParams.get("border_radius");
  const disableAnimations = searchParams.get("disable_animations") || "false";

  if (!username) {
    return new NextResponse("Username is required", { status: 400 });
  }

  try {
    const encodedUsername = encodeURIComponent(username);

    // 1. Fetch user data directly from GitHub API
    // Note: To avoid rate limits in production, you should ideally use a Personal Access Token
    // process.env.GITHUB_TOKEN
    const headers: Record<string, string> = {
      "Accept": "application/vnd.github.v3+json",
      "User-Agent": "GitHub-Stats-Generator",
    };
    if (process.env.GITHUB_TOKEN) {
      headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const userUrl = `https://api.github.com/users/${encodedUsername}`;
    const userRes = await fetch(userUrl, { headers });

    if (!userRes.ok) {
      return new NextResponse(`Failed to fetch user: ${userRes.statusText}`, { status: userRes.status });
    }

    const userData = await userRes.json();

    // Fetch repositories to calculate stars, commits, prs, issues, etc.
    // For simplicity, we'll fetch up to 100 recent repos. Real app might use GraphQL.
    let stars = 0;

    // Simplistic fetch for demo without graphql.
    // Usually, github-readme-stats uses GraphQL to get exact stats.
    const reposUrl = `https://api.github.com/users/${encodedUsername}/repos?per_page=100`;
    const reposRes = await fetch(reposUrl, { headers });
    if (reposRes.ok) {
      const repos = await reposRes.json();
      if (Array.isArray(repos)) {
        stars = repos.reduce((acc: number, repo: any) => acc + (repo.stargazers_count || 0), 0);
      }
    }

    // Since we are replacing the external API, we need an estimate or exact count for commits, prs, issues.
    // Let's use search API for exact numbers if possible
    let prs = 0;
    let issues = 0;
    let commits = 0;
    let contribs = 0;

    try {
      const issueSearchUrl = `https://api.github.com/search/issues?q=author:${encodedUsername}+type:issue`;
      const issueRes = await fetch(issueSearchUrl, { headers });
      if (issueRes.ok) {
        const issueData = await issueRes.json();
        issues = issueData.total_count || 0;
      }

      const prSearchUrl = `https://api.github.com/search/issues?q=author:${encodedUsername}+type:pr`;
      const prRes = await fetch(prSearchUrl, { headers });
      if (prRes.ok) {
        const prData = await prRes.json();
        prs = prData.total_count || 0;
      }

      // Estimate commits since search/commits requires preview header and is often rate-limited
      commits = 0; // Fallback or approximation
      contribs = 0; // Fallback
    } catch (e) {
      console.log("Error fetching advanced stats", e);
    }

    let totalContributions = 0;
    let currentStreak = 0;
    let longestStreak = 0;

    // Use streak api just for streaks and total contribs if requested, or always if we want total contribs
    try {
      const streakRes = await fetch(`https://github-readme-streak-stats.herokuapp.com/?user=${encodedUsername}`);
      if (streakRes.ok) {
        const streakSvg = await streakRes.text();
        const matches = streakSvg.match(/<text[^>]*>([\s\S]*?)<\/text>/g);
        if (matches) {
          const texts = matches.map(m => m.replace(/<[^>]+>/g, '').trim());
          const totalIndex = texts.findIndex(t => t === "Total Contributions");
          if (totalIndex !== -1 && totalIndex - 1 >= 0) {
            totalContributions = parseInt(texts[totalIndex - 1].replace(/,/g, '')) || 0;
            // Use this as fallback for commits/contribs if needed
            if (commits === 0) commits = totalContributions;
          }
          const currIndex = texts.findIndex(t => t === "Current Streak");
          if (currIndex !== -1 && currIndex + 2 < texts.length) {
            currentStreak = parseInt(texts[currIndex + 2].replace(/,/g, '')) || 0;
          }
          const longIndex = texts.findIndex(t => t === "Longest Streak");
          if (longIndex !== -1 && longIndex - 1 >= 0) {
            longestStreak = parseInt(texts[longIndex - 1].replace(/,/g, '')) || 0;
          }
        }
      }
    } catch (e) {
      console.error("Error fetching streak stats", e);
    }

    const publicRepos = userData.public_repos || 0;
    const followers = userData.followers || 0;
    const following = userData.following || 0;
    const publicGists = userData.public_gists || 0;

    const statsData = {
      name: userData.name || userData.login,
      public_repos: publicRepos,
      followers,
      following,
      public_gists: publicGists,
      totalContributions,
      currentStreak,
      longestStreak,
      stars,
      commits,
      prs,
      issues,
      contribs
    };

    const newSvg = generateStatsSvg(
      statsData,
      {
        theme,
        hideBorder,
        countPrivate,
        gradeFormat,
        scoreSize,
        showTotalContributions,
        showStreak,
        progressionBars,
        titleColor: titleColor || undefined,
        textColor: textColor || undefined,
        iconColor: iconColor || undefined,
        bgColor: bgColor || undefined,
        borderColor: borderColor || undefined,
        borderRadius: borderRadius || undefined,
        disableAnimations
      }
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
