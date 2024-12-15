# TVRI Issue Reporting System

## Overview
TVRI Issue Reporting System is a comprehensive mobile application built with React Native and Expo, designed to streamline the process of reporting and managing technical issues at TVRI. This system facilitates efficient communication between employees, operators, and technicians for effective issue resolution.

## Key Features

### User Roles and Access Control
- **Employees**
  - Submit technical issue reports with detailed descriptions
  - Track report status and progress
  - Receive real-time notifications on issue updates
  - View history of submitted reports

- **Operators**
  - Manage and oversee all reported issues
  - Assign technicians to specific issues
  - Monitor issue resolution progress
  - Access comprehensive dashboard and analytics
  - Filter reports by status, category, and date

- **Technicians**
  - Receive and manage assigned tasks
  - Update issue status and progress
  - Add technical notes and resolution details
  - Mark issues as resolved/unresolved

### Core Functionalities
1. **Issue Management**
   - Detailed issue reporting system
   - Real-time status tracking
   - Category-based classification (Hardware/Software)
   - Priority level assignment
   - Comprehensive issue history

2. **Real-time Notifications**
   - Status change alerts
   - New assignment notifications
   - Task completion updates
   - System announcements

3. **Dashboard and Analytics**
   - Issue resolution statistics
   - Performance metrics
   - Trend analysis
   - Custom date range filtering

4. **Search and Filter System**
   - Advanced search capabilities
   - Multiple filter combinations
   - Sort by various parameters
   - Quick access to recent issues

## Technical Stack

### Frontend
- React Native
- Expo SDK
- Redux Toolkit (State Management)
- React Navigation
- React Native Paper (UI Components)

### Backend
- Firebase/Firestore
- Firebase Authentication
- Firebase Cloud Messaging
- Firebase Storage

### Development Tools
- Expo CLI
- Android Studio
- Node.js
- npm/yarn

## System Requirements

### Mobile Application
- Android 7.0 (API Level 24) or higher
- 2GB RAM minimum
- 100MB free storage
- Active internet connection

### Development Environment
- Node.js 16.x or higher
- npm/yarn package manager
- Expo CLI
- Android Studio (for Android development)
- Git

## Installation and Setup

1. **Clone Repository**
   ```bash
   git clone https://github.com/Geraldo-Morris/tvriapp.git
   cd tvriapp
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure Environment**
   - Create .env file based on .env.example
   - Set up Firebase configuration
   - Configure notification settings

4. **Run Development Server**
   ```bash
   expo start
   ```

## Project Structure
```
src/
├── assets/          # Images and static files
├── components/      # Reusable UI components
├── config/          # Configuration files
├── navigation/      # Navigation setup
├── screens/         # Application screens
│   ├── auth/       # Authentication screens
│   ├── employee/   # Employee screens
│   ├── operator/   # Operator screens
│   └── technician/ # Technician screens
├── store/          # Redux store configuration
├── services/       # API and Firebase services
└── utils/          # Utility functions
```

## Security Features
- Firebase Authentication integration
- Role-based access control
- Secure data transmission
- Session management
- Input validation and sanitization

## Performance Optimizations
- Lazy loading for large data sets
- Image optimization
- Efficient state management
- Caching strategies
- Network request optimization

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Contact
For support or queries, please contact:
- Email: [geraldorau8@gmail.com](mailto:geraldorau8@gmail.com)
- GitHub: [@Geraldo-Morris](https://github.com/Geraldo-Morris)

## Acknowledgments
- TVRI team for project requirements and feedback
- React Native community
- Firebase team
- All contributors and testers
