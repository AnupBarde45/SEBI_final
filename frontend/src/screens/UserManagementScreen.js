import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export default function UserManagementScreen() {
  const [users, setUsers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', age: '' });

  useEffect(() => {
    loadUsers();
    loadLeaderboard();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/users`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load users');
    }
  };

  const loadLeaderboard = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/leaderboard`);
      const data = await response.json();
      setLeaderboard(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load leaderboard');
    }
  };

  const loadUserDetails = async (userId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/users/${userId}`);
      const data = await response.json();
      setSelectedUser(data);
      setDetailModalVisible(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to load user details');
    }
  };

  const editUser = (user) => {
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      age: user.age?.toString() || ''
    });
    setSelectedUser(user);
    setEditModalVisible(true);
  };

  const saveUser = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          age: editForm.age ? parseInt(editForm.age) : null
        })
      });
      
      if (response.ok) {
        setEditModalVisible(false);
        loadUsers();
        Alert.alert('Success', 'User updated successfully');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update user');
    }
  };

  const deleteUser = (userId) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await fetch(`${BACKEND_URL}/api/admin/users/${userId}`, { method: 'DELETE' });
              loadUsers();
              Alert.alert('Success', 'User deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete user');
            }
          }
        }
      ]
    );
  };

  const renderUserRow = (user, index) => (
    <View key={user.id} style={styles.userRow}>
      <Text style={styles.userIndex}>{index + 1}</Text>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        <Text style={styles.userStats}>
          Risk: {user.riskScore || 'N/A'} | Quizzes: {user.quiz_attempts} | Trades: {user.total_trades}
        </Text>
      </View>
      <View style={styles.userActions}>
        <TouchableOpacity style={styles.viewBtn} onPress={() => loadUserDetails(user.id)}>
          <Text style={styles.btnText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.editBtn} onPress={() => editUser(user)}>
          <Text style={styles.btnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteUser(user.id)}>
          <Text style={styles.btnText}>Del</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderLeaderboardRow = (user, index) => (
    <View key={user.id} style={[styles.userRow, index < 3 && styles.topThree]}>
      <Text style={[styles.userIndex, index < 3 && styles.topThreeText]}>
        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
      </Text>
      <View style={styles.userInfo}>
        <Text style={[styles.userName, index < 3 && styles.topThreeText]}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        <Text style={styles.userStats}>
          Quiz Avg: {user.avg_quiz_score?.toFixed(1) || '0'} | Portfolio: ₹{user.portfolio_value?.toLocaleString() || '1,00,000'} | Badges: {user.badge_count}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>User Management</Text>
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'users' && styles.activeTab]}
            onPress={() => setActiveTab('users')}
          >
            <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>Users</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'leaderboard' && styles.activeTab]}
            onPress={() => setActiveTab('leaderboard')}
          >
            <Text style={[styles.tabText, activeTab === 'leaderboard' && styles.activeTabText]}>Leaderboard</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'users' ? (
          <View>
            <Text style={styles.sectionTitle}>All Users ({users.length})</Text>
            {users.map(renderUserRow)}
          </View>
        ) : (
          <View>
            <Text style={styles.sectionTitle}>Top Performers</Text>
            {leaderboard.map(renderLeaderboardRow)}
          </View>
        )}
      </ScrollView>

      {/* Edit User Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit User</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={editForm.name}
              onChangeText={(text) => setEditForm({...editForm, name: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={editForm.email}
              onChangeText={(text) => setEditForm({...editForm, email: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone"
              value={editForm.phone}
              onChangeText={(text) => setEditForm({...editForm, phone: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="Age"
              value={editForm.age}
              onChangeText={(text) => setEditForm({...editForm, age: text})}
              keyboardType="numeric"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={saveUser}>
                <Text style={styles.btnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* User Details Modal */}
      <Modal visible={detailModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>User Details</Text>
            {selectedUser && (
              <ScrollView>
                <Text style={styles.detailText}>Name: {selectedUser.user?.name}</Text>
                <Text style={styles.detailText}>Email: {selectedUser.user?.email}</Text>
                <Text style={styles.detailText}>Risk Score: {selectedUser.user?.riskScore || 'N/A'}</Text>
                <Text style={styles.detailText}>Profile: {selectedUser.user?.riskProfileType || 'N/A'}</Text>
                <Text style={styles.detailText}>Portfolio Value: ₹{selectedUser.user?.totalValue?.toLocaleString() || '1,00,000'}</Text>
                <Text style={styles.detailText}>Badges: {selectedUser.user?.badges?.length || 0}</Text>
                
                <Text style={styles.sectionTitle}>Recent Trades</Text>
                {selectedUser.recentTrades?.map((trade, index) => (
                  <Text key={index} style={styles.tradeText}>
                    {trade.type} {trade.quantity} {trade.symbol} @ ₹{trade.price}
                  </Text>
                ))}
              </ScrollView>
            )}
            <TouchableOpacity style={styles.closeBtn} onPress={() => setDetailModalVisible(false)}>
              <Text style={styles.btnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#fff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  tabContainer: { flexDirection: 'row' },
  tab: { flex: 1, padding: 12, alignItems: 'center', backgroundColor: '#f0f0f0', marginRight: 8 },
  activeTab: { backgroundColor: '#007bff' },
  tabText: { color: '#666' },
  activeTabText: { color: '#fff', fontWeight: 'bold' },
  content: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  userRow: { backgroundColor: '#fff', padding: 12, marginBottom: 8, borderRadius: 8, flexDirection: 'row', alignItems: 'center' },
  topThree: { backgroundColor: '#fff3cd' },
  userIndex: { width: 30, fontSize: 16, fontWeight: 'bold' },
  topThreeText: { color: '#856404' },
  userInfo: { flex: 1, marginLeft: 12 },
  userName: { fontSize: 16, fontWeight: 'bold' },
  userEmail: { fontSize: 14, color: '#666' },
  userStats: { fontSize: 12, color: '#888', marginTop: 4 },
  userActions: { flexDirection: 'row' },
  viewBtn: { backgroundColor: '#17a2b8', padding: 8, borderRadius: 4, marginRight: 4 },
  editBtn: { backgroundColor: '#ffc107', padding: 8, borderRadius: 4, marginRight: 4 },
  deleteBtn: { backgroundColor: '#dc3545', padding: 8, borderRadius: 4 },
  btnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 8, width: '90%', maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 4, marginBottom: 12 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between' },
  cancelBtn: { backgroundColor: '#6c757d', padding: 12, borderRadius: 4, flex: 0.45 },
  saveBtn: { backgroundColor: '#28a745', padding: 12, borderRadius: 4, flex: 0.45 },
  closeBtn: { backgroundColor: '#007bff', padding: 12, borderRadius: 4, marginTop: 16 },
  detailText: { fontSize: 14, marginBottom: 8 },
  tradeText: { fontSize: 12, color: '#666', marginBottom: 4 }
});