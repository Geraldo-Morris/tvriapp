import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Button, Text, Chip, Divider, Searchbar, Menu, Portal, Modal, TextInput } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { fetchReports } from '../../store/slices/reportsSlice';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, isWithinInterval, parseISO } from 'date-fns';

const ManageReports = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { reports, loading, error } = useSelector((state) => state.reports);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  // Protect operator screens
  useEffect(() => {
    if (user?.role !== 'operator') {
      console.log('Non-operator user attempting to access operator screen, redirecting...');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
      return;
    }
  }, [user, navigation]);

  useEffect(() => {
    if (user?.role === 'operator') {
      console.log('ManageReports mounted, fetching reports...');
      dispatch(fetchReports());
    }
  }, [dispatch, user]);

  const handleStartDateChange = (event, selectedDate) => {
    setShowStartDate(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const handleEndDateChange = (event, selectedDate) => {
    setShowEndDate(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const filterReports = () => {
    if (!reports) return [];

    return reports.filter(report => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        report.title?.toLowerCase().includes(searchLower) ||
        report.description?.toLowerCase().includes(searchLower) ||
        report.category?.toLowerCase().includes(searchLower) ||
        report.status?.toLowerCase().includes(searchLower);

      // Status filter
      const matchesStatus = statusFilter === 'all' || report.status === statusFilter;

      // Date filter
      let matchesDate = true;
      if (startDate || endDate) {
        const reportDate = parseISO(report.createdAt);
        if (startDate && endDate) {
          matchesDate = isWithinInterval(reportDate, { start: startDate, end: endDate });
        } else if (startDate) {
          matchesDate = reportDate >= startDate;
        } else if (endDate) {
          matchesDate = reportDate <= endDate;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  };

  const renderReports = () => {
    if (loading) {
      return (
        <Card style={styles.card}>
          <Card.Content>
            <Title>Loading reports...</Title>
          </Card.Content>
        </Card>
      );
    }

    if (error) {
      return (
        <Card style={styles.card}>
          <Card.Content>
            <Title>Error</Title>
            <Paragraph>{error}</Paragraph>
          </Card.Content>
        </Card>
      );
    }

    const filteredReports = filterReports();

    if (filteredReports.length === 0) {
      return (
        <Card style={styles.card}>
          <Card.Content>
            <Title>No Reports Found</Title>
            <Paragraph>No reports match your search criteria.</Paragraph>
          </Card.Content>
        </Card>
      );
    }

    return filteredReports.map((report) => (
      <Card
        key={report.id}
        style={styles.card}
        onPress={() => {
          navigation.navigate('Issue Details', { issueId: report.id });
        }}
      >
        <Card.Content>
          <Title>{report.title}</Title>
          <Paragraph>{report.description}</Paragraph>
          <View style={styles.chipContainer}>
            <Chip style={styles.chip}>{report.status}</Chip>
            {report.technicianName && (
              <Chip style={styles.chip}>Assigned: {report.technicianName}</Chip>
            )}
            <Chip style={styles.chip}>
              {format(parseISO(report.createdAt), 'MMM dd, yyyy')}
            </Chip>
          </View>
        </Card.Content>
      </Card>
    ));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.header, { backgroundColor: '#ffffff', padding: 16 }]}>
        <Searchbar
          placeholder="Search reports..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor="#000000"
          inputStyle={{ color: '#000000' }}
          placeholderTextColor="#666666"
        />
        
        <View style={styles.filterContainer}>
          {/* Status Filter */}
          <View style={styles.statusFilterContainer}>
            <Menu
              visible={showStatusMenu}
              onDismiss={() => setShowStatusMenu(false)}
              anchor={
                <Button 
                  mode="outlined" 
                  onPress={() => setShowStatusMenu(true)}
                  style={styles.filterButton}
                  contentStyle={styles.statusButtonContent}
                  labelStyle={styles.statusButtonLabel}
                >
                  Status: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                </Button>
              }
              contentStyle={styles.menuContent}
            >
              <Menu.Item 
                onPress={() => { setStatusFilter('all'); setShowStatusMenu(false); }} 
                title="All" 
                style={styles.menuItem}
                titleStyle={[styles.menuItemText, statusFilter === 'all' && styles.selectedMenuItem]}
              />
              <Menu.Item 
                onPress={() => { setStatusFilter('pending'); setShowStatusMenu(false); }} 
                title="Pending" 
                style={styles.menuItem}
                titleStyle={[styles.menuItemText, statusFilter === 'pending' && styles.selectedMenuItem]}
              />
              <Menu.Item 
                onPress={() => { setStatusFilter('in_progress'); setShowStatusMenu(false); }} 
                title="In Progress" 
                style={styles.menuItem}
                titleStyle={[styles.menuItemText, statusFilter === 'in_progress' && styles.selectedMenuItem]}
              />
              <Menu.Item 
                onPress={() => { setStatusFilter('resolved'); setShowStatusMenu(false); }} 
                title="Resolved" 
                style={styles.menuItem}
                titleStyle={[styles.menuItemText, statusFilter === 'resolved' && styles.selectedMenuItem]}
              />
              <Menu.Item 
                onPress={() => { setStatusFilter('unresolved'); setShowStatusMenu(false); }} 
                title="Unresolved" 
                style={styles.menuItem}
                titleStyle={[styles.menuItemText, statusFilter === 'unresolved' && styles.selectedMenuItem]}
              />
            </Menu>
          </View>

          {/* Date Filters */}
          <View style={styles.dateFilterContainer}>
            <View style={styles.dateButtonsRow}>
              <Button 
                mode="outlined" 
                onPress={() => setShowStartDate(true)}
                style={[styles.filterButton, styles.dateButton]}
              >
                {startDate ? format(startDate, 'MMM dd, yyyy') : 'Start Date'}
              </Button>

              <Button 
                mode="outlined" 
                onPress={() => setShowEndDate(true)}
                style={[styles.filterButton, styles.dateButton]}
              >
                {endDate ? format(endDate, 'MMM dd, yyyy') : 'End Date'}
              </Button>

              {(startDate || endDate) && (
                <Button 
                  mode="outlined" 
                  onPress={() => {
                    setStartDate(null);
                    setEndDate(null);
                  }}
                  style={[styles.filterButton, styles.dateButton]}
                >
                  Clear Dates
                </Button>
              )}
            </View>
          </View>
        </View>
      </View>

      {showStartDate && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display="default"
          onChange={handleStartDateChange}
        />
      )}

      {showEndDate && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          display="default"
          onChange={handleEndDateChange}
        />
      )}

      {renderReports()}
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
    marginBottom: 16,
  },
  searchBar: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  filterContainer: {
    width: '100%',
  },
  statusFilterContainer: {
    marginBottom: 16,
  },
  statusButtonContent: {
    height: 45,
    minWidth: 200,
  },
  statusButtonLabel: {
    fontSize: 16,
  },
  menuContent: {
    backgroundColor: '#fff',
    marginTop: 45,
    minWidth: 200,
    borderRadius: 4,
    elevation: 3,
  },
  menuItem: {
    height: 48,
    justifyContent: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: '#000',
  },
  selectedMenuItem: {
    color: '#1a73e8',
    fontWeight: 'bold',
  },
  dateFilterContainer: {
    width: '100%',
    alignItems: 'center',
  },
  dateButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  dateButton: {
    minWidth: 140,
    backgroundColor: '#fff',
  },
  card: {
    marginBottom: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  chip: {
    marginRight: 8,
  },
  errorText: {
    color: 'red',
  },
});

export default ManageReports;
