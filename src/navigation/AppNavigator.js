import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

// Import screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import EmployeeDashboard from '../screens/employee/EmployeeDashboard';
import ReportIssue from '../screens/employee/ReportIssue';
import OperatorDashboard from '../screens/operator/OperatorDashboard';
import ManageReports from '../screens/operator/ManageReports';
import EvaluationDashboard from '../screens/operator/EvaluationDashboard';
import EmployeeIssueDetails from '../screens/employee/IssueDetails';
import OperatorIssueDetails from '../screens/operator/IssueDetails';
import TechnicianDashboard from '../screens/technician/TechnicianDashboard';
import TaskDetails from '../screens/technician/TaskDetails';
import ManageOperators from '../screens/operator/ManageOperators';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const EmployeeTabNavigator = () => {
  const theme = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Report Issue':
              iconName = focused ? 'add-circle' : 'add-circle-outline';
              break;
            default:
              iconName = 'list';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerTintColor: '#000000',
        headerTitleStyle: {
          color: '#000000',
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={EmployeeDashboard} />
      <Tab.Screen name="Report Issue" component={ReportIssue} />
      <Tab.Screen 
        name="Issue Details" 
        component={EmployeeIssueDetails}
        options={{
          tabBarButton: () => null,
          tabBarStyle: { display: 'none' },
        }}
      />
    </Tab.Navigator>
  );
};

const OperatorTabNavigator = () => {
  const theme = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
              break;
            case 'Manage Reports':
              iconName = focused ? 'list' : 'list-outline';
              break;
            case 'Evaluation':
              iconName = focused ? 'analytics' : 'analytics-outline';
              break;
            case 'Operators':
              iconName = focused ? 'people' : 'people-outline';
              break;
            default:
              iconName = 'list';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerTintColor: '#000000',
        headerTitleStyle: {
          color: '#000000',
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={OperatorDashboard} />
      <Tab.Screen name="Manage Reports" component={ManageReports} />
      <Tab.Screen name="Evaluation" component={EvaluationDashboard} />
      <Tab.Screen name="Operators" component={ManageOperators} />
      <Tab.Screen 
        name="Issue Details" 
        component={OperatorIssueDetails}
        options={{
          tabBarButton: () => null,
          tabBarStyle: { display: 'none' },
        }}
      />
    </Tab.Navigator>
  );
};

const TechnicianTabNavigator = () => {
  const theme = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#1E90FF',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerTintColor: '#000000',
        headerTitleStyle: {
          color: '#000000',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={TechnicianDashboard}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="construct" size={26} color={color} />,
        }}
      />
      <Tab.Screen
        name="TaskDetails"
        component={TaskDetails}
        options={{
          tabBarButton: () => null,
          tabBarStyle: { display: 'none' },
          headerShown: false
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const theme = useTheme();

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{
          headerShown: false,
          headerStyle: {
            backgroundColor: '#ffffff',
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: '#000000',
          headerTitleStyle: {
            color: '#000000',
          },
        }}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <Stack.Screen
            name="Main"
            component={
              user?.role === 'employee'
                ? EmployeeTabNavigator
                : user?.role === 'operator'
                ? OperatorTabNavigator
                : TechnicianTabNavigator
            }
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
