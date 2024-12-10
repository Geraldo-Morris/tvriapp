import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, HelperText } from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Portal,
  Dialog,
  List,
  Avatar,
  Chip,
  Text,
  IconButton,
  TextInput,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import { updateReport, fetchReports } from '../../store/slices/reportsSlice';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';

const IssueDetails = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { reports, loading: reportsLoading } = useSelector((state) => state.reports);
  const { user } = useSelector((state) => state.auth);
  const [technicianMenuVisible, setTechnicianMenuVisible] = useState(false);
  const [confirmResolveVisible, setConfirmResolveVisible] = useState(false);
  const [confirmUnresolveVisible, setConfirmUnresolveVisible] = useState(false);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resolveComment, setResolveComment] = useState('');
  const [resolveError, setResolveError] = useState('');
  const [unresolveComment, setUnresolveComment] = useState('');
  const [unresolveError, setUnresolveError] = useState('');
  
  const issueId = route.params?.issueId;
  const issue = reports.find(i => i.id === issueId);

  // Debug logs
  useEffect(() => {
    console.log('=== IssueDetails Debug ===');
    console.log('Route params:', route.params);
    console.log('Issue ID:', issueId);
    console.log('Current user:', user);
    console.log('Reports in store:', reports);
    console.log('Found issue:', issue);
  }, [route.params, issueId, user, reports, issue]);

  useEffect(() => {
    if (user?.uid) {
      console.log('Fetching reports for issue details, issueId:', issueId);
      dispatch(fetchReports());
    }
  }, [dispatch, user, issueId]);

  useEffect(() => {
    if (!reportsLoading && !issue && issueId) {
      console.log('Issue not found:', issueId);
      console.log('Available reports:', reports.map(r => ({ id: r.id, title: r.title })));
      alert('Issue not found');
      navigation.navigate('Manage Reports');
    }
  }, [reportsLoading, issue, issueId, navigation, reports]);

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const fetchTechnicians = async () => {
    setLoading(true);
    try {
      const techniciansQuery = query(
        collection(db, 'users'),
        where('role', '==', 'technician')
      );
      const snapshot = await getDocs(techniciansQuery);
      const techniciansList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('Available technicians:', techniciansList);
      setTechnicians(techniciansList);
    } catch (error) {
      console.error('Error fetching technicians:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTechnician = async (selectedTechnician) => {
    try {
      if (!issue) return;

      const updatedReport = {
        id: issue.id,
        assignedTo: selectedTechnician.id,
        technicianName: selectedTechnician.displayName || selectedTechnician.name,
        status: 'assigned',
        assignedAt: new Date().toISOString(),
        history: [
          ...(issue.history || []),
          {
            status: 'assigned',
            timestamp: new Date().toISOString(),
            updatedBy: user.uid,
            action: 'assigned',
            comment: `Assigned to technician: ${selectedTechnician.displayName || selectedTechnician.name}`
          }
        ]
      };

      await dispatch(updateReport(updatedReport)).unwrap();
      console.log('Report assigned successfully');
      setTechnicianMenuVisible(false);
      navigation.navigate('Manage Reports');
    } catch (error) {
      console.error('Error assigning technician:', error);
    }
  };

  const handleResolve = async () => {
    try {
      if (!resolveComment.trim()) {
        setResolveError('Please provide a comment before resolving');
        return;
      }

      const updatedReport = {
        id: issue.id,
        status: 'resolved',
        resolvedAt: new Date().toISOString(),
        history: [
          ...(issue.history || []),
          {
            status: 'resolved',
            timestamp: new Date().toISOString(),
            updatedBy: user.uid,
            action: 'resolved',
            comment: resolveComment.trim()
          }
        ]
      };
      
      await dispatch(updateReport(updatedReport)).unwrap();
      console.log('Report resolved successfully');
      setConfirmResolveVisible(false);
      setResolveComment('');
      setResolveError('');
      navigation.navigate('Manage Reports');
    } catch (error) {
      console.error('Error resolving report:', error);
      setResolveError('Failed to resolve report. Please try again.');
    }
  };

  const handleUnresolve = async () => {
    try {
      if (!unresolveComment.trim()) {
        setUnresolveError('Please provide a comment before marking as unresolved');
        return;
      }

      const updatedReport = {
        id: issue.id,
        status: 'unresolved',
        unresolvedAt: new Date().toISOString(),
        history: [
          ...(issue.history || []),
          {
            status: 'unresolved',
            timestamp: new Date().toISOString(),
            updatedBy: user.uid,
            action: 'unresolved',
            comment: unresolveComment.trim()
          }
        ]
      };

      await dispatch(updateReport(updatedReport)).unwrap();
      console.log('Report marked as unresolved successfully');
      setConfirmUnresolveVisible(false);
      setUnresolveComment('');
      setUnresolveError('');
      navigation.navigate('Manage Reports');
    } catch (error) {
      console.error('Error marking report as unresolved:', error);
    }
  };

  const handleInProgress = async () => {
    try {
      const updatedReport = {
        id: issue.id,
        status: 'in_progress',
        history: [
          ...(issue.history || []),
          {
            status: 'in_progress',
            timestamp: new Date().toISOString(),
            updatedBy: user.uid,
            action: 'in_progress',
            comment: 'Work started on this issue'
          }
        ]
      };

      await dispatch(updateReport(updatedReport)).unwrap();
      console.log('Report marked as in progress successfully');
      navigation.navigate('Manage Reports');
    } catch (error) {
      console.error('Error marking report as in progress:', error);
    }
  };

  const getStatusColor = (status) => {
    if (!status) return '#999'; // Default gray for unknown status
    
    switch (status.toLowerCase()) {
      case 'pending':
        return '#FFA500';
      case 'assigned':
      case 'in_progress':
        return '#2196F3';
      case 'resolved':
        return '#4CAF50';
      case 'unresolved':
        return '#f44336';
      default:
        return '#999';
    }
  };

  if (!issue) {
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

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.headerBar, { backgroundColor: '#ffffff' }]}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.navigate('Manage Reports')}
          iconColor="#000000"
        />
        <Text style={[styles.headerTitle, { color: '#000000' }]}>Issue Details</Text>
      </View>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
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
          </View>

          <View style={styles.section}>
            <Title style={styles.sectionTitle}>Description</Title>
            <Paragraph>{issue.description}</Paragraph>
          </View>

          <View style={styles.section}>
            <Title style={styles.sectionTitle}>Details</Title>
            <List.Item
              title="Category"
              description={issue.category ? issue.category.charAt(0).toUpperCase() + issue.category.slice(1) : 'N/A'}
              left={props => <Avatar.Icon {...props} icon="shape" />}
            />
            <List.Item
              title="Location"
              description={issue.location ? `Floor ${issue.location.floor}, Room ${issue.location.room}` : 'N/A'}
              left={props => <Avatar.Icon {...props} icon="map-marker" />}
            />
            <List.Item
              title="Reported By"
              description={issue.reporterName || issue.reporterEmail || 'Unknown'}
              left={props => <Avatar.Icon {...props} icon="account" />}
            />
            <List.Item
              title="Reported At"
              description={format(new Date(issue.createdAt), 'PPpp')}
              left={props => <Avatar.Icon {...props} icon="clock" />}
            />
            {issue.assignedAt && (
              <List.Item
                title="Assigned At"
                description={format(new Date(issue.assignedAt), 'PPpp')}
                left={props => <Avatar.Icon {...props} icon="calendar-clock" />}
              />
            )}
            {issue.resolvedAt && (
              <List.Item
                title="Resolved At"
                description={format(new Date(issue.resolvedAt), 'PPpp')}
                left={props => <Avatar.Icon {...props} icon="check-circle" />}
              />
            )}
            {issue.unresolvedAt && issue.status === 'unresolved' && (
              <List.Item
                title="Marked Unresolved At"
                description={format(new Date(issue.unresolvedAt), 'PPpp')}
                left={props => <Avatar.Icon {...props} icon="close-circle" />}
              />
            )}
          </View>

          {issue.history && issue.history.length > 0 && (
            <View style={styles.section}>
              <Title style={styles.sectionTitle}>History</Title>
              {issue.history.map((entry, index) => (
                <List.Item
                  key={index}
                  title={entry.action ? `${entry.action.charAt(0).toUpperCase() + entry.action.slice(1)}` : 'Action'}
                  description={`${entry.comment || ''} ${entry.timestamp ? `- ${format(new Date(entry.timestamp), 'PPpp')}` : ''}`}
                  left={props => <Avatar.Icon {...props} icon="history" />}
                />
              ))}
            </View>
          )}
        </Card.Content>

        <View style={styles.actions}>
          {issue.status === 'pending' && (
            <Button
              mode="contained"
              onPress={() => setTechnicianMenuVisible(true)}
              style={styles.actionButton}
              icon="account-plus"
            >
              Assign Technician
            </Button>
          )}

          {(issue.status === 'in_progress' || issue.status === 'assigned') && (
            <>
              <Button
                mode="contained"
                onPress={() => setConfirmResolveVisible(true)}
                style={styles.actionButton}
                icon="check-circle"
              >
                Mark Resolved
              </Button>
              <Button
                mode="contained"
                onPress={() => setConfirmUnresolveVisible(true)}
                style={[styles.actionButton, { backgroundColor: '#FF6B6B' }]}
                icon="close-circle"
              >
                Mark Unresolved
              </Button>
            </>
          )}

          {issue.status === 'unresolved' && (
            <>
              <Button
                mode="contained"
                onPress={() => setTechnicianMenuVisible(true)}
                style={styles.actionButton}
                icon="account-plus"
              >
                Reassign Technician
              </Button>
              <Button
                mode="contained"
                onPress={() => setConfirmResolveVisible(true)}
                style={styles.actionButton}
                icon="check-circle"
              >
                Mark Resolved
              </Button>
            </>
          )}
        </View>
      </Card>

      <Portal>
        <Dialog
          visible={technicianMenuVisible}
          onDismiss={() => setTechnicianMenuVisible(false)}
        >
          <Dialog.Title>Assign Technician</Dialog.Title>
          <Dialog.Content>
            {loading ? (
              <Paragraph>Loading technicians...</Paragraph>
            ) : technicians.length === 0 ? (
              <Paragraph>No technicians available</Paragraph>
            ) : (
              <ScrollView>
                {technicians.map((technician) => (
                  <List.Item
                    key={technician.id}
                    title={technician.displayName || technician.name || technician.email}
                    description={technician.email}
                    left={props => <Avatar.Icon {...props} icon="account" />}
                    onPress={() => handleAssignTechnician(technician)}
                  />
                ))}
              </ScrollView>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setTechnicianMenuVisible(false)}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Portal>
        <Dialog
          visible={confirmResolveVisible}
          onDismiss={() => {
            setConfirmResolveVisible(false);
            setResolveComment('');
            setResolveError('');
          }}
        >
          <Dialog.Title>Confirm Resolution</Dialog.Title>
          <Dialog.Content>
            <Text>Please provide a comment explaining how the issue was resolved.</Text>
            <TextInput
              mode="outlined"
              label="Resolution Comment"
              value={resolveComment}
              onChangeText={setResolveComment}
              multiline
              numberOfLines={3}
              style={{ marginTop: 10 }}
              error={!!resolveError}
            />
            {resolveError ? <HelperText type="error">{resolveError}</HelperText> : null}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => {
              setConfirmResolveVisible(false);
              setResolveComment('');
              setResolveError('');
            }}>Cancel</Button>
            <Button onPress={handleResolve}>Confirm</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Portal>
        <Dialog
          visible={confirmUnresolveVisible}
          onDismiss={() => {
            setConfirmUnresolveVisible(false);
            setUnresolveComment('');
            setUnresolveError('');
          }}
        >
          <Dialog.Title>Confirm Unresolved Status</Dialog.Title>
          <Dialog.Content>
            <Text>Please provide a comment explaining why this issue is being marked as unresolved.</Text>
            <TextInput
              mode="outlined"
              label="Unresolved Comment"
              value={unresolveComment}
              onChangeText={setUnresolveComment}
              multiline
              numberOfLines={3}
              style={{ marginTop: 10 }}
              error={!!unresolveError}
            />
            {unresolveError ? <HelperText type="error">{unresolveError}</HelperText> : null}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => {
              setConfirmUnresolveVisible(false);
              setUnresolveComment('');
              setUnresolveError('');
            }}>Cancel</Button>
            <Button onPress={handleUnresolve}>Confirm</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 0,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 18,
    marginLeft: 16,
  },
  header: {
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
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    padding: 16,
  },
  actionButton: {
    marginRight: 8,
    marginBottom: 8,
  },
  backButton: {
    marginRight: 8,
  },
});

export default IssueDetails;
