# Charging Station Management System - Frontend

A modern React application for managing electric vehicle charging stations, built with Vite and Bootstrap.

## Features

- 🏪 **Station Management**: Add, edit, and monitor charging stations
- 👥 **User Management**: Manage registered users and their activities
- 📊 **Reports & Analytics**: View system performance and revenue reports
- 💻 **Responsive Design**: Works seamlessly on desktop and mobile devices
- ⚡ **Fast Development**: Powered by Vite for lightning-fast builds

## Tech Stack

- **Frontend Framework**: React 19 with modern hooks
- **Build Tool**: Vite 7 for fast development and building
- **Routing**: React Router 7 for client-side navigation
- **UI Framework**: Bootstrap 5 + React Bootstrap for responsive components
- **Styling**: Tailwind CSS for utility-first styling
- **Code Quality**: ESLint with React plugins for consistent code

## Project Structure

```
src/
├── components/           # Reusable React components
│   └── layoutAdmin/     # Admin dashboard layout components
├── pages/               # Page components organized by feature
│   ├── admin/          # Admin dashboard pages
│   └── shared/         # Shared pages (404, etc.)
├── assets/             # Static assets
└── App.jsx             # Main application component
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd Front-end-Charging-Station-Management-System
```

2. Install dependencies

```bash
npm install
```

3. Start the development server

```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality

## Development Guidelines

- Use functional components with React hooks
- Follow the established folder structure
- Maintain consistent code style with ESLint
- Use semantic HTML and accessible components
- Keep components focused and reusable

## License

This project is part of the SWP391 course requirements.
