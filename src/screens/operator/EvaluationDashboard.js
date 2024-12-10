import React, { useState, useMemo, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button,
  SegmentedButtons,
  DataTable,
  useTheme,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, eachWeekOfInterval, endOfWeek, subMonths } from 'date-fns';
import { fetchReports } from '../../store/slices/reportsSlice';

const EvaluationDashboard = () => {
  const { reports, loading } = useSelector((state) => state.reports);
  const { user } = useSelector((state) => state.auth);
  const theme = useTheme();
  const dispatch = useDispatch();
  const [timeRange, setTimeRange] = useState('week');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    if (user?.uid) {
      dispatch(fetchReports());
    }
  }, [dispatch, user]);

  const filteredReports = useMemo(() => {
    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case 'week':
        startDate = subDays(now, 7);
        break;
      case 'month':
        startDate = startOfMonth(now);
        break;
      case 'year':
        startDate = subDays(now, 365);
        break;
      default:
        startDate = subDays(now, 7);
    }

    return reports.filter(report => {
      const reportDate = new Date(report.createdAt);
      const matchesDate = reportDate >= startDate && reportDate <= now;
      const matchesCategory = categoryFilter === 'all' || report.category === categoryFilter;
      return matchesDate && matchesCategory;
    });
  }, [reports, timeRange, categoryFilter]);

  const getChartData = () => {
    const now = new Date();
    let labels;
    let data;

    switch (timeRange) {
      case 'week':
        labels = Array.from({ length: 7 }, (_, i) => 
          format(subDays(now, 6 - i), 'EEE')
        );
        data = labels.map(day => 
          filteredReports.filter(report => 
            format(new Date(report.createdAt), 'EEE') === day
          ).length
        );
        break;
      
      case 'month':
        // For month view, group by weeks instead of individual days
        const startOfMonthDate = startOfMonth(now);
        const weeksInMonth = eachWeekOfInterval({
          start: startOfMonthDate,
          end: endOfMonth(now)
        });
        
        labels = weeksInMonth.map((week, index) => {
          if (index === weeksInMonth.length - 1) {
            return 'Week ' + (index + 1);
          }
          return 'Week ' + (index + 1);
        });

        data = weeksInMonth.map(weekStart => {
          const weekEnd = endOfWeek(weekStart);
          return filteredReports.filter(report => {
            const reportDate = new Date(report.createdAt);
            return reportDate >= weekStart && reportDate <= weekEnd;
          }).length;
        });
        break;
      
      case 'year':
        labels = Array.from({ length: 12 }, (_, i) => 
          format(subMonths(now, 11 - i), 'MMM')
        );
        data = labels.map(month => 
          filteredReports.filter(report => 
            format(new Date(report.createdAt), 'MMM') === month
          ).length
        );
        break;
      
      default:
        labels = [];
        data = [];
    }

    return {
      labels,
      datasets: [{ 
        data,
        color: (opacity = 1) => `rgba(98, 0, 238, ${opacity})`, // Primary color
        strokeWidth: 2
      }],
    };
  };

  const getAnalytics = () => {
    const total = filteredReports.length;
    const resolved = filteredReports.filter(report => report.status === 'resolved').length;
    const avgResolutionTime = filteredReports
      .filter(report => report.status === 'resolved')
      .reduce((acc, report) => {
        const created = new Date(report.createdAt);
        const resolved = new Date(report.updatedAt);
        return acc + (resolved - created) / (1000 * 60 * 60); // hours
      }, 0) / (resolved || 1);

    const categoryBreakdown = {
      hardware: filteredReports.filter(report => report.category === 'hardware').length,
      software: filteredReports.filter(report => report.category === 'software').length,
    };

    return {
      total,
      resolved,
      resolutionRate: total ? (resolved / total * 100).toFixed(1) : 0,
      avgResolutionTime: avgResolutionTime.toFixed(1),
      categoryBreakdown,
    };
  };

  const analytics = getAnalytics();
  const chartData = getChartData();

  const pieChartData = [
    {
      name: 'Pending',
      population: filteredReports.filter(report => report.status === 'pending').length,
      color: '#FFA500',
      legendFontColor: '#7F7F7F',
    },
    {
      name: 'In Progress',
      population: filteredReports.filter(report => report.status === 'in_progress' || report.status === 'assigned').length,
      color: '#1E90FF',
      legendFontColor: '#7F7F7F',
    },
    {
      name: 'Resolved',
      population: filteredReports.filter(report => report.status === 'resolved').length,
      color: '#32CD32',
      legendFontColor: '#7F7F7F',
    },
    {
      name: 'Unresolved',
      population: filteredReports.filter(report => report.status === 'unresolved').length,
      color: '#FF6B6B',
      legendFontColor: '#7F7F7F',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.filters}>
        <SegmentedButtons
          value={timeRange}
          onValueChange={setTimeRange}
          buttons={[
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' },
            { value: 'year', label: 'Year' },
          ]}
          style={styles.segmentedButton}
        />

        <SegmentedButtons
          value={categoryFilter}
          onValueChange={setCategoryFilter}
          buttons={[
            { value: 'all', label: 'All' },
            { value: 'hardware', label: 'Hardware' },
            { value: 'software', label: 'Software' },
          ]}
          style={styles.segmentedButton}
        />
      </View>

      <Card style={styles.tableCard}>
        <Card.Content>
          <Title>Report Status Distribution</Title>
          <PieChart
            data={pieChartData}
            width={Dimensions.get('window').width - 64}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </Card.Content>
      </Card>

      <View style={styles.statsContainer}>
        <Card style={styles.statsCard}>
          <Card.Content>
            <Title>{analytics.total}</Title>
            <Paragraph>Total Reports</Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.statsCard}>
          <Card.Content>
            <Title>{analytics.resolutionRate}%</Title>
            <Paragraph>Resolution Rate</Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.statsCard}>
          <Card.Content>
            <Title>{analytics.avgResolutionTime}h</Title>
            <Paragraph>Avg. Resolution Time</Paragraph>
          </Card.Content>
        </Card>
      </View>

      <Card style={styles.chartCard}>
        <Card.Content>
          <Title>{timeRange === 'month' ? 'Reports by Week' : 'Report Trends'}</Title>
          <LineChart
            data={chartData}
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
              propsForLabels: {
                fontSize: 10,
              },
              spacing: timeRange === 'month' ? 50 : 40,
            }}
            bezier
            style={styles.lineChart}
          />
        </Card.Content>
      </Card>

      <Card style={styles.breakdownCard}>
        <Card.Content>
          <Title>Category Breakdown</Title>
          <BarChart
            data={{
              labels: ['Hardware', 'Software'],
              datasets: [{
                data: [
                  analytics.categoryBreakdown.hardware,
                  analytics.categoryBreakdown.software,
                ],
              }],
            }}
            width={Dimensions.get('window').width - 64}
            height={220}
            chartConfig={{
              backgroundColor: theme.colors.surface,
              backgroundGradientFrom: theme.colors.surface,
              backgroundGradientTo: theme.colors.surface,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            style={styles.chart}
          />
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  filters: {
    padding: 16,
    backgroundColor: '#fff',
    elevation: 4,
  },
  segmentedButton: {
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
  },
  statsCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  chartCard: {
    margin: 16,
    marginTop: 8,
  },
  breakdownCard: {
    margin: 16,
    marginTop: 8,
  },
  tableCard: {
    margin: 16,
    marginTop: 8,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  lineChart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default EvaluationDashboard;
