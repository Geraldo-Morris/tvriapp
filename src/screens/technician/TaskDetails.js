import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, Text } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  TextInput,
  Portal,
  Modal,
  List,
  Divider,
  SegmentedButtons,
  useTheme,
  IconButton,
  Surface,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { updateReportStatus } from '../../store/slices/reportsSlice';
import { format } from 'date-fns';

const TaskDetails = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { reports } = useSelector((state) => state.reports);
  const { user } = useSelector((state) => state.auth);
  const [selectedReport, setSelectedReport] = useState(null);
  const [comment, setComment] = useState('');
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (route.params?.taskId) {
      const report = reports.find(r => r.id === route.params.taskId);
      if (report) {
        setSelectedReport(report);
      }
    }
  }, [route.params?.taskId, reports]);

  const handleStatusUpdate = async (newStatus) => {
    if (newStatus === 'resolved') {
      if (!comment.trim()) {
        alert('Please provide a comment before marking the report as resolved.');
        return;
      }
      setStatusModalVisible(false);
      setConfirmModalVisible(true);
      return;
    }

    setLoading(true);
    try {
      await dispatch(updateReportStatus({
        reportId: selectedReport.id,
        status: newStatus,
        technicianId: user.uid,
        comment: comment.trim() || `Marked as ${newStatus}`
      })).unwrap();
      setStatusModalVisible(false);
    } catch (error) {
      alert('Error updating status: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmResolve = async () => {
    setLoading(true);
    try {
      await dispatch(updateReportStatus({
        reportId: selectedReport.id,
        status: 'resolved',
        technicianId: user.uid,
        comment: comment.trim() || 'Issue resolved'
      })).unwrap();
      setConfirmModalVisible(false);
    } catch (error) {
      alert('Error resolving report: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedReport) {
    return (
      <Card style={styles.container}>
        <Card.Content>
          <Title>No task selected</Title>
          <Paragraph>Please select a task from the dashboard.</Paragraph>
        </Card.Content>
      </Card>
    );
  }

  const renderStatusModal = () => (
    <Portal>
      <Modal
        visible={statusModalVisible}
        onDismiss={() => setStatusModalVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <Title style={styles.modalTitle}>Update Report Status</Title>
          <Divider style={styles.divider} />
          
          <View style={styles.statusOptions}>
            <Button
              mode={selectedReport.status === 'in_progress' ? "contained" : "outlined"}
              onPress={() => handleStatusUpdate('in_progress')}
              style={[
                styles.statusButton,
                selectedReport.status === 'in_progress' && styles.activeStatusButton,
                { borderColor: '#2196F3' }
              ]}
              labelStyle={[
                styles.statusButtonLabel,
                selectedReport.status === 'in_progress' && styles.activeStatusButtonLabel
              ]}
              disabled={selectedReport.status === 'resolved' || selectedReport.status === 'unresolved'}
            >
              📝 In Progress
            </Button>

            <Button
              mode={selectedReport.status === 'resolved' ? "contained" : "outlined"}
              onPress={() => handleStatusUpdate('resolved')}
              style={[
                styles.statusButton,
                selectedReport.status === 'resolved' && styles.activeStatusButton,
                { borderColor: '#4CAF50' }
              ]}
              labelStyle={[
                styles.statusButtonLabel,
                selectedReport.status === 'resolved' && styles.activeStatusButtonLabel
              ]}
              disabled={!comment.trim()}
            >
              ✅ Resolved
            </Button>

            <Button
              mode={selectedReport.status === 'unresolved' ? "contained" : "outlined"}
              onPress={() => handleStatusUpdate('unresolved')}
              style={[
                styles.statusButton,
                selectedReport.status === 'unresolved' && styles.activeStatusButton,
                { borderColor: '#F44336' }
              ]}
              labelStyle={[
                styles.statusButtonLabel,
                selectedReport.status === 'unresolved' && styles.activeStatusButtonLabel
              ]}
              disabled={!comment.trim()}
            >
              ❌ Unresolved
            </Button>
          </View>

          {!comment.trim() && (
            <Paragraph style={styles.warningText}>
              ⚠️ Please provide a comment before marking as resolved/unresolved
            </Paragraph>
          )}

          <Button
            mode="text"
            onPress={() => setStatusModalVisible(false)}
            style={styles.closeButton}
          >
            Close
          </Button>
        </View>
      </Modal>
    </Portal>
  );

  const renderConfirmationModal = () => (
    <Portal>
      <Modal
        visible={confirmModalVisible}
        onDismiss={() => setConfirmModalVisible(false)}
        contentContainerStyle={styles.confirmModalContainer}
      >
        <View style={styles.confirmModalContent}>
          <Title style={styles.confirmTitle}>Confirm Resolution</Title>
          <Paragraph style={styles.confirmText}>
            Are you sure you want to mark this in-progress report as resolved?
          </Paragraph>
          <Paragraph style={[styles.confirmText, { marginTop: 0, color: '#666' }]}>
            This will complete the report and mark it as successfully resolved.
          </Paragraph>
          <View style={styles.confirmButtons}>
            <Button 
              mode="outlined" 
              onPress={() => setConfirmModalVisible(false)}
              style={styles.cancelButton}
              labelStyle={styles.cancelButtonLabel}
            >
              Cancel
            </Button>
            <Button 
              mode="contained" 
              onPress={handleConfirmResolve}
              loading={loading}
              style={[styles.confirmButton, { backgroundColor: '#4CAF50' }]}
              labelStyle={styles.confirmButtonLabel}
            >
              Confirm
            </Button>
          </View>
        </View>
      </Modal>
    </Portal>
  );

  return (
    <ScrollView style={styles.container}>
      <Surface style={[styles.header, { backgroundColor: '#ffffff' }]}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          iconColor="#000000"
        />
        <Title style={[styles.headerTitle, { color: '#000000' }]}>Report Details</Title>
      </Surface>
      {renderStatusModal()}
      {renderConfirmationModal()}
      <Card style={styles.taskCard}>
        <Card.Content>
          <View style={styles.titleContainer}>
            <View style={styles.titleAndStatus}>
              <Title style={styles.title}>
                {selectedReport.title.split(new Date(selectedReport.createdAt).toLocaleTimeString())[0].trim()}
              </Title>
              <View style={[
                styles.statusContainer,
                {
                  borderColor: selectedReport.status === 'resolved' ? '#4CAF50' :
                              selectedReport.status === 'in_progress' ? '#2196F3' :
                              selectedReport.status === 'pending' ? '#FF9800' :
                              selectedReport.status === 'unresolved' ? '#F44336' : '#757575',
                  backgroundColor: selectedReport.status === 'resolved' ? '#E8F5E9' :
                                 selectedReport.status === 'in_progress' ? '#E3F2FD' :
                                 selectedReport.status === 'pending' ? '#FFF3E0' :
                                 selectedReport.status === 'unresolved' ? '#FFEBEE' : '#F5F5F5'
                }
              ]}>
                <Text style={[
                  styles.statusText,
                  {
                    color: selectedReport.status === 'resolved' ? '#4CAF50' :
                           selectedReport.status === 'in_progress' ? '#2196F3' :
                           selectedReport.status === 'pending' ? '#FF9800' :
                           selectedReport.status === 'unresolved' ? '#F44336' : '#757575'
                  }
                ]}>
                  {selectedReport.status.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </Text>
              </View>
            </View>
            <Text style={styles.dateText}>
              {format(new Date(selectedReport.createdAt), 'MMM dd, yyyy')}
            </Text>
            <Text style={styles.timeText}>
              {format(new Date(selectedReport.createdAt), 'hh:mm:ss aa')}
            </Text>
          </View>

          <View style={styles.section}>
            <Title style={styles.sectionTitle}>Details</Title>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Category:</Text>
              <Text style={styles.value}>
                {selectedReport.category?.charAt(0).toUpperCase() + selectedReport.category?.slice(1)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Location:</Text>
              <Text style={styles.value}>Floor {selectedReport.location.floor}, Room {selectedReport.location.room}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Reported:</Text>
              <Text style={styles.value}>{format(new Date(selectedReport.createdAt), 'MMM dd, yyyy HH:mm')}</Text>
            </View>
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionLabel}>Description: </Text>
            <Text style={styles.descriptionText}>{selectedReport.description}</Text>
          </View>

          <View style={styles.locationContainer}>
            <Text style={styles.locationText}>
              Location: Floor {selectedReport.location.floor}, Room {selectedReport.location.room}
            </Text>
          </View>
          
          <Divider style={styles.divider} />
          
          <TextInput
            label="Comment"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={2}
            mode="outlined"
            style={styles.input}
            disabled={selectedReport.status === 'resolved' || selectedReport.status === 'unresolved'}
          />

          {selectedReport.status !== 'resolved' && selectedReport.status !== 'unresolved' && (
            <Button
              mode="contained"
              onPress={() => setStatusModalVisible(true)}
              style={styles.updateButton}
              loading={loading}
            >
              Update Status
            </Button>
          )}

          <Title style={styles.historyTitle}>History</Title>
          <ScrollView style={styles.historyList}>
            {selectedReport.history?.map((entry, index) => (
              <View key={index} style={styles.historyItem}>
                <Text style={styles.historyStatus}>
                  {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                </Text>
                <Text style={styles.historyComment}>{entry.comment}</Text>
                <Text style={styles.historyDate}>
                  {format(new Date(entry.timestamp), 'MMM dd, yyyy HH:mm')}
                </Text>
              </View>
            ))}
          </ScrollView>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    marginTop: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingVertical: 12,
    elevation: 4,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  backButton: {
    marginLeft: 4,
  },
  headerTitle: {
    marginLeft: 8,
  },
  taskCard: {
    margin: 16,
  },
  titleContainer: {
    marginBottom: 16,
  },
  titleAndStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 8,
    flex: 1,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 14,
    color: '#666',
  },
  descriptionContainer: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  descriptionLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  descriptionText: {
    fontSize: 16,
    flex: 1,
    marginLeft: 4,
  },
  locationContainer: {
    marginBottom: 16,
  },
  locationText: {
    fontSize: 16,
    color: '#666',
  },
  divider: {
    marginVertical: 16,
  },
  input: {
    marginBottom: 16,
  },
  updateButton: {
    flex: 1,
    marginHorizontal: 16,
  },
  historyTitle: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 8,
  },
  historyList: {
    maxHeight: 200,
  },
  historyItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  historyStatus: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyComment: {
    fontSize: 14,
    color: '#666',
  },
  historyDate: {
    fontSize: 12,
    color: '#999',
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 16,
    padding: 0,
    overflow: 'hidden',
  },
  modalContent: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1a237e',
    marginBottom: 8,
  },
  statusOptions: {
    gap: 12,
    marginBottom: 16,
  },
  statusButton: {
    borderWidth: 2,
    borderRadius: 8,
    marginVertical: 4,
    height: 48,
    justifyContent: 'center',
  },
  activeStatusButton: {
    borderWidth: 0,
  },
  statusButtonLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  activeStatusButtonLabel: {
    color: 'white',
  },
  warningText: {
    color: '#FF9800',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
    fontSize: 14,
  },
  closeButton: {
    marginTop: 8,
  },
  confirmModalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 16,
    padding: 0,
    overflow: 'hidden',
  },
  confirmModalContent: {
    padding: 24,
  },
  confirmTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 16,
    textAlign: 'center',
  },
  confirmText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  confirmButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 0.4,
    borderColor: '#666',
    borderRadius: 8,
    height: 48,
  },
  confirmButton: {
    flex: 0.6,
    borderRadius: 8,
    height: 48,
  },
  cancelButtonLabel: {
    fontSize: 16,
    color: '#666',
  },
  confirmButtonLabel: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  statusContainer: {
    padding: 8,
    borderRadius: 4,
    marginLeft: 16,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontWeight: 'bold',
    marginRight: 8,
    minWidth: 80,
  },
  value: {
    flex: 1,
  },
});

export default TaskDetails;
