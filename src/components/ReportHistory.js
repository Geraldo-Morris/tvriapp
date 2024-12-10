import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Surface, Title, Divider, useTheme } from 'react-native-paper';
import { format } from 'date-fns';

const HistoryItem = ({ item }) => {
  const theme = useTheme();
  const formattedDate = item.timestamp ? 
    format(item.timestamp.toDate(), 'dd MMM yyyy HH:mm') : 
    'Date not available';

  return (
    <Surface style={styles.historyItem}>
      <View style={styles.historyHeader}>
        <Text style={[styles.status, { color: theme.colors.primary }]}>
          {item.status.toUpperCase()}
        </Text>
        <Text style={styles.timestamp}>{formattedDate}</Text>
      </View>
      <Text style={styles.comment}>{item.comment}</Text>
      {item.solution && (
        <View style={styles.solutionContainer}>
          <Text style={styles.solutionLabel}>Solution:</Text>
          <Text style={styles.solution}>{item.solution}</Text>
        </View>
      )}
      <Text style={styles.updatedBy}>Updated by: {item.updatedBy}</Text>
    </Surface>
  );
};

const ReportHistory = ({ history }) => {
  return (
    <ScrollView style={styles.container}>
      <Title style={styles.title}>Report History</Title>
      <Divider style={styles.divider} />
      {history.map((item, index) => (
        <View key={index}>
          <HistoryItem item={item} />
          {index < history.length - 1 && (
            <View style={styles.timeline}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineLine} />
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 16,
  },
  divider: {
    marginBottom: 24,
  },
  historyItem: {
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  status: {
    fontWeight: 'bold',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  comment: {
    marginBottom: 8,
  },
  solutionContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  solutionLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  solution: {
    fontStyle: 'italic',
  },
  updatedBy: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
  },
  timeline: {
    alignItems: 'center',
    marginVertical: 8,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1D3365',
  },
  timelineLine: {
    width: 2,
    height: 24,
    backgroundColor: '#1D3365',
  },
});

export default ReportHistory;
