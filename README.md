
# 🌿 EcoTube - Eco-Friendly YouTube Subscription Management

A web application that helps users manage YouTube subscriptions by filtering channels to show eco-friendly and sustainable content.

## ✨ Core Features

1. **🔐 Google Authentication**
   - Connects to YouTube using Google account authentication
   - Securely accesses user's subscribed channels

2. **🌱 Eco-Friendly Channel Filtering**
   - Smart filtering to identify environmental awareness and sustainability content
   - Visual indicators for eco-friendly channels
   - Category-based filtering options

3. **📋 Subscription Management**
   - View channel details including thumbnails and subscriber counts
   - Easily unsubscribe from channels with one click
   - Search functionality to find specific channels

## 🛠️ Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS
- **Authentication**: Google OAuth 2.0
- **API**: YouTube Data API v3
- **UI Framework**: Shadcn UI components

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Set up Google OAuth and YouTube API:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Navigate to "APIs & Services" > "Library"
   - Enable the "YouTube Data API v3"
   - Go to "APIs & Services" > "Credentials"
   - Create an OAuth 2.0 Client ID (Web application type)
   - Add authorized JavaScript origins for your development environment (e.g., `http://localhost:8080`)
   - Add authorized redirect URIs (e.g., `http://localhost:8080`)
4. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Add your Google OAuth Client ID to the `.env` file
5. Run the application with `npm run dev`

## 🔌 YouTube API Integration

This application uses the YouTube Data API to:

1. **📥 Fetch Subscriptions**: Gets a list of all channels the user is subscribed to
   - Handles pagination for users with many subscriptions
   - Retrieves channel details including thumbnails and descriptions
   - Uses real-time data from the YouTube API

2. **ℹ️ Get Channel Details**: Enriches subscription data with additional information
   - Subscriber counts from the YouTube API
   - Channel categories derived from topic details
   - Content classification based on channel metadata

3. **🔄 Manage Subscriptions**: Allows users to unsubscribe from channels
   - Uses the YouTube API to find subscription IDs
   - Performs real unsubscribe operations via the API
   - Updates the UI in real-time after successful operations

## 🔒 Authentication Persistence

The application implements persistent authentication using localStorage:

1. **💾 Session Persistence**: Users remain logged in between browser sessions
   - Authentication tokens are securely stored in localStorage
   - User profile information is cached for quick loading

2. **🔑 Token Management**:
   - Automatic token expiration handling
   - Graceful session timeout with user notifications
   - Secure token storage with expiration timestamps

3. **🛡️ Security Considerations**:
   - Tokens are automatically invalidated when expired
   - No sensitive data is stored in plain text
   - Authentication state is synchronized across tabs

## 💰 Budget Considerations

- **Development Tools**: Free open-source frameworks and libraries
- **Hosting**: ~$5-20/month depending on traffic (Netlify, Vercel, or similar)
- **API Costs**:
  - YouTube Data API: Free tier includes 10,000 queries per day
  - Content classification: Minimal costs with efficient caching

## 🔮 Future Enhancements

- 🌍 Advanced filtering with customizable sustainability criteria
- ⏱️ Content scheduling and time limits
- 📊 Detailed analytics on viewing habits
- 🎬 Custom curated playlists for different sustainability topics
- 👥 Community features to share eco-friendly content recommendations

## 📁 Project Structure

```
src/
├── components/     # UI components
├── context/        # React context providers
├── hooks/          # Custom React hooks
├── lib/            # Utility functions
├── pages/          # Application pages
└── services/       # API services
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
