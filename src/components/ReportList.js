import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Modal, Portal, Text, Button, Searchbar } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import ReportCard from './ReportCard';
import ReportHistory from './ReportHistory';
import { fetchReports } from '../store/slices/reportsSlice';

const ReportList = ({ onReportPress }) => {
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);

  const { reports, loading } = useSelector(state => state.reports);
  const currentUser = useSelector(state => state.auth.user);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchReports({ 
      userId: currentUser.uid, 
      role: currentUser.role 
    }));
    setRefreshing(false);
  }, [dispatch, currentUser]);

  const filteredReports = reports.filter(report => {
    const searchLower = searchQuery.toLowerCase();
    return (
      report.title.toLowerCase().includes(searchLower) ||
      report.description.toLowerCase().includes(searchLower) ||
      report.location.toLowerCase().includes(searchLower) ||
      report.category.toLowerCase().includes(searchLower)
    );
  });

  const handleReportPress = (report, action) => {
    if (action === 'history') {
      setSelectedReport(report);
      setHistoryModalVisible(true);
    } else if (action === 'details') {
      onReportPress?.(report);
    }
  };

  const renderItem = ({ item }) => (
    <ReportCard
      report={item}
      onPress={(action) => handleReportPress(item, action)}
    />
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search reports..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <FlatList
        data={filteredReports}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        contentContainerStyle={styles.listContent}
      />

      <Portal>
        <Modal
          visible={historyModalVisible}
          onDismiss={() => setHistoryModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          {selectedReport && (
            <>
              <Text style={styles.modalTitle}>{selectedReport.title}</Text>
              <ReportHistory history={selectedReport.history} />
              <Button 
                mode="contained" 
                onPress={() => setHistoryModalVisible(false)}
                style={styles.closeButton}
              >
                Close
              </Button>
            </>
          )}
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchbar: {
    margin: 16,
    elevation: 4,
  },
  listContent: {
    paddingBottom: 16,
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 8,
    height: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  closeButton: {
    marginTop: 16,
  },
});

export default ReportList;
