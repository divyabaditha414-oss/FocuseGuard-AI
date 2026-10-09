# 🧠 FocusGuard AI – Attention Intelligence

**FocusGuard AI** is an AI-powered productivity and attention management application designed to help users understand their focus, monitor digital activity, identify distractions, and improve productivity through data-driven insights.

The application provides a dashboard for tracking focus performance, focus sessions, screen time, app switches, distraction patterns, analytics, and AI-powered recommendations.

## 🌟 Features

- **Productivity Dashboard** – View focus scores, screen time, app switches, and distraction statistics.
- **Focus Sessions** – Set focus durations and manage dedicated deep-work sessions.
- **Activity Monitor** – Review digital activity and screen-time information.
- **Distraction Analysis** – Understand distraction patterns and interruptions.
- **Analytics** – Explore productivity trends and focus performance over time.
- **AI Recommendations** – Get recommendations to help improve focus and productivity.
- **User Authentication** – Register, log in, and access your account.
- **User Profile** – View and manage personal account information.
- **Settings** – Manage application preferences.
- **Explore My Data** – Review available activity data.
- **Responsive Design** – Access the application through desktop and mobile-sized screens.
- **Mobile Navigation** – Use a mobile header, side drawer, notifications, and bottom navigation.

## 🛠️ Tech Stack

### Frontend
- React.js
- JavaScript
- Vite
- React Router
- Axios
- Lucide React
- CSS

### Backend
- Python
- FastAPI
- REST API

### Database
- PostgreSQL

### Deployment
- Vercel

## 🏗️ Project Structure

```text
FocusGuard-AI/
│
├── front-end/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── MobileNavigation.jsx
│   │   │   └── Notification.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── FocusSessions.jsx
│   │   │   ├── ActivityMonitor.jsx
│   │   │   ├── DistractionAnalysis.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── AIRecommendations.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Settings.jsx
│   │   │   └── ExploreMyData.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── back-end/
│   ├── main.py
│   ├── requirements.txt
│   └── ...
│
└── README.md
```

*Note: The structure above is illustrative. Adjust file names and folders to match your actual repository.*

## 🚀 Live Demo

- **Frontend:** https://focus-guard-ai.vercel.app
- **Backend:** https://focus-guard-ai-q44i.vercel.app
- **GitHub Repository:** https://github.com/divyabaditha414-oss/FocusGuard-AI

## 💻 Run the Project Locally

### 1. Clone the repository

```bash
git clone https://github.com/divyabaditha414-oss/FocusGuard-AI.git
cd FocusGuard-AI
```

### 2. Start the frontend

```bash
cd front-end
npm install
npm run dev
```

Open the local URL shown in the terminal, usually:

```text
http://localhost:5173
```

### 3. Set up the backend

Open a separate terminal:

```bash
cd back-end
```

Create and activate a Python virtual environment.

**Windows:**

```bash
python -m venv venv
venv\Scripts\activate
```

Install the backend dependencies:

```bash
pip install -r requirements.txt
```

Configure the required environment variables and PostgreSQL database connection using your backend configuration.

Start FastAPI using the application's actual entry point. If the entry point is `main.py` and the FastAPI instance is named `app`, run:

```bash
uvicorn main:app --reload
```

The backend will normally be available at:

```text
http://127.0.0.1:8000
```

API documentation is normally available at:

```text
http://127.0.0.1:8000/docs
```

### 4. Configure the frontend API URL

Ensure the frontend API configuration points to the correct backend address for local development or deployment.

For local development, this is typically:

```text
http://127.0.0.1:8000
```

For production, use the deployed backend URL.

**Important:** Never commit database passwords, secret keys, or private environment variables to GitHub.

## 🔐 Environment Variables

Configure the environment variables required by the frontend and backend.

Typical configuration may include:

- PostgreSQL connection settings
- Database credentials
- Authentication secrets, if used
- Frontend API base URL

Refer to the actual application configuration for the required variable names. Keep local `.env` files out of version control.

## 📱 Responsive Interface

FocusGuard AI supports a responsive interface with:

- Desktop sidebar navigation
- Mobile header with notification and profile shortcuts
- Hamburger navigation drawer
- Fixed mobile bottom navigation
- Responsive dashboard cards and analytics sections

## 🎯 Project Objective

The objective of FocusGuard AI is to help users develop better digital habits by providing visibility into their attention, focus sessions, screen time, and distraction patterns.

By combining activity tracking, productivity analytics, and AI-powered recommendations, the application aims to support more intentional and productive work.

## 🔮 Future Enhancements

- Advanced AI-based productivity recommendations
- Detailed productivity reports
- Customizable focus goals and reminders
- Improved visualization of historical activity
- Additional personalization options
- Enhanced mobile experience

## 👩‍💻 Author

**Divya Baditha**

GitHub: [@divyabaditha414-oss](https://github.com/divyabaditha414-oss)

## 📄 License

Add a license to this repository if you intend to distribute or reuse the project under specific terms.

---

**FocusGuard AI – Understand your attention. Improve your focus.**
