import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Chip, Text, IconButton, Colors } from 'react-native-paper';
import { format } from 'date-fns';

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return '#FFA726'; // Orange
    case 'in_progress':
      return '#42A5F5'; // Blue
    case 'completed':
      return '#66BB6A'; // Green
    case 'unresolved':
      return '#EF5350'; // Red
    default:
      return '#9E9E9E'; // Grey
  }
};

const ReportCard = ({ report, onPress, showActions = true }) => {
  const formattedDate = report.createdAt ? 
    format(report.createdAt.toDate(), 'dd MMM yyyy HH:mm') : 
    'Date not available';

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <View style={styles.header}>
          <Title>{report.title}</Title>
          <Chip 
            style={[styles.statusChip, { backgroundColor: getStatusColor(report.status) }]}
            textStyle={styles.statusText}
          >
            {report.status.toUpperCase()}
          </Chip>
        </View>

        <Paragraph style={styles.description}>{report.description}</Paragraph>

        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Text style={styles.label}>Location:</Text>
            <Text>{report.location}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.label}>Category:</Text>
            <Text>{report.category}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.timestamp}>{formattedDate}</Text>
          {showActions && (
            <View style={styles.actions}>
              <IconButton
                icon="history"
                size={20}
                onPress={() => onPress('history')}
                style={styles.actionButton}
              />
              <IconButton
                icon="information"
                size={20}
                onPress={() => onPress('details')}
                style={styles.actionButton}
              />
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusChip: {
    height: 28,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  description: {
    marginBottom: 12,
  },
  details: {
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: Colors.grey600,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    margin: 0,
  },
});

export default ReportCard;
