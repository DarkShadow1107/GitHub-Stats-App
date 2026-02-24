export type Stats = {
  theme?: string;
  username?: string;
  countPrivate?: string;
  hideBorder?: string;
  gradeFormat?: string;
};

export const useGithubStats = (data: Stats) => {
  const { theme, username, countPrivate, hideBorder, gradeFormat } = data;

  const stats = `/api/stats?username=${username}&theme=${theme}&show_icons=true&hide_border=${hideBorder}&count_private=${countPrivate}&grade_format=${gradeFormat || "number"}`;

  const topLanguages = `https://github-readme-stats-eight-theta.vercel.app/api/top-langs/?username=${username}&theme=${theme}&show_icons=true&hide_border=${hideBorder}&layout=compact&langs_count=10`;

  const streak = `https://github-readme-streak-stats.herokuapp.com/?user=${username}&theme=${theme}&hide_border=${hideBorder}`;

  return { stats, topLanguages, streak };
};
