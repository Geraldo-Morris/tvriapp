import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from 'react-native-paper';

// Import screens
import OperatorDashboard from '../screens/operator/OperatorDashboard';
import ManageReports from '../screens/operator/ManageReports';
import EvaluationDashboard from '../screens/operator/EvaluationDashboard';
import ManageOperators from '../screens/operator/ManageOperators';

const Tab = createBottomTabNavigator();

const OperatorTabNavigator = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: 'gray',
        tabBarLabelStyle: {
          fontSize: 12,
        },
        tabBarStyle: {
          paddingBottom: 5,
          height: 60,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={OperatorDashboard}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" size={size} color={color} />
          ),
        }}
      />
      
      <Tab.Screen
        name="Reports"
        component={ManageReports}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="file-document" size={size} color={color} />
          ),
        }}
      />
      
      <Tab.Screen
        name="Evaluation"
        component={EvaluationDashboard}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-bar" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Operators"
        component={ManageOperators}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-cog" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default OperatorTabNavigator;
