import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const roles = [
  { id: '1', title: 'Software Engineer', description: 'Junior Software Engineer position' },
  { id: '2', title: 'Data Analyst', description: 'Data Analyst position' },
  { id: '3', title: 'Product Manager', description: 'Product Manager position' },
  { id: '4', title: 'Marketing Specialist', description: 'Marketing Specialist position' },
  { id: '5', title: 'UX Designer', description: 'UX Designer position' },
  { id: '6', title: 'Sales Representative', description: 'Sales Representative position' },
];

export default function RoleSelectionScreen() {
  const navigation = useNavigation();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
  };

  const handleStartInterview = () => {
    if (selectedRole) {
      navigation.navigate('Interview' as never, { 
        interviewType: selectedRole 
      } as never);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Your Role</Text>
        <Text style={styles.subtitle}>Choose the position you're preparing for</Text>
      </View>

      <View style={styles.rolesList}>
        {roles.map((role) => (
          <TouchableOpacity
            key={role.id}
            style={[
              styles.roleCard,
              selectedRole === role.title && styles.selectedRoleCard
            ]}
            onPress={() => handleRoleSelect(role.title)}
          >
            <View style={styles.roleContent}>
              <Text style={[
                styles.roleTitle,
                selectedRole === role.title && styles.selectedRoleTitle
              ]}>
                {role.title}
              </Text>
              <Text style={[
                styles.roleDescription,
                selectedRole === role.title && styles.selectedRoleDescription
              ]}>
                {role.description}
              </Text>
            </View>
            {selectedRole === role.title && (
              <View style={styles.checkmark}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.startButton,
            !selectedRole && styles.disabledButton
          ]}
          onPress={handleStartInterview}
          disabled={!selectedRole}
        >
          <Text style={[
            styles.buttonText,
            !selectedRole && styles.disabledButtonText
          ]}>
            Start Interview
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  rolesList: {
    padding: 20,
  },
  roleCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedRoleCard: {
    backgroundColor: '#007AFF',
    borderWidth: 2,
    borderColor: '#0056CC',
  },
  roleContent: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  selectedRoleTitle: {
    color: 'white',
  },
  roleDescription: {
    fontSize: 14,
    color: '#666',
  },
  selectedRoleDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  checkmark: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  buttonContainer: {
    padding: 20,
  },
  startButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButtonText: {
    color: '#999',
  },
});