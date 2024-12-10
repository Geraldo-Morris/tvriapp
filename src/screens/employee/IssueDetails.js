import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Divider,
  Text,
  Chip,
  IconButton,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { format } from 'date-fns';
import { fetchReports } from '../../store/slices/reportsSlice';

const IssueDetails = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { reports, loading } = useSelector((state) => state.reports);
  const { user } = useSelector((state) => state.auth);
  const issueId = route.params?.issueId;
  const issue = reports.find(i => i.id === issueId);

  useEffect(() => {
    console.log('=== Employee IssueDetails Debug ===');
    console.log('Route params:', route.params);
    console.log('Issue ID:', issueId);
    console.log('Reports:', reports);
    console.log('Found issue:', issue);
  }, [route.params, issueId, reports, issue]);

  useEffect(() => {
    if (user?.uid) {
      console.log('Fetching reports...');
      dispatch(fetchReports());
    }
  }, [dispatch, user]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Title>Loading...</Title>
          </Card.Content>
        </Card>
      </View>
    );
  }

  if (!issue) {
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Title>Issue not found</Title>
            <Paragraph>The requested issue could not be found.</Paragraph>
          </Card.Content>
        </Card>
      </View>
    );
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '#FFA500';
      case 'in_progress':
        return '#1E90FF';
      case 'resolved':
        return '#32CD32';
      case 'unresolved':
        return '#F44336';
      default:
        return '#808080';
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.headerBar, { backgroundColor: '#ffffff' }]}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
          iconColor="#000000"
        />
        <Text style={[styles.headerTitle, { color: '#000000' }]}>Issue Details</Text>
      </View>
      <ScrollView style={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.titleContainer}>
              <Title style={styles.title}>{issue.title || 'Untitled Report'}</Title>
              <Chip 
                style={[
                  styles.statusChip,
                  { borderColor: getStatusColor(issue.status) }
                ]}
                textStyle={{ color: getStatusColor(issue.status) }}
              >
                {issue.status?.charAt(0).toUpperCase() + issue.status?.slice(1)}
              </Chip>
            </View>

            <View style={styles.section}>
              <Title style={styles.sectionTitle}>Description</Title>
              <Paragraph>{issue.description}</Paragraph>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.section}>
              <Title style={styles.sectionTitle}>Details</Title>
              <View style={styles.detailRow}>
                <Text style={styles.label}>Category:</Text>
                <Text>{issue.category}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.label}>Location:</Text>
                <Text>Floor {issue.location.floor}, Room {issue.location.room}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.label}>Reported:</Text>
                <Text>{format(new Date(issue.createdAt), 'MMM dd, yyyy HH:mm')}</Text>
              </View>
              {issue.technicianName && (
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Assigned to:</Text>
                  <Text>{issue.technicianName}</Text>
                </View>
              )}
            </View>

            {issue.history && issue.history.length > 0 && (
              <>
                <Divider style={styles.divider} />
                <View style={styles.section}>
                  <Title style={styles.sectionTitle}>History</Title>
                  {issue.history.map((entry, index) => (
                    <View key={index} style={styles.historyEntry}>
                      <Text style={styles.historyStatus}>
                        {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                      </Text>
                      <Text style={styles.historyTimestamp}>
                        {format(new Date(entry.timestamp), 'MMM dd, yyyy HH:mm')}
                      </Text>
                      {entry.comment && (
                        <Text style={styles.historyComment}>{entry.comment}</Text>
                      )}
                    </View>
                  ))}
                </View>
              </>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 18,
    marginLeft: 16,
  },
  scrollContent: {
    flex: 1,
  },
  card: {
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    flex: 1,
    marginRight: 12,
  },
  statusChip: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  section: {
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  divider: {
    marginVertical: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontWeight: 'bold',
    marginRight: 8,
    minWidth: 80,
  },
  historyEntry: {
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 4,
  },
  historyStatus: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  historyTimestamp: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  historyComment: {
    fontStyle: 'italic',
  },
});

export default IssueDetails;
