import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Card, Title, Paragraph, Button, Surface, useTheme, Text } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { format } from 'date-fns';
import { logoutAsync } from '../../store/slices/authSlice';
import { fetchReports } from '../../store/slices/reportsSlice';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const EmployeeDashboard = ({ navigation }) => {
  const { reports } = useSelector((state) => state.reports);
  const { user } = useSelector((state) => state.auth);
  const theme = useTheme();
  const dispatch = useDispatch();

  useEffect(() => {
    if (user?.uid) {
      console.log('=== EmployeeDashboard: Fetching Reports ===');
      console.log('User:', user);
      dispatch(fetchReports());
    }
  }, [dispatch, user]);

  useEffect(() => {
    console.log('=== EmployeeDashboard: Reports Updated ===');
    console.log('All reports:', reports);
    console.log('Filtered user reports:', userReports);
  }, [reports, userReports]);

  const userReports = reports.filter(report => report.reportedBy === user.uid);
  
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '#FFA500';
      case 'assigned':
      case 'in_progress':
        return '#1E90FF';
      case 'resolved':
        return '#32CD32';
      case 'unresolved':
        return '#FF6B6B';
      default:
        return '#808080';
    }
  };

  const getStatusCount = (status) => {
    return userReports.filter(report => report.status === status).length;
  };

  const handleLogout = () => {
    dispatch(logoutAsync());
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={[styles.header, { backgroundColor: '#ffffff' }]}>
        <View style={styles.headerContent}>
          <Title style={{ color: '#000000' }}>Welcome, {user?.displayName}!</Title>
          <Button 
            mode="contained" 
            onPress={handleLogout}
            style={styles.logoutButton}
            icon="logout"
          >
            Logout
          </Button>
        </View>
      </Surface>

      <View style={styles.actionButtons}>
        <Pressable
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('Report Issue')}
        >
          <MaterialCommunityIcons name="plus-circle" size={24} color="white" />
          <Title style={styles.actionButtonText}>Report New Issue</Title>
        </Pressable>
      </View>

      <View style={styles.statsContainer}>
        <Card style={[styles.statsCard, { borderLeftColor: '#FFA500' }]}>
          <Card.Content>
            <Title>{getStatusCount('pending')}</Title>
            <Paragraph>Pending</Paragraph>
          </Card.Content>
        </Card>

        <Card style={[styles.statsCard, { borderLeftColor: '#1E90FF' }]}>
          <Card.Content>
            <Title>{getStatusCount('in_progress')}</Title>
            <Paragraph>In Progress</Paragraph>
          </Card.Content>
        </Card>

        <Card style={[styles.statsCard, { borderLeftColor: '#32CD32' }]}>
          <Card.Content>
            <Title>{getStatusCount('resolved')}</Title>
            <Paragraph>Resolved</Paragraph>
          </Card.Content>
        </Card>
      </View>

      <Title style={styles.sectionTitle}>Your Reports</Title>
      {userReports.length === 0 ? (
        <Card style={styles.card}>
          <Card.Content>
            <Paragraph>No reports found. Create a new report to get started.</Paragraph>
          </Card.Content>
        </Card>
      ) : (
        userReports.map((report) => (
          <Pressable
            key={report.id}
            style={styles.card}
            onPress={() => {
              console.log('=== Navigating to Issue Details ===');
              console.log('Selected report:', report);
              navigation.navigate('Issue Details', { issueId: report.id });
            }}
          >
            <Card>
              <Card.Content>
                <Title>{report.title}</Title>
                <Paragraph numberOfLines={2}>{report.description}</Paragraph>
                <View style={styles.cardFooter}>
                  <View style={styles.statusContainer}>
                    <View
                      style={[
                        styles.statusDot,
                        { backgroundColor: getStatusColor(report.status) }
                      ]}
                    />
                    <Text style={styles.statusText}>
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </Text>
                  </View>
                  <Text style={styles.dateText}>
                    {format(new Date(report.createdAt), 'MMM dd, yyyy')}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcome: {
    fontSize: 20,
  },
  logoutButton: {
    marginLeft: 16,
  },
  actionButtons: {
    padding: 16,
    flexDirection: 'row',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    elevation: 2,
  },
  actionButtonText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
  },
  statsCard: {
    flex: 1,
    marginHorizontal: 4,
    borderLeftWidth: 4,
  },
  sectionTitle: {
    marginLeft: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  card: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  }
});

export default EmployeeDashboard;
