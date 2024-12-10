import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  Portal, 
  Modal,
  List,
  Avatar,
  Searchbar,
  Chip,
  Divider,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { updateIssue } from '../../store/slices/issuesSlice';
import { format } from 'date-fns';
import mockTechnicians from '../../data/mockTechnicians';

const AssignTechnician = () => {
  const dispatch = useDispatch();
  const { issues } = useSelector((state) => state.issues);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [filterSpecialty, setFilterSpecialty] = useState('all');

  const unassignedIssues = issues.filter(issue => 
    !issue.technicianId && issue.status === 'pending'
  );

  const filteredIssues = unassignedIssues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         issue.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || issue.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredTechnicians = mockTechnicians.filter(tech => {
    const matchesSpecialty = filterSpecialty === 'all' || tech.specialty === filterSpecialty;
    const isAvailable = tech.availability === 'available';
    return matchesSpecialty && isAvailable;
  });

  const handleAssignTechnician = (technicianId) => {
    if (!selectedIssue) return;

    dispatch(updateIssue({
      ...selectedIssue,
      technicianId: technicianId,
      status: 'in_progress',
      assignedAt: new Date().toISOString(),
    }));
    
    setModalVisible(false);
    setSelectedIssue(null);
    setSelectedTechnician(null);
  };

  const renderTechnicianModal = () => (
    <Portal>
      <Modal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Title>Select Technician</Title>
        <Paragraph style={styles.modalSubtitle}>
          Issue: {selectedIssue?.title}
        </Paragraph>
        
        <View style={styles.filterChips}>
          <Chip
            selected={filterSpecialty === 'all'}
            onPress={() => setFilterSpecialty('all')}
            style={styles.filterChip}
          >
            All Specialties
          </Chip>
          <Chip
            selected={filterSpecialty === 'hardware'}
            onPress={() => setFilterSpecialty('hardware')}
            style={styles.filterChip}
          >
            Hardware
          </Chip>
          <Chip
            selected={filterSpecialty === 'software'}
            onPress={() => setFilterSpecialty('software')}
            style={styles.filterChip}
          >
            Software
          </Chip>
        </View>

        <Divider style={styles.divider} />
        
        <ScrollView>
          {filteredTechnicians.map((technician) => (
            <Card
              key={technician.id}
              style={[
                styles.technicianCard,
                selectedTechnician?.id === technician.id && styles.selectedTechnicianCard
              ]}
              onPress={() => setSelectedTechnician(technician)}
            >
              <Card.Content>
                <View style={styles.technicianHeader}>
                  <View style={styles.technicianInfo}>
                    <Avatar.Text 
                      size={40}
                      label={technician.name.split(' ').map(n => n[0]).join('')}
                    />
                    <View style={styles.technicianDetails}>
                      <Title>{technician.name}</Title>
                      <Paragraph>
                        Rating: {technician.rating} ★ | Active Issues: {technician.activeIssues}
                      </Paragraph>
                    </View>
                  </View>
                </View>
                <View style={styles.expertiseContainer}>
                  {technician.expertise.map((exp, index) => (
                    <Chip
                      key={index}
                      style={styles.expertiseChip}
                      textStyle={styles.expertiseText}
                    >
                      {exp}
                    </Chip>
                  ))}
                </View>
                <View style={styles.statsRow}>
                  <View style={styles.stat}>
                    <Text style={styles.statLabel}>Total Resolved</Text>
                    <Text style={styles.statValue}>{technician.totalResolved}</Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={styles.statLabel}>Avg Resolution Time</Text>
                    <Text style={styles.statValue}>{technician.avgResolutionTime}h</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>

        <View style={styles.modalActions}>
          <Button 
            mode="outlined" 
            onPress={() => {
              setModalVisible(false);
              setSelectedTechnician(null);
            }}
            style={styles.modalButton}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={() => handleAssignTechnician(selectedTechnician.id)}
            disabled={!selectedTechnician}
            style={styles.modalButton}
          >
            Assign
          </Button>
        </View>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <Searchbar
          placeholder="Search unassigned issues..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
          <Chip
            selected={selectedCategory === 'all'}
            onPress={() => setSelectedCategory('all')}
            style={styles.chip}
          >
            All Categories
          </Chip>
          <Chip
            selected={selectedCategory === 'hardware'}
            onPress={() => setSelectedCategory('hardware')}
            style={styles.chip}
          >
            Hardware
          </Chip>
          <Chip
            selected={selectedCategory === 'software'}
            onPress={() => setSelectedCategory('software')}
            style={styles.chip}
          >
            Software
          </Chip>
        </ScrollView>
      </View>

      <ScrollView style={styles.issuesList}>
        {filteredIssues.map((issue) => (
          <Card key={issue.id} style={styles.issueCard}>
            <Card.Content>
              <Title>{issue.title}</Title>
              <Paragraph>Category: {issue.category}</Paragraph>
              <Paragraph>{issue.description}</Paragraph>
              <Paragraph>Reported: {format(new Date(issue.createdAt), 'PPp')}</Paragraph>
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                onPress={() => {
                  setSelectedIssue(issue);
                  setModalVisible(true);
                }}
              >
                Assign Technician
              </Button>
            </Card.Actions>
          </Card>
        ))}

        {filteredIssues.length === 0 && (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Title>No Unassigned Issues</Title>
              <Paragraph>
                There are no unassigned issues that match your current filters.
              </Paragraph>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {renderTechnicianModal()}
    </View>
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
  searchbar: {
    marginBottom: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  filterChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  issuesList: {
    flex: 1,
  },
  issueCard: {
    margin: 16,
    marginTop: 8,
  },
  category: {
    marginTop: 8,
  },
  description: {
    marginTop: 8,
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  emptyCard: {
    margin: 16,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalSubtitle: {
    marginTop: 8,
    marginBottom: 16,
  },
  divider: {
    marginVertical: 16,
  },
  technicianCard: {
    marginBottom: 12,
  },
  selectedTechnicianCard: {
    borderColor: '#6200ee',
    borderWidth: 2,
  },
  technicianHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  technicianInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  technicianDetails: {
    marginLeft: 12,
  },
  expertiseContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  expertiseChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
  },
  expertiseText: {
    fontSize: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  modalButton: {
    marginLeft: 8,
  },
});

export default AssignTechnician;
