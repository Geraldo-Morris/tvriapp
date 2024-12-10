import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Pressable } from 'react-native';
import { Card, Title, Paragraph, Button, Surface, useTheme } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { LineChart } from 'react-native-chart-kit';
import { format, subDays } from 'date-fns';
import { logoutAsync } from '../../store/slices/authSlice';
import { fetchReports } from '../../store/slices/reportsSlice';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const OperatorDashboard = ({ navigation }) => {
  const { reports, loading } = useSelector((state) => state.reports);
  const { user } = useSelector((state) => state.auth);
  const theme = useTheme();
  const dispatch = useDispatch();

  useEffect(() => {
    if (user?.uid) {
      dispatch(fetchReports());
    }
  }, [dispatch, user]);

  const getStatistics = () => {
    if (!Array.isArray(reports)) {
      return {
        total: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0,
        unresolved: 0,
        hardware: 0,
        software: 0
      };
    }

    const total = reports.length;
    const pending = reports.filter(i => i?.status === 'pending').length;
    const inProgress = reports.filter(i => i?.status === 'in_progress' || i?.status === 'assigned').length;
    const resolved = reports.filter(i => i?.status === 'resolved').length;
    const unresolved = reports.filter(i => i?.status === 'unresolved').length;
    const hardware = reports.filter(i => i?.category === 'hardware').length;
    const software = reports.filter(i => i?.category === 'software').length;
    
    return { total, pending, inProgress, resolved, unresolved, hardware, software };
  };

  const getRecentTrends = () => {
    if (!Array.isArray(reports)) {
      return {
        labels: [],
        datasets: [{ data: [] }]
      };
    }

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), i);
      return format(date, 'MMM dd');
    }).reverse();

    const dailyCounts = last7Days.map(day => {
      return reports.filter(report => 
        report?.createdAt && format(new Date(report.createdAt), 'MMM dd') === day
      ).length;
    });

    return {
      labels: last7Days,
      datasets: [{ data: dailyCounts }],
    };
  };

  const stats = getStatistics();
  const trends = getRecentTrends();

  const handleLogout = () => {
    dispatch(logoutAsync());
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={[styles.header, { backgroundColor: '#ffffff' }]}>
        <View style={styles.headerContent}>
          <Title style={{ color: '#000000' }}>Welcome, {user.displayName}!</Title>
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

      <View style={styles.statsContainer}>
        {/* Total Reports Card - Full Width */}
        <Card style={[styles.totalCard, { borderLeftColor: '#1a237e' }]}>
          <Card.Content style={styles.statsContent}>
            <View style={[styles.statsIconContainer, { backgroundColor: '#E8EAF6' }]}>
              <MaterialCommunityIcons name="file-document-multiple" size={24} color="#1a237e" />
            </View>
            <View style={styles.statsTextContainer}>
              <Title style={[styles.statsNumber, { color: '#1a237e' }]}>{stats.total}</Title>
              <Paragraph style={styles.statsLabel}>Total Reports</Paragraph>
            </View>
          </Card.Content>
        </Card>

        {/* Status Cards Row */}
        <View style={styles.statusCardsRow}>
          {/* Pending Card */}
          <Card style={[styles.statsCard, { borderLeftColor: '#FFA500' }]}>
            <Card.Content style={styles.statsContent}>
              <View style={[styles.statsIconContainer, { backgroundColor: '#FFF5E6' }]}>
                <MaterialCommunityIcons name="clock-outline" size={24} color="#FFA500" />
              </View>
              <View style={styles.statsTextContainer}>
                <Title style={[styles.statsNumber, { color: '#FFA500' }]}>{stats.pending}</Title>
                <Paragraph style={styles.statsLabel}>Pending</Paragraph>
                <Paragraph style={styles.statsPercentage}>
                  {stats.total > 0 ? `${Math.round((stats.pending / stats.total) * 100)}%` : '0%'}
                </Paragraph>
              </View>
            </Card.Content>
          </Card>

          {/* In Progress Card */}
          <Card style={[styles.statsCard, { borderLeftColor: '#1E90FF' }]}>
            <Card.Content style={styles.statsContent}>
              <View style={[styles.statsIconContainer, { backgroundColor: '#E6F3FF' }]}>
                <MaterialCommunityIcons name="progress-wrench" size={24} color="#1E90FF" />
              </View>
              <View style={styles.statsTextContainer}>
                <Title style={[styles.statsNumber, { color: '#1E90FF' }]}>{stats.inProgress}</Title>
                <Paragraph style={styles.statsLabel}>In Progress</Paragraph>
                <Paragraph style={styles.statsPercentage}>
                  {stats.total > 0 ? `${Math.round((stats.inProgress / stats.total) * 100)}%` : '0%'}
                </Paragraph>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Resolution Status Row */}
        <View style={styles.statusCardsRow}>
          {/* Resolved Card */}
          <Card style={[styles.statsCard, { borderLeftColor: '#32CD32' }]}>
            <Card.Content style={styles.statsContent}>
              <View style={[styles.statsIconContainer, { backgroundColor: '#F0FFF0' }]}>
                <MaterialCommunityIcons name="check-circle-outline" size={24} color="#32CD32" />
              </View>
              <View style={styles.statsTextContainer}>
                <Title style={[styles.statsNumber, { color: '#32CD32' }]}>{stats.resolved}</Title>
                <Paragraph style={styles.statsLabel}>Resolved</Paragraph>
                <Paragraph style={styles.statsPercentage}>
                  {stats.total > 0 ? `${Math.round((stats.resolved / stats.total) * 100)}%` : '0%'}
                </Paragraph>
              </View>
            </Card.Content>
          </Card>

          {/* Unresolved Card */}
          <Card style={[styles.statsCard, { borderLeftColor: '#FF6B6B' }]}>
            <Card.Content style={styles.statsContent}>
              <View style={[styles.statsIconContainer, { backgroundColor: '#FFE6E6' }]}>
                <MaterialCommunityIcons name="alert-circle-outline" size={24} color="#FF6B6B" />
              </View>
              <View style={styles.statsTextContainer}>
                <Title style={[styles.statsNumber, { color: '#FF6B6B' }]}>{stats.unresolved}</Title>
                <Paragraph style={[styles.statsLabel, { minWidth: 85 }]}>Unresolved</Paragraph>
                <Paragraph style={styles.statsPercentage}>
                  {stats.total > 0 ? `${Math.round((stats.unresolved / stats.total) * 100)}%` : '0%'}
                </Paragraph>
              </View>
            </Card.Content>
          </Card>
        </View>
      </View>

      <Card style={styles.chartCard}>
        <Card.Content>
          <Title>Report Trends (Last 7 Days)</Title>
          <LineChart
            data={trends}
            width={Dimensions.get('window').width - 64}
            height={220}
            chartConfig={{
              backgroundColor: theme.colors.surface,
              backgroundGradientFrom: theme.colors.surface,
              backgroundGradientTo: theme.colors.surface,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(98, 0, 238, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: theme.colors.primary,
              },
            }}
            bezier
            style={styles.lineChart}
          />
        </Card.Content>
      </Card>

      <View style={styles.actionButtons}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Manage Reports')}
          style={styles.button}
          icon="clipboard-list"
        >
          Manage Reports
        </Button>

        <Button
          mode="contained"
          onPress={() => navigation.navigate('Evaluation')}
          style={styles.button}
          icon="chart-bar"
        >
          Detailed Analytics
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  welcome: {
    fontSize: 24,
    flex: 1,
  },
  logoutButton: {
    marginLeft: 16,
  },
  statsContainer: {
    padding: 16,
  },
  totalCard: {
    marginBottom: 16,
    elevation: 4,
    borderLeftWidth: 4,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  statusCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statsCard: {
    flex: 1,
    marginHorizontal: 8,
    elevation: 4,
    borderLeftWidth: 4,
    backgroundColor: '#fff',
    borderRadius: 12,
    minWidth: 150,
  },
  statsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  statsIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  statsTextContainer: {
    flex: 1,
    flexDirection: 'column',
    flexWrap: 'nowrap',
  },
  statsNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
    flexShrink: 0,
  },
  statsPercentage: {
    fontSize: 12,
    color: '#999',
  },
  chartCard: {
    margin: 16,
    marginTop: 8,
  },
  lineChart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  actionButtons: {
    padding: 16,
    paddingTop: 0,
  },
  button: {
    marginBottom: 12,
  },
});

export default OperatorDashboard;
