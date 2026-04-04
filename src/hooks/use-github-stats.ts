export type Stats = {
  theme?: string;
  username?: string;
  countPrivate?: string;
  hideBorder?: string;
  gradeFormat?: string;
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
};

export const useGithubStats = (data: Stats) => {
  const {
    theme,
    username,
    countPrivate,
    hideBorder,
    gradeFormat,
    scoreSize,
    showTotalContributions,
    showStreak,
    progressionBars,
    titleColor,
    textColor,
    iconColor,
    bgColor,
    borderColor,
    borderRadius,
    disableAnimations
  } = data;

  const getQueryString = (params: Record<string, string | undefined>) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        query.append(key, value);
      }
    });
    return query.toString();
  };

  const statsParams = {
    username,
    theme,
    show_icons: "true",
    hide_border: hideBorder,
    count_private: countPrivate,
    grade_format: gradeFormat || "number",
    score_size: scoreSize || "normal",
    show_total_contributions: showTotalContributions || "false",
    show_streak: showStreak || "false",
    progression_bars: progressionBars || "false",
    title_color: titleColor,
    text_color: textColor,
    icon_color: iconColor,
    bg_color: bgColor,
    border_color: borderColor,
    border_radius: borderRadius,
    disable_animations: disableAnimations
  };

  const topLangsParams = {
    username,
    theme,
    show_icons: "true",
    hide_border: hideBorder,
    layout: "compact",
    langs_count: "10",
    title_color: titleColor,
    text_color: textColor,
    bg_color: bgColor,
    border_color: borderColor,
    border_radius: borderRadius,
    disable_animations: disableAnimations
  };

  const streakParams = {
    user: username,
    theme,
    hide_border: hideBorder,
    stroke: borderColor,
    background: bgColor,
    ring: titleColor,
    fire: iconColor,
    currStreakNum: textColor,
    sideNums: textColor,
    currStreakLabel: textColor,
    sideLabels: textColor,
    dates: textColor
  };

  const stats = `/api/stats?${getQueryString(statsParams)}`;
  const topLanguages = `/api/top-langs?${getQueryString(topLangsParams)}`;
  const streak = `https://github-readme-streak-stats.herokuapp.com/?${getQueryString(streakParams)}`;

  return { stats, topLanguages, streak };
};
