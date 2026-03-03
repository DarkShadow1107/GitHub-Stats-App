# GitHub Stats Generator

A modern, fast, and customizable GitHub Stats Generator built with Next.js 14, Tailwind CSS, and Shadcn UI. Create stunning GitHub stats cards for your profile READMEs with ease.


## 📈 Grading System

The stats generator calculates a "harsh grade" score based on various contributions. The formula uses a weighted sum of different GitHub metrics to produce a raw score, which is then mapped to a percentage using an exponential curve.

### Metrics Weights:
- **Stars**: x2.0
- **Commits**: x0.1
- **PRs**: x0.5
- **Issues**: x0.2
- **Contributed to**: x0.5
- **Followers**: x0.5

The final score is mapped to a 0-100 scale using the formula: `100 * (1 - e^(-score / 500))`.

This score is rendered either as a Letter Grade (S, A+, A, B+, etc.) or a Numeric Percentage with 2 decimal places.

## 📊 Included Stats

The generated SVG card includes the following statistics:
- **Total Stars**: The number of stars your repositories have collected.
- **Total Commits**: Number of commits made (public, and optionally private).
- **Total PRs**: Pull requests created.
- **Total Issues**: Issues opened.
- **Contributed to**: Repositories you've contributed to that you don't own.
- **Total Repos / Public Repos**: Repository count (Dynamic label based on your private counting preference).
- **Following**: Number of users you follow.
- **Public Gists**: Number of public gists you've created.
- **Followers**: Number of users following you.

## 🔌 API Usage

The API is fully open and can be accessed via the `/api/stats` endpoint.

**Endpoint**: `GET /api/stats`

**Parameters**:
- `username` (required): Your GitHub username.
- `theme` (optional): Theme name for the card (e.g. `default`, `dark`, `radical`).
- `hide_border` (optional): Set to `true` to hide the card border.
- `count_private` (optional): Set to `true` to count private contributions and use the "Total Repos" label.
- `grade_format` (optional): Set to `number` to show percentage, or `letter` to show Letter grades.

### Example
```markdown
[![My GitHub Stats](https://my-domain.com/api/stats?username=torvalds&theme=radical&grade_format=number)](https://github.com/torvalds)
```

## 🚀 Features

- **Real-time Preview:** See changes instantly as you customize your stats card.
- **Theme Selection:** Choose from a wide variety of themes including Default, Dark, Radical, Tokyo Night, Dracula, and many more.
- **Customization Options:**
  - Toggle card border visibility.
  - Option to include private commits in the count.
  - Switch between numeric and letter grade formats.
- **Responsive Design:** Looks great on any device.
- **Modern UI:** Built with Shadcn UI for a clean and professional look.

## 🛠️ Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [Shadcn UI](https://ui.shadcn.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Form Handling:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Analytics:** [PostHog](https://posthog.com/)
- **Notifications:** [Sonner](https://sonner.emilkowal.ski/)

## 🏁 Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your system.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/stats.git
   cd stats
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📖 Usage

1. **Enter Username:** Type your GitHub username in the input field.
2. **Select Theme:** Choose a theme from the dropdown menu to match your profile aesthetic.
3. **Customize:** Use the settings gear icon to toggle options:
   - **Hide Card Border:** Removes the border around the stats card.
   - **Count Private Commits:** Include private contributions in the total count.
   - **Use Numeric Grade:** Display a numeric grade instead of a letter grade.
4. **Generate:** Click the "Generate Stats" button to create your custom stats card.
5. **Share:** Copy the generated URL or Markdown code and paste it into your GitHub profile README.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
