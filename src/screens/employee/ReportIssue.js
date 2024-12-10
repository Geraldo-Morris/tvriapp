import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Surface, Title, SegmentedButtons, HelperText } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { createReport } from '../../store/slices/reportsSlice';

const ReportIssue = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('software');
  const [floor, setFloor] = useState('');
  const [room, setRoom] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Reset form function
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('software');
    setFloor('');
    setRoom('');
    setErrors({});
  };

  // Reset form when component mounts or when navigation focuses the screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      resetForm();
    });

    return unsubscribe;
  }, [navigation]);

  const validateForm = () => {
    const newErrors = {};
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!floor.trim()) {
      newErrors.floor = 'Floor is required';
    }
    if (!room.trim()) {
      newErrors.room = 'Room is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Ensure the report data matches Firestore rules requirements
      const reportData = {
        title: title.trim(),
        description: description.trim(),
        category: category.toLowerCase(),
        location: {
          floor: floor.trim(),
          room: room.trim()
        },
        reportedBy: user.uid, // Must match the authenticated user's UID
        reporterName: user.displayName || user.email,
        status: "pending", // Must be 'pending' for initial creation
        createdBy: user.uid,
        assignedTo: null, // Only operators can assign technicians
        technicianName: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history: [{
          status: 'created',
          timestamp: new Date().toISOString(),
          updatedBy: user.uid,
          updatedByName: user.displayName || user.email,
          action: 'created',
          comment: 'Report created'
        }]
      };

      const result = await dispatch(createReport(reportData)).unwrap();
      console.log('Report created successfully:', result);
      resetForm();
      navigation.goBack();
    } catch (error) {
      console.error('Error creating report:', error);
      setErrors({ 
        submit: error.message || 'Failed to submit report. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.surface}>
        <Title style={styles.title}>Report New Issue</Title>

        <SegmentedButtons
          value={category}
          onValueChange={setCategory}
          buttons={[
            { value: 'software', label: 'Software' },
            { value: 'hardware', label: 'Hardware' },
          ]}
          style={styles.categoryButtons}
        />

        <TextInput
          label="Title"
          value={title}
          onChangeText={setTitle}
          mode="outlined"
          error={errors.title}
          style={styles.input}
        />
        {errors.title && <HelperText type="error">{errors.title}</HelperText>}

        <TextInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          mode="outlined"
          multiline
          numberOfLines={4}
          error={errors.description}
          style={styles.input}
        />
        {errors.description && <HelperText type="error">{errors.description}</HelperText>}

        <TextInput
          label="Floor"
          value={floor}
          onChangeText={setFloor}
          mode="outlined"
          error={errors.floor}
          style={styles.input}
          keyboardType="numeric"
        />
        {errors.floor && <HelperText type="error">{errors.floor}</HelperText>}

        <TextInput
          label="Room"
          value={room}
          onChangeText={setRoom}
          mode="outlined"
          error={errors.room}
          style={styles.input}
        />
        {errors.room && <HelperText type="error">{errors.room}</HelperText>}

        {errors.submit && <HelperText type="error" style={styles.submitError}>{errors.submit}</HelperText>}

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.submitButton}
        >
          Submit Report
        </Button>
      </Surface>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  surface: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  input: {
    marginBottom: 8,
  },
  categoryButtons: {
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 16,
  },
  submitError: {
    marginTop: 8,
    textAlign: 'center',
  }
});

export default ReportIssue;
