# Task Manager (TM)

A full-stack Task Manager application built as part of the **Advanced Full Stack Development & Software Testing** course. This project demonstrates modern web development practices using React, Hono, and Cloudflare Workers.

🌐 **Live Demo:** [https://tm.baharali.workers.dev/](https://tm.baharali.workers.dev/)

## ✨ Features

- 📝 **Task Management** - Create, read, update, and delete tasks
- 🔐 **User Authentication** - Secure login/signup with Better Auth
- 📊 **Status Tracking** - Track tasks with statuses (todo, in-progress, done)
- 🎯 **Drag & Drop** - Reorder tasks with intuitive drag-and-drop
- 🌙 **Dark Mode** - Built-in theme support
- ⚡ **Edge Deployment** - Runs on Cloudflare Workers globally

## 🛠️ Tech Stack

### Frontend

- [**React 19**](https://react.dev/) - UI library
- [**TanStack Router**](https://tanstack.com/router) - Type-safe routing
- [**TanStack Query**](https://tanstack.com/query) - Data fetching & caching
- [**Tailwind CSS**](https://tailwindcss.com/) - Styling
- [**Radix UI**](https://www.radix-ui.com/) - Accessible UI components
- [**dnd-kit**](https://dndkit.com/) - Drag and drop functionality

### Backend

- [**Hono**](https://hono.dev/) - Lightweight web framework
- [**Drizzle ORM**](https://orm.drizzle.team/) - TypeScript ORM
- [**Cloudflare D1**](https://developers.cloudflare.com/d1/) - Serverless SQLite database
- [**Better Auth**](https://better-auth.com/) - Authentication library
- [**Zod**](https://zod.dev/) - Schema validation

### Build & Deploy

- [**Vite**](https://vite.dev/) - Build tool
- [**Cloudflare Workers**](https://developers.cloudflare.com/workers/) - Edge runtime
- [**Wrangler**](https://developers.cloudflare.com/workers/wrangler/) - CLI for Cloudflare

## 🚀 Getting Started

### Prerequisites

- Node.js 22+
- bun
- Cloudflare account (for deployment)

### Installation

```bash
# Clone the repository
git clone https://github.com/ehtishamsajjad/tm.git
cd tm

# Install dependencies
bun install
```

### Development

```bash
# Start the development server
bun run dev
```

Your application will be available at [http://localhost:5173](http://localhost:5173).

### Database Setup

```bash
# Generate migrations
bun run db:generate

# Apply migrations locally
bun run db:migrate:local
```

## 📦 Production

```bash
# Build for production
bun run build

# Preview locally
bun run preview

# Deploy to Cloudflare Workers
bun run deploy
```

## 📁 Project Structure

```text
tm/
├── src/
│   ├── react-app/          # Frontend React application
│   │   ├── components/     # UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── routes/         # TanStack Router pages
│   │   └── lib/            # Utilities
│   └── worker/             # Backend Hono API
│       ├── db/             # Database schema
│       └── lib/            # Auth & utilities
├── drizzle/                # Database migrations
└── public/                 # Static assets
```

## 📄 License

This project is licensed under the Apache Version 2 License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Ehtisham Sajjad** - Senior Software Engineer

- LinkedIn: [@ehtishamsajjad](https://www.linkedin.com/in/ehtishamsajjad/)
- Email: [hi@ehtishamsajjad.com](mailto:hi@ehtishamsajjad.com)
