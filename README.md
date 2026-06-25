# Focus Flow Pomodoro Timer

A beautifully designed, minimalist Pomodoro timer application built with React, Vite, and Tailwind CSS. Focus Flow helps you manage your time and track your productivity with customizable focus sessions, short breaks, and long breaks.

## Features

- **Pomodoro Timer**: Customizable timer for Focus, Short Break, and Long Break sessions.
- **Clean Minimalism Design**: A distraction-free, aesthetically pleasing dark mode interface.
- **Session Tracking**: Keep track of your daily focus sessions and total focus time.
- **Data Sync**: Sync your settings and session history across multiple devices using a simple 6-character code (powered by Firebase).
- **Responsive Layout**: Works seamlessly across desktop and mobile devices.

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository or download the source code.
2. Install the dependencies:
   ```bash
   npm install
   ```

### Running Locally

Start the development server:

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:3000` to see the application running.

### Building for Production

To create a production build:

```bash
npm run build
```

This will generate the optimized static files in the `dist` directory, which can be deployed to any static hosting service like Vercel, Netlify, or GitHub Pages.

## Tech Stack

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Firebase](https://firebase.google.com/) (Firestore for Data Sync)
- [Chart.js](https://www.chartjs.org/) & [react-chartjs-2](https://react-chartjs-2.js.org/)
