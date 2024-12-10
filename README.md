# TVRI Issue Reporting App

A mobile application built with React Native and Expo for managing and reporting technical issues at TVRI. This app facilitates communication between employees, operators, and technicians for efficient issue resolution.

## Features

### User Roles
- **Employees**: Can report technical issues and track their status
- **Operators**: Manage reports and assign technicians
- **Technicians**: Handle assigned tasks and update their status

### Key Functionalities
- Issue reporting with image attachments
- Real-time status tracking
- Task assignment system
- Evaluation dashboard
- Report history
- User authentication and authorization

## Technology Stack

- **Frontend Framework**: React Native with Expo
- **State Management**: Redux Toolkit
- **UI Components**: React Native Paper
- **Navigation**: React Navigation
- **Database**: Firebase/Firestore
- **Authentication**: Firebase Auth
- **Charts**: React Native Chart Kit
- **Image Handling**: Expo Image Picker

## Project Structure

```
src/
├── assets/          # Images and static assets
├── components/      # Reusable UI components
├── config/          # Configuration files (Firebase, etc.)
├── data/           # Mock data and constants
├── navigation/     # Navigation configuration
├── screens/        # Application screens
│   ├── auth/       # Authentication screens
│   ├── employee/   # Employee-specific screens
│   ├── operator/   # Operator-specific screens
│   └── technician/ # Technician-specific screens
├── store/          # Redux store configuration
└── utils/          # Utility functions
```

## Getting Started

### Prerequisites
- Node.js
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Geraldo-Morris/tvriapp.git
```

2. Install dependencies:
```bash
cd tvriapp
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on Android:
```bash
npm run android
```

## Environment Setup

1. Create a Firebase project
2. Add your Firebase configuration in `src/config/firebase.js`
3. Enable Authentication and Firestore in your Firebase console

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is proprietary and confidential. Unauthorized copying or distribution of this project's files, via any medium, is strictly prohibited.

## Contact

Geraldo Morris - geraldorau8@gmail.com

Project Link: [https://github.com/Geraldo-Morris/tvriapp](https://github.com/Geraldo-Morris/tvriapp)
