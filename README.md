# LearnHive

![LearnHive Logo](frontend/public/logos/LearnHive_logo-white.png)

LearnHive is an open-source skill-sharing and learning platform designed for individuals eager to enhance their expertise and grow professionally in the modern corporate IT sector. The platform focuses on professional development and soft skills, enabling users to learn various courses based on their interests.

## Features

### Learning & Skill Development
- Access to diverse courses focused on professional development and soft skills
- Create AI-powered learning plans
- Personalized learning paths based on user interests
- Track and showcase learning progress and achievements

### Social Learning & Community
- Create and share skill-sharing posts with photos and short videos
- Interactive community features:
  - Like and comment on posts
  - Edit or delete your comments
  - Post owners can moderate comments
- Public profile pages to showcase skills and professional activities
- Follow other users to stay updated with their learning journey

### Engagement & Notifications
- Real-time notifications for likes and comments
- Interactive learning environment
- Community-driven knowledge sharing

## Project Structure

The project is organized into two main components:

- `frontend/`: Contains the React-based user interface
- `backend/`: Contains the Spring Boot-based server-side application

## Getting Started

### Prerequisites
- Java 17 or higher
- Maven
- Node.js (v14 or higher) for frontend
- npm or yarn
- MongoDB

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Binura22/learnHive.git
cd learnHive
```

2. Install dependencies:
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
mvn clean install
```

3. Set up environment variables:
   - Create `.env` file in the frontend directory
   - Configure `application.properties` or `application.yml` in the backend for database connection and other settings

4. Start the development servers:
```bash
# Start backend server (Spring Boot)
cd backend
mvn spring-boot:run

# Start frontend server (in a new terminal)
cd frontend
npm start
```

## Contributing

We welcome contributions from the community! Please feel free to submit issues, feature requests, or pull requests.

## License

This project is not licensed yet.

## Acknowledgments

- Thanks to all contributors who have helped shape LearnHive
- Inspired by the need for accessible professional development in the IT sector
