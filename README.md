# Stream Me ID#

A real-time chat application with user profile creation, built with Socket.IO, Express, and Tailwind CSS. Features group chatrooms, direct messaging (DMs), image/voice note uploads, and a theme switcher. Deployable on Vercel or locally.

## Features
- **Profile Creation**: Login, signup, and edit user profiles (username, email, bio, avatar) via `index.html`.
- **Real-Time Chat**: Instant messaging in group chatrooms and DMs using Socket.IO.
- **Media Uploads**: Send images and voice notes, stored on the server.
- **Theme Switcher**: Toggle between dark and light themes with gradient aesthetics.
- **Chatroom Creation**: Create chatrooms with unique links for others to join.
- **Loading Screen**: Displays Stream Me ID logo with glitch effect on page load.
- **Responsive Design**: Mobile-friendly layout using Tailwind CSS.

## Repository Structurestream-me-id/ ├── pages/ │   ├── chatroom.html       # Chatroom frontend │   ├── index.html          # Profile creation, login, signup ├── uploads/                # Stores images and voice notes ├── server.js               # Node.js server with Socket.IO ├── package.json            # Dependencies and scripts ├── vercel.json             # Vercel deployment config ├── README.md               # Project documentation## Prerequisites
- [Node.js](https://nodejs.org/) (LTS recommended)
- [npm](https://www.npmjs.com/)
- [Vercel CLI](https://vercel.com/) (for deployment)

## Local Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/stream-me-id.git
   cd stream-me-idInstall dependencies:npm installCreate uploads/ directory:mkdir uploadsStart the server:npm startOpen http://localhost:8080/pages/index.html in your browser.TestingProfile Creation: Use index.html to signup, login, and edit profiles.Chatrooms: Open chatroom.html, create/join rooms, send messages.DMs: Start private chats with other users.Media: Upload images/voice notes and verify display.Themes: Toggle between dark/light themes.Vercel DeploymentInstall Vercel CLI:npm install -g vercelLogin to Vercel:vercel loginDeploy:npm deploy
vercelUpdate socket.io() in chatroom.html to your Vercel URL (e.g., io('https://your-project-name.vercel.app'))).Access at https://your-project-name.vercel.app/ for index.html or /pages/chatroom.html for chat.Note: In-memory data resets on Vercel. Use a database (e.g., MongoDB) for persistence. File uploads may require cloud storage (e.g., AWS S3).DependenciesExpress: Web frameworkSocket.IO: Real-time communicationMulter: File uploadsTailwind CSS: Styling (via CDN)Known LimitationsIn-memory storage for messages/users; add database for production.Local file uploads; use cloud storage for Vercel.No authentication; implement for secure sessions.ContributingFork the repository.Create a feature branch (git checkout -b feature-name).Commit changes (git commit -m 'Add feature')).Push to the branch (git push origin feature-name).Open a pull request.LicenseMIT License. See LICENSE for details.### Setup Instructions
1. **Create Structure**:
   - Make `stream-me-id/` directory.
   - Create `pages/` and `uploads/` subdirectories.
   - Save `index.html` and `chatroom.html` in `pages/`.
   - Save `server.js`, `package.json`, `vercel.json`, and `README.md` in root.
2. **Install Dependencies**:
   - Run:
     ```bash
     npm install
     npm install
     ```
3. **Local Testing**:
   - Run:
     ```bash
     npm start
     ```
   - Access `http://localhost:3000/pages/index.html` to create a profile, then `http://localhost:3000/pages/chatroom.html` to chat.
   - Test signup, login, profile editing, chatroom creation, DMs, and media uploads.
4. **Vercel Deployment**:
   - Install Vercel CLI:
     ```bash
     npm install -g vercel
     ```
   - Deploy:
     ```bash
     vercel login
     npm deploy
     vercel
     ```
   - Update `io()` in `chatroom.html` to your Vercel URL.
   - Test at `https://your-project-name.vercel.app/`.

### Notes
- **Profile Integration**: Users create profiles in `index.html`, which `chatroom.html` reads from `from` localStorage. Guest users are prompted to set up profiles.
- **Fixes**: Fixed `displayMessage` in `chatroom.html` to properly create and append `<div>` elements with `createElement` and `innerHTML`.
- **Vercel**: File uploads and in-memory storage are limitations; consider AWS S3 and MongoDB for production.
- **Errors**: Share console errors if issues arise.
