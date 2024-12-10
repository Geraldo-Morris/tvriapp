# Issue Reporting App

A comprehensive mobile application for tracking and managing computer-related hardware and software issues across different organizational roles.

## Features

### Employee Features
- Report software and hardware issues
- Upload issue photos
- Track issue status
- View issue history

### Operator Features
- Manage issue reports
- Assign technicians
- Generate analytics and reports
- Filter and export issue data

### Technician Features
- Receive task assignments
- View and update issue details
- Add solution information
- Upload after-repair photos
- Update issue status

## Tech Stack

- React Native with Expo
- Redux Toolkit for state management
- React Native Paper for UI components
- React Navigation for routing
- Expo Image Picker for image handling
- React Native Chart Kit for analytics

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- iOS Simulator (for Mac) or Android Studio (for Android development)

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd issue-reporting-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Use the Expo Go app on your mobile device to scan the QR code, or press 'a' to open in an Android emulator or 'i' for iOS simulator.

## Demo Accounts

Use these accounts to test different roles:

- Employee:
  - Username: employee1
  - Password: pass123

- Operator:
  - Username: operator1
  - Password: pass123

- Technician:
  - Username: technician1
  - Password: pass123

## Project Structure

```
src/
├── screens/
│   ├── auth/
│   │   └── LoginScreen.js
│   ├── employee/
│   │   ├── EmployeeDashboard.js
│   │   └── ReportIssue.js
│   ├── operator/
│   │   ├── OperatorDashboard.js
│   │   ├── ManageReports.js
│   │   ├── AssignTechnician.js
│   │   └── EvaluationDashboard.js
│   └── technician/
│       ├── TechnicianDashboard.js
│       └── TaskDetails.js
├── store/
│   ├── index.js
│   └── slices/
│       ├── authSlice.js
│       └── issuesSlice.js
└── navigation/
    └── AppNavigator.js
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
