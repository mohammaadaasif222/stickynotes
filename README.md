# Collaborative Sticky Notes Application

A real-time collaborative note-taking application built with React, Node.js, and Socket.IO that allows users to create, edit, and share notes with others in real-time.

## Features

- 📝 Create and manage sticky notes
- 👥 Real-time collaboration with multiple users
- 🔍 Case-insensitive search functionality
- 📱 Responsive design
- 🔒 User authentication and authorization
- 📜 Note version history
- 🏷️ Tag support for better organization
- 🔔 Real-time updates and notifications

## Tech Stack

### Frontend
- React.js with Vite
- Redux Toolkit for state management
- Socket.IO client for real-time communication
- Tailwind CSS for styling
- Lucide React for icons

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Socket.IO for real-time features
- JWT for authentication

## Project Structure

```
stickynotes/
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/  # Reusable React components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── pages/       # Page components
│   │   ├── services/    # API and Socket services
│   │   ├── store/       # Redux store and slices
│   │   └── utils/       # Utility functions
│   └── public/          # Static assets
├── server/              # Backend Node.js application
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Custom middleware
│   ├── models/         # Mongoose models
│   └── routes/         # API routes
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/stickynotes.git
   cd stickynotes
   ```

2. Install server dependencies:
   ```bash
   cd server
   npm install
   ```

3. Install client dependencies:
   ```bash
   cd ../client
   npm install
   ```

4. Create a .env file in the server directory:
   ```env
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```

5. Create a .env file in the client directory:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

### Running the Application

1. Start the server:
   ```bash
   cd server
   npm run dev
   ```

2. Start the client:
   ```bash
   cd client
   npm run dev
   ```

The application will be available at `http://localhost:5173`

## Usage

### Authentication

1. Register a new account or login with existing credentials
2. Use your email and password to authenticate

### Creating Notes

1. Click the "Create Note" button
2. Enter a title and content for your note
3. Add tags (optional)
4. Choose whether the note should be public or private
5. Click "Create" to save the note

### Collaboration

1. Open a note you want to share
2. Click the "Add Collaborator" button
3. Enter the email of the user you want to collaborate with
4. Choose their permission level (read-only or edit)
5. Click "Add" to send the invitation

### Real-time Features

- Changes made by collaborators appear instantly
- See who is currently viewing or editing a note
- Receive notifications when collaborators make changes
- View typing indicators when others are editing

### Note History

1. Click the "History" button on any note
2. View a list of all changes made to the note
3. See who made each change and when
4. Compare different versions of the note

### Search and Filter

- Use the search bar to find notes by title or content
- Filter notes by tags
- Sort notes by creation date, last modified, or title

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.