import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { TextInput, Button, Text, Surface, HelperText, SegmentedButtons } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { registerAsync } from '../../store/slices/authSlice';

const RegisterScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('employee');
  const { loading, error } = useSelector(state => state.auth);

  const validateForm = () => {
    if (!email.trim() || !password.trim() || !name.trim() || !confirmPassword.trim()) {
      return false;
    }
    if (password !== confirmPassword) {
      return false;
    }
    if (password.length < 6) {
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      await dispatch(registerAsync({
        email,
        password,
        name,
        role
      })).unwrap();
    } catch (error) {
      // Error is handled by the auth slice
      console.log('Registration error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/tvri.png')} style={styles.image} />
      <Surface style={styles.surface}>
        <TextInput
          label="Nickname"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          secureTextEntry
          style={styles.input}
        />

        <TextInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          mode="outlined"
          secureTextEntry
          style={styles.input}
        />

        <Text style={styles.roleLabel}>Select Role:</Text>
        <SegmentedButtons
          value={role}
          onValueChange={setRole}
          buttons={[
            { value: 'employee', label: 'Employee' },
            { value: 'technician', label: 'Technician' },
          ]}
          style={styles.roleButtons}
        />

        {error ? (
          <HelperText type="error" visible={!!error}>
            {error}
          </HelperText>
        ) : null}

        <Button
          mode="contained"
          onPress={handleRegister}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Register
        </Button>

        <Button
          mode="text"
          onPress={() => navigation.navigate('Login')}
          style={styles.linkButton}
        >
          Already have an account? Login
        </Button>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    width: 150,
    height: 107,
    marginBottom: 50,
    alignSelf: 'center',
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  surface: {
    padding: 20,
    borderRadius: 10,
    elevation: 4,
  },
  input: {
    marginBottom: 12,
  },
  roleLabel: {
    marginBottom: 8,
    marginTop: 8,
    fontSize: 16,
  },
  roleButtons: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
  linkButton: {
    marginTop: 8,
  },
});

export default RegisterScreen;
