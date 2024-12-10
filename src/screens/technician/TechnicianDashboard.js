import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  Surface,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { format } from 'date-fns';
import { logoutAsync } from '../../store/slices/authSlice';
import { fetchReports } from '../../store/slices/reportsSlice';

const TechnicianDashboard = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { reports, loading, error } = useSelector((state) => state.reports);
  const [activeReports, setActiveReports] = useState([]);
  const [completedReports, setCompletedReports] = useState([]);

  // Debug user info
  useEffect(() => {
    if (user) {
      console.log('=== Current User Info ===');
      console.log({
        uid: user.uid,
        displayName: user.displayName,
        role: user.role,
        email: user.email
      });
    }
  }, [user]);

  // Fetch reports when dashboard loads
  useEffect(() => {
    if (user?.uid) {
      console.log('=== Fetching Reports ===');
      console.log('Technician ID:', user.uid);
      dispatch(fetchReports());
    }
  }, [dispatch, user]);

  // Debug reports data
  useEffect(() => {
    if (reports && reports.length > 0) {
      console.log('=== All Reports ===');
      console.log('Total reports:', reports.length);
      reports.forEach(report => {
        console.log('Report:', {
          id: report.id,
          status: report.status,
          assignedTo: report.assignedTo,
          title: report.title
        });
      });
    }
  }, [reports]);

  // Separate reports into active and completed
  useEffect(() => {
    if (user && reports) {
      console.log('=== Filtering Reports for Technician ===');
      console.log('Looking for reports assigned to:', user.uid);
      
      const assignedReports = reports.filter(report => {
        const isAssigned = report.assignedTo === user.uid;
        if (isAssigned) {
          console.log('Found assigned report:', {
            id: report.id,
            status: report.status,
            title: report.title
          });
        }
        return isAssigned;
      });
      
      // Active reports are those that are pending, assigned, or in_progress
      const active = assignedReports.filter(report => 
        ['pending', 'assigned', 'in_progress'].includes(report.status.toLowerCase())
      );
      
      // Completed reports are those that are resolved or unresolved
      const completed = assignedReports.filter(report => 
        ['resolved', 'unresolved'].includes(report.status.toLowerCase())
      );
      
      console.log('Active reports:', active.length);
      console.log('Completed reports:', completed.length);
      
      setActiveReports(active);
      setCompletedReports(completed);
    }
  }, [reports, user]);

  const handleLogout = () => {
    dispatch(logoutAsync());
  };

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

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Date not available';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return format(date, 'MMM dd, yyyy HH:mm');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const renderReportCard = (report) => (
    <Card key={report.id} style={styles.card} onPress={() => navigation.navigate('TaskDetails', { taskId: report.id })}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Title>{report.title}</Title>
          </View>
          <Text style={[styles.statusChip, { borderColor: getStatusColor(report.status), color: getStatusColor(report.status) }]}>
            {report.status.replace('_', ' ')}
          </Text>
        </View>
        <Paragraph>{report.description}</Paragraph>
        <Text style={styles.locationText}>
          Location: Floor {report.location?.floor}, Room {report.location?.room}
        </Text>
        <Text style={styles.dateText}>
          Reported: {formatDate(report.createdAt)}
        </Text>
        <Button 
          mode="contained" 
          style={styles.viewButton}
          onPress={() => navigation.navigate('TaskDetails', { taskId: report.id })}
        >
          View Details
        </Button>
      </Card.Content>
    </Card>
  );

  return (
    <ScrollView style={styles.container}>
      <Surface style={[styles.header, { backgroundColor: '#ffffff' }]}>
        <View>
          <Title style={{ color: '#000000' }}>Welcome, {user?.displayName || 'Technician'}</Title>
          <View>
            <Text style={[styles.debugText, { color: '#666666' }]}>Active Tasks: {activeReports?.length || 0}</Text>
            <Text style={[styles.debugText, { color: '#666666' }]}>Completed Tasks: {completedReports?.length || 0}</Text>
            {error && (
              <Text style={[styles.debugText, { color: '#f44336' }]}>Error: {error}</Text>
            )}
          </View>
        </View>
        <Button 
          mode="text" 
          onPress={handleLogout}
          textColor="#000000"
        >
          Logout
        </Button>
      </Surface>

      {error && (
        <Card style={[styles.card, { backgroundColor: '#ffebee' }]}>
          <Card.Content>
            <Paragraph style={{ color: '#c62828' }}>
              Error loading reports: {error}
            </Paragraph>
          </Card.Content>
        </Card>
      )}

      <Title style={styles.sectionTitle}>Active Issues</Title>
      {loading ? (
        <Card style={styles.emptyCard}>
          <Card.Content>
            <Paragraph>Loading reports...</Paragraph>
          </Card.Content>
        </Card>
      ) : activeReports.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Card.Content>
            <Paragraph>No active issues assigned to you.</Paragraph>
          </Card.Content>
        </Card>
      ) : (
        activeReports.map(renderReportCard)
      )}

      <Title style={styles.sectionTitle}>Completed Issues</Title>
      {loading ? (
        <Card style={styles.emptyCard}>
          <Card.Content>
            <Paragraph>Loading reports...</Paragraph>
          </Card.Content>
        </Card>
      ) : completedReports.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Card.Content>
            <Paragraph>No completed issues.</Paragraph>
          </Card.Content>
        </Card>
      ) : (
        completedReports.map(renderReportCard)
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    elevation: 2,
  },
  sectionTitle: {
    marginLeft: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
  },
  emptyCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  statusChip: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 4,
    padding: 4,
    fontSize: 12,
  },
  locationText: {
    marginTop: 8,
    color: '#666',
  },
  dateText: {
    marginTop: 4,
    color: '#666',
    fontSize: 12,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  viewButton: {
    marginTop: 12,
    backgroundColor: '#1D3365',
  },
});

export default TechnicianDashboard;
