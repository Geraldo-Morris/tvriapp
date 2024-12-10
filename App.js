import React from 'react';
import { Provider as PaperProvider, MD3LightTheme as DefaultTheme } from 'react-native-paper';
import { Provider as StoreProvider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import AppNavigator from './src/navigation/AppNavigator';
import authReducer from './src/store/slices/authSlice';
import issuesReducer from './src/store/slices/issuesSlice';
import reportsReducer from './src/store/slices/reportsSlice';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import FirebaseInit from './src/components/FirebaseInit';

const store = configureStore({
  reducer: {
    auth: authReducer,
    issues: issuesReducer,
    reports: reportsReducer,
  },
});

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#1D3365',
    primaryContainer: '#1D3365',
  },
};

export default function App() {
  return (
    <StoreProvider store={store}>
      <PaperProvider theme={theme}>
        <FirebaseInit />
        <AppNavigator />
      </PaperProvider>
    </StoreProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
