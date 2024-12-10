import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import {
  Surface,
  Title,
  TextInput,
  Button,
  DataTable,
  Portal,
  Dialog,
  Paragraph,
  IconButton,
  HelperText,
  Text,
} from 'react-native-paper';
import { useSelector } from 'react-redux';
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';
import { auth, db } from '../../config/firebase';

const ManageOperators = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [operators, setOperators] = useState([]);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState(null);
  const currentUser = useSelector((state) => state.auth.user);

  useEffect(() => {
    console.log('Current user state:', currentUser);
    if (currentUser?.uid) {
      verifyOperatorRole();
      fetchOperators();
    }
  }, [currentUser]);

  const verifyOperatorRole = async () => {
    if (!currentUser?.uid) {
      console.log('No current user ID found');
      return;
    }
    
    try {
      console.log('Verifying role for user:', currentUser.uid);
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const userData = userDoc.data();
      console.log('User data from Firestore:', userData);
      
      if (!userData) {
        console.error('No user data found in Firestore');
        setError('User data not found');
        return;
      }
      
      if (userData.role !== 'operator') {
        console.error('User is not an operator. Current role:', userData.role);
        setError('You must be an operator to access this page');
        return;
      }
      
      console.log('User verified as operator');
    } catch (error) {
      console.error('Error verifying role:', error);
      setError('Error verifying user role');
    }
  };

  const fetchOperators = async () => {
    try {
      const operatorsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'operator')
      );
      const snapshot = await getDocs(operatorsQuery);
      const operatorsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOperators(operatorsList);
    } catch (error) {
      console.error('Error fetching operators:', error);
      setError('Failed to fetch operators');
    }
  };

  const validateForm = () => {
    if (!email || !password || !name) {
      setError('All fields are required');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleCreateOperator = async () => {
    if (!validateForm()) return;
    
    if (!currentUser?.uid) {
      const errorMsg = 'You must be logged in to create operator accounts';
      console.error(errorMsg);
      setError(errorMsg);
      alert(errorMsg);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // First verify the current user's role from Firestore
      console.log('Verifying operator privileges for:', currentUser.uid);
      const currentUserDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const currentUserData = currentUserDoc.data();
      
      if (!currentUserData || currentUserData.role !== 'operator') {
        const errorMsg = `Not authorized. Current role: ${currentUserData?.role || 'none'}`;
        console.error(errorMsg);
        setError(errorMsg);
        alert(errorMsg);
        return;
      }

      console.log('Creating new operator account...');
      
      // Prepare user data first
      const userData = {
        email,
        name,
        displayName: name,
        role: 'operator',
        createdBy: currentUser.uid,
        createdAt: serverTimestamp()
      };
      console.log('Preparing user data:', userData);

      // Create the user account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Create the user document immediately after account creation
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userDocRef, userData);

      // Update the profile in a separate try-catch
      try {
        await updateProfile(userCredential.user, {
          displayName: name
        });
      } catch (profileError) {
        console.warn('Profile update failed, but user was created:', profileError);
        // Don't throw here, as the main account creation was successful
      }

      // Clear form and refresh
      setEmail('');
      setPassword('');
      setName('');
      fetchOperators();
      
      // Show success message
      alert('Operator created successfully!');
    } catch (error) {
      const errorMsg = `Error creating operator: ${error.message}`;
      console.error('Full error:', error);
      console.error('Error message:', errorMsg);
      setError(errorMsg);
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOperator = async () => {
    if (!selectedOperator) return;

    try {
      await deleteDoc(doc(db, 'users', selectedOperator.id));
      setDeleteDialogVisible(false);
      setSelectedOperator(null);
      fetchOperators();
    } catch (error) {
      console.error('Error deleting operator:', error);
      setError('Failed to delete operator');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={[styles.surface, { backgroundColor: '#ffffff' }]}>
        <Title style={{ color: '#000000', marginBottom: 16 }}>Manage Operators</Title>
        
        {/* Display current user info */}
        {currentUser && (
          <View style={styles.userInfo}>
            <Text>Logged in as: {currentUser.email}</Text>
            <Text>Role: {currentUser.role || 'none'}</Text>
          </View>
        )}

        {error ? <HelperText type="error">{error}</HelperText> : null}
        
        <TextInput
          label="Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />
        
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />
        
        <Button
          mode="contained"
          onPress={handleCreateOperator}
          loading={loading}
          style={styles.button}
        >
          Create Operator
        </Button>
      </Surface>

      <Surface style={[styles.surface, styles.tableContainer]}>
        <Title>Existing Operators</Title>
        
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>Name</DataTable.Title>
            <DataTable.Title>Email</DataTable.Title>
            <DataTable.Title>Actions</DataTable.Title>
          </DataTable.Header>

          {operators.map((operator) => (
            <DataTable.Row key={operator.id}>
              <DataTable.Cell>{operator.name}</DataTable.Cell>
              <DataTable.Cell>{operator.email}</DataTable.Cell>
              <DataTable.Cell>
                <IconButton
                  icon="delete"
                  onPress={() => {
                    setSelectedOperator(operator);
                    setDeleteDialogVisible(true);
                  }}
                />
              </DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>
      </Surface>

      <Portal>
        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
        >
          <Dialog.Title>Delete Operator</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Are you sure you want to delete this operator?
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleDeleteOperator}>Delete</Button>
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
  surface: {
    margin: 16,
    padding: 16,
    elevation: 4,
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 16,
  },
  userInfo: {
    marginBottom: 16,
  },
  tableContainer: {
    marginTop: 24,
  },
});

export default ManageOperators;
