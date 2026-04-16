# Code Sathi ⚡

**Code Sathi** is a modern platform designed to help developers, designers, and innovators find their dream teammates for hackathons and collaborative projects. 

## 🚀 Features

- **Discover Projects**: Browse through a curated list of innovative projects looking for collaborators.
- **Hackathon Directory**: Find upcoming hackathons and detail pages.
- **Team Board**: Manage your team and communicate with potential members.
- **Real-time Messages**: Connect directly with other "sathis" to discuss ideas.
- **Project Showcase**: Exhibit your completed works to the community.
- **Personalized Profiles**: Showcase your skills, experience, and interests.

## 🛠️ Tech Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Design**: Modern Dark Theme with Glassmorphism and vibrant gradients.
- **Architecture**: Single Page Application (SPA) structure.

## 📂 Project Structure

```text
.
├── backend/          # Node.js Express API
├── frontend/         # Frontend assets (HTML, CSS, JS)
├── README.md         # Documentation
└── .gitignore        # Git ignore rules
```

## 📦 Getting Started

To run the project locally, follow these steps:

### 1. Clone the repository
```bash
git clone https://github.com/captainmmd1304/CEP-4.git
cd CEP-4
```

### 2. Backend Setup
Navigate to the backend directory, install dependencies, and start the development server:

```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
# Check if you need to create a .env file with appropriate database credentials

# Run database migrations and seed data
npm run prisma:migrate
npm run prisma:seed

# Start the development server
npm run dev
```
The backend server should now be running locally.

### 3. Frontend Setup
The frontend is built with vanilla web technologies, so no complex build process is required:
1. Navigate to the `frontend/` directory.
2. Open `index.html` directly in your favorite web browser.
   - *Alternatively, use a local server like the "Live Server" extension in VS Code for a better development experience.*

---
Built with ❤️ for the developer community.
