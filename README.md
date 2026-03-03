# Planify — AI Productivity Planner (Company Use)

A modern, enterprise-style productivity planner for **company use**. Planify helps individuals and teams plan smarter, stay focused, and ship work faster with task management, a Pomodoro focus timer, productivity insights, and an in-app AI assistant widget.

> **Note**: This is currently a **static front-end** app (HTML/CSS/JS) that stores data in **localStorage**. No backend is required to run it locally.

## Live Pages

- **Login**: `index.html`
- **Create account**: `signup.html`
- **Dashboard / Planner**: `planner.html`
- **About**: `about.html`

## Features

### Core productivity
- **Smart Task Management** (CRUD) with:
  - Priority levels: **High / Medium / Low**
  - Categories: **Work / Personal / Health / Learning / Finance**
  - Optional **due dates**
  - Search and filtering
- **Progress analytics**: total, completed, pending, daily progress bar
- **Streak tracking** (local)
- **Keyboard shortcuts** modal

### Focus
- Built-in **Pomodoro focus timer** with modes:
  - Focus (default 25 min)
  - Short break (5 min)
  - Long break (15 min)
  - Custom durations (editable in UI)

### AI assistant (chat widget)
- Floating **Planify AI** chatbot widget (`chatbot.js`)
- Tries to call a configured API endpoint and falls back to a local rule-based assistant when offline
  - API URL (placeholder): `https://api.mycompany.com/minigpt`

### Authentication (demo)
- Signup, login, logout flows using **localStorage** (`auth.js`)
- Password visibility toggle and strength meter

## Tech Stack

- **HTML**: `index.html`, `signup.html`, `planner.html`, `about.html`
- **CSS**: `style.css` (enterprise glassmorphism UI, responsive layout)
- **JavaScript**:
  - `script.js` — dashboard logic (tasks, timer, tips, search, shortcuts, sidebar, streaks)
  - `auth.js` — authentication logic
  - `chatbot.js` — chatbot widget

## Getting Started (Local)

Because this is a static site, you can run it by simply opening the HTML files in your browser.

### Option A: Open directly
1. Download / clone the repository
2. Open `index.html` in your browser

### Option B: Run a local server (recommended)
A local server avoids some browser restrictions and is better for development.

**Using VS Code Live Server**
1. Install the **Live Server** extension
2. Right-click `index.html` → **Open with Live Server**

**Using Python**
```bash
python -m http.server 8000
```
Then open: `http://localhost:8000/index.html`

## How It Works (High Level)

### Data storage
- Users (demo credentials) are stored in `localStorage`:
  - `userName`, `userEmail`, `userPassword`
- Tasks and productivity state are stored in `localStorage` (managed by `script.js`).

### Navigation flow
1. Create an account on `signup.html`
2. Sign in on `index.html`
3. You are redirected to `planner.html`

## Keyboard Shortcuts

On `planner.html`:
- `N` — focus the **New task** input
- `/` — focus **Search**
- `P` — toggle / jump to **Pomodoro timer**
- `1` — show **All tasks**
- `2` — show **Pending**
- `3` — show **Completed**
- `?` — open shortcuts modal
- `Esc` — close dialogs

## Screenshots

Add screenshots to a `docs/` folder (recommended) and link them here, for example:

```text
docs/screenshots/login.png
docs/screenshots/dashboard.png
docs/screenshots/about.png
```

> If you want, tell me where the app is hosted (GitHub Pages / Vercel / Netlify) and I can help you generate the exact screenshot commands and update this section to display the images in the README.

## Security / Production Notes

This project currently uses **localStorage** for demo authentication and task storage. For real company/enterprise use you would typically add:
- Server-side authentication (SSO / OAuth / SAML)
- Database storage
- Role-based access control
- Audit logs
- Secure secrets management

## License

This repository includes a [LICENSE](LICENSE).
