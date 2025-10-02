import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, TextInput, Modal } from 'react-native';

const BACKEND_URL = 'http://10.244.64.90:3000';

export default function App() {
  const [activeTab, setActiveTab] = useState('risk');

  const tabs = [
    { id: 'users', label: 'User Management', icon: '👥' },
    { id: 'risk', label: 'Risk Assessment', icon: '⚖️' },
    { id: 'quiz', label: 'Quiz Questions', icon: '❓' },
    { id: 'tutorials', label: 'Tutorials', icon: '📚' },
    { id: 'tips', label: 'Guru Tips', icon: '💡' },
    { id: 'badges', label: 'Badge System', icon: '🏆' },
    { id: 'stocks', label: 'Stock Data', icon: '📈' },
    { id: 'portfolio', label: 'Portfolio Config', icon: '💼' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagementConfig />;
      case 'risk':
        return <RiskAssessmentConfig />;
      case 'quiz':
        return <QuizQuestionsConfig />;
      case 'tutorials':
        return <TutorialsConfig />;
      case 'tips':
        return <GuruTipsConfig />;
      case 'badges':
        return <BadgeSystemConfig />;
      case 'stocks':
        return <StockDataConfig />;
      case 'portfolio':
        return <PortfolioConfig />;
      default:
        return <UserManagementConfig />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SaralNivesh Admin Dashboard</Text>
        <Text style={styles.headerSubtitle}>Dynamic Configuration Management</Text>
      </View>
      
      <View style={styles.mainContent}>
        <View style={styles.sidebar}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabButton, activeTab === tab.id && styles.activeTab]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text style={[styles.tabLabel, activeTab === tab.id && styles.activeTabLabel]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.content}>
          {renderContent()}
        </View>
      </View>
    </View>
  );
}

function UserManagementConfig() {
  const [users, setUsers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', phone: '', age: '' });
  const [editUser, setEditUser] = useState({ name: '', email: '', phone: '', age: '' });

  useEffect(() => {
    fetchUsers();
    fetchLeaderboard();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/users`);
      if (response.ok) {
        const data = await response.json();
        setUsers(Array.isArray(data) ? data : []);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      setUsers([]);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/leaderboard`);
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(Array.isArray(data) ? data : []);
      } else {
        setLeaderboard([]);
      }
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  const viewUserDetails = async (userId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/users/${userId}`);
      const data = await response.json();
      setSelectedUser(data);
      setShowUserModal(true);
    } catch (error) {
      alert('Failed to load user details');
    }
  };

  const addUser = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newUser,
          age: newUser.age ? parseInt(newUser.age) : null
        })
      });
      
      if (response.ok) {
        alert('User added successfully!');
        setShowAddModal(false);
        setNewUser({ name: '', email: '', password: '', phone: '', age: '' });
        fetchUsers();
      } else {
        const error = await response.json();
        alert('Failed to add user: ' + error.error);
      }
    } catch (error) {
      alert('Failed to add user: ' + error.message);
    }
  };

  const editUserDetails = (user) => {
    setEditUser({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      age: user.age?.toString() || ''
    });
    setShowEditModal(true);
  };

  const updateUser = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/users/${editUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editUser.name,
          email: editUser.email,
          phone: editUser.phone,
          age: editUser.age ? parseInt(editUser.age) : null
        })
      });
      
      if (response.ok) {
        alert('User updated successfully!');
        setShowEditModal(false);
        fetchUsers();
      }
    } catch (error) {
      alert('Failed to update user');
    }
  };

  const deleteUser = async (userId, userName) => {
    const confirmed = confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`);
    if (confirmed) {
      try {
        const response = await fetch(`${BACKEND_URL}/api/admin/users/${userId}`, { method: 'DELETE' });
        if (response.ok) {
          alert('User deleted successfully');
          fetchUsers();
          fetchLeaderboard();
        } else {
          alert('Failed to delete user');
        }
      } catch (error) {
        alert('Failed to delete user: ' + error.message);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text>Loading user data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.configContainer}>
      <Text style={styles.configTitle}>User Management</Text>
      <Text style={styles.configDescription}>
        Manage users, view leaderboard, and monitor user activity
      </Text>
      
      <View style={styles.configCard}>
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'users' && styles.activeTabButton]}
            onPress={() => setActiveTab('users')}
          >
            <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>All Users ({users.length})</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'leaderboard' && styles.activeTabButton]}
            onPress={() => setActiveTab('leaderboard')}
          >
            <Text style={[styles.tabText, activeTab === 'leaderboard' && styles.activeTabText]}>Leaderboard</Text>
          </TouchableOpacity>
        </View>
        
        {activeTab === 'users' && (
          <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
            <Text style={styles.addButtonText}>+ Add New User</Text>
          </TouchableOpacity>
        )}
      </View>

      {activeTab === 'users' ? (
        <View style={styles.configCard}>
          <Text style={styles.cardTitle}>All Users</Text>
          {users.map((user, index) => (
            <View key={user.id} style={styles.userItem}>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                <Text style={styles.userStats}>
                  Risk: {user.riskScore || 'N/A'} | Quizzes: {user.quiz_attempts} | Trades: {user.total_trades} | Portfolio: ₹{user.portfolio_value?.toLocaleString() || '1,00,000'}
                </Text>
              </View>
              <View style={styles.userActions}>
                <TouchableOpacity style={styles.viewButton} onPress={() => viewUserDetails(user.id)}>
                  <Text style={styles.buttonText}>View</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.editButton} onPress={() => editUserDetails(user)}>
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => deleteUser(user.id, user.name)}>
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.configCard}>
          <Text style={styles.cardTitle}>Top Performers ({leaderboard.length})</Text>
          {leaderboard && leaderboard.length > 0 ? leaderboard.map((user, index) => (
            <View key={user.id} style={[styles.userItem, index < 3 && styles.topUser]}>
              <Text style={styles.userRank}>
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
              </Text>
              <View style={styles.userInfo}>
                <Text style={[styles.userName, index < 3 && styles.topUserName]}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                <Text style={styles.userStats}>
                  Quiz Avg: {user.avg_quiz_score?.toFixed(1) || '0'} | Portfolio: ₹{user.portfolio_value?.toLocaleString() || '1,00,000'} | Badges: {user.badge_count}
                </Text>
              </View>
            </View>
          )) : (
            <Text style={styles.detailText}>No leaderboard data available</Text>
          )}
        </View>
      )}

      <Modal visible={showUserModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>User Details</Text>
            {selectedUser && (
              <ScrollView style={{ maxHeight: 400 }}>
                <Text style={styles.detailText}>Name: {selectedUser.user?.name}</Text>
                <Text style={styles.detailText}>Email: {selectedUser.user?.email}</Text>
                <Text style={styles.detailText}>Phone: {selectedUser.user?.phone || 'N/A'}</Text>
                <Text style={styles.detailText}>Age: {selectedUser.user?.age || 'N/A'}</Text>
                <Text style={styles.detailText}>Risk Score: {selectedUser.user?.riskScore || 'N/A'}</Text>
                <Text style={styles.detailText}>Profile: {selectedUser.user?.riskProfileType || 'N/A'}</Text>
                <Text style={styles.detailText}>Portfolio Value: ₹{selectedUser.user?.totalValue?.toLocaleString() || '1,00,000'}</Text>
                <Text style={styles.detailText}>Badges: {selectedUser.user?.badges?.length || 0}</Text>
                
                <Text style={styles.sectionTitle}>Recent Trades ({selectedUser.recentTrades?.length || 0})</Text>
                {selectedUser.recentTrades?.length > 0 ? (
                  selectedUser.recentTrades.map((trade, index) => (
                    <Text key={index} style={styles.tradeText}>
                      {trade.type} {trade.quantity} {trade.symbol} @ ₹{trade.price}
                    </Text>
                  ))
                ) : (
                  <Text style={styles.tradeText}>No trades yet</Text>
                )}
              </ScrollView>
            )}
            <TouchableOpacity style={styles.saveButton} onPress={() => setShowUserModal(false)}>
              <Text style={styles.saveButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New User</Text>
            
            <Text style={styles.inputLabel}>Name *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Full name"
              value={newUser.name}
              onChangeText={(text) => setNewUser(prev => ({ ...prev, name: text }))}
            />
            
            <Text style={styles.inputLabel}>Email *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="email@example.com"
              value={newUser.email}
              onChangeText={(text) => setNewUser(prev => ({ ...prev, email: text }))}
            />
            
            <Text style={styles.inputLabel}>Password *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Password"
              value={newUser.password}
              onChangeText={(text) => setNewUser(prev => ({ ...prev, password: text }))}
              secureTextEntry
            />
            
            <Text style={styles.inputLabel}>Phone</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Phone number"
              value={newUser.phone}
              onChangeText={(text) => setNewUser(prev => ({ ...prev, phone: text }))}
            />
            
            <Text style={styles.inputLabel}>Age</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Age"
              value={newUser.age}
              onChangeText={(text) => setNewUser(prev => ({ ...prev, age: text }))}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => {
                setShowAddModal(false);
                setNewUser({ name: '', email: '', password: '', phone: '', age: '' });
              }}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={addUser}>
                <Text style={styles.saveButtonText}>Add User</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit User</Text>
            
            <Text style={styles.inputLabel}>Name *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Full name"
              value={editUser.name}
              onChangeText={(text) => setEditUser(prev => ({ ...prev, name: text }))}
            />
            
            <Text style={styles.inputLabel}>Email *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="email@example.com"
              value={editUser.email}
              onChangeText={(text) => setEditUser(prev => ({ ...prev, email: text }))}
            />
            
            <Text style={styles.inputLabel}>Phone</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Phone number"
              value={editUser.phone}
              onChangeText={(text) => setEditUser(prev => ({ ...prev, phone: text }))}
            />
            
            <Text style={styles.inputLabel}>Age</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Age"
              value={editUser.age}
              onChangeText={(text) => setEditUser(prev => ({ ...prev, age: text }))}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowEditModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={updateUser}>
                <Text style={styles.saveButtonText}>Update User</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function RiskAssessmentConfig() {
  const [riskFactors, setRiskFactors] = useState([]);
  const [riskProfiles, setRiskProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditFactor, setShowEditFactor] = useState(false);
  const [editingFactor, setEditingFactor] = useState(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);

  useEffect(() => {
    fetchRiskData();
  }, []);

  const fetchRiskData = async () => {
    try {
      console.log('Fetching risk data from:', BACKEND_URL);
      const [factorsRes, profilesRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/admin/risk-factors`),
        fetch(`${BACKEND_URL}/api/admin/risk-profiles`)
      ]);
      
      console.log('Factors response status:', factorsRes.status);
      console.log('Profiles response status:', profilesRes.status);
      
      const factors = await factorsRes.json();
      const profiles = await profilesRes.json();
      
      console.log('Risk factors loaded:', factors.length);
      console.log('Risk profiles loaded:', profiles.length);
      
      setRiskFactors(factors);
      setRiskProfiles(profiles);
    } catch (error) {
      console.error('Risk data fetch error:', error);
      alert('Failed to load risk data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text>Loading risk configuration...</Text>
      </View>
    );
  }

  const updateFactorPoints = (factorId, newPoints) => {
    setRiskFactors(prev => prev.map(factor => 
      factor.id === factorId ? { ...factor, points: newPoints } : factor
    ));
  };

  const updateProfileScore = (profileId, field, newScore) => {
    setRiskProfiles(prev => prev.map(profile => 
      profile.id === profileId ? { ...profile, [field]: newScore } : profile
    ));
  };

  const saveFactorChanges = async () => {
    try {
      for (const factor of riskFactors) {
        await fetch(`${BACKEND_URL}/api/admin/risk-factors/${factor.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            factor_name: factor.factor_name,
            factor_type: factor.factor_type,
            condition_key: factor.condition_key,
            condition_label: factor.condition_label,
            points: factor.points
          })
        });
      }
      alert('Risk factors updated successfully!');
      setShowEditFactor(false);
      fetchRiskData();
    } catch (error) {
      alert('Failed to update risk factors: ' + error.message);
    }
  };

  const saveProfileChanges = async () => {
    try {
      for (const profile of riskProfiles) {
        await fetch(`${BACKEND_URL}/api/admin/risk-profiles/${profile.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profile_name: profile.profile_name,
            min_score: profile.min_score,
            max_score: profile.max_score,
            description: profile.description,
            allocation_stocks: profile.allocation_stocks,
            allocation_bonds: profile.allocation_bonds,
            suitable_for: profile.suitable_for
          })
        });
      }
      alert('Risk profiles updated successfully!');
      setShowEditProfile(false);
      fetchRiskData();
    } catch (error) {
      alert('Failed to update risk profiles: ' + error.message);
    }
  };

  const ageFactors = riskFactors.filter(f => f.factor_type === 'age');
  const incomeFactors = riskFactors.filter(f => f.factor_type === 'income');

  return (
    <ScrollView style={styles.configContainer}>
      <Text style={styles.configTitle}>Risk Assessment Configuration</Text>
      <Text style={styles.configDescription}>
        Configure risk scoring algorithms, thresholds, and profile types
      </Text>
      
      <View style={styles.configCard}>
        <Text style={styles.cardTitle}>Age Factor Scoring ({ageFactors.length} rules)</Text>
        {ageFactors.map(factor => (
          <View key={factor.id} style={styles.configRow}>
            <Text>{factor.condition_label}:</Text>
            <Text style={styles.configValue}>{factor.points} points</Text>
          </View>
        ))}
        <TouchableOpacity style={styles.editButton} onPress={() => setShowEditFactor(true)}>
          <Text style={styles.editButtonText}>Edit Age Factors</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.configCard}>
        <Text style={styles.cardTitle}>Income Stability Scoring ({incomeFactors.length} rules)</Text>
        {incomeFactors.map(factor => (
          <View key={factor.id} style={styles.configRow}>
            <Text>{factor.condition_label}:</Text>
            <Text style={styles.configValue}>{factor.points} points</Text>
          </View>
        ))}
        <TouchableOpacity style={styles.editButton} onPress={() => alert('Income Stability: More stable income allows for higher risk investments. Very stable income gets maximum points.')}>
          <Text style={styles.editButtonText}>View Income Factor Details</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.configCard}>
        <Text style={styles.cardTitle}>Risk Profile Thresholds ({riskProfiles.length} profiles)</Text>
        {riskProfiles.map(profile => (
          <View key={profile.id} style={styles.configRow}>
            <Text>{profile.profile_name}:</Text>
            <Text style={styles.configValue}>{profile.min_score}-{profile.max_score} points</Text>
          </View>
        ))}
        <TouchableOpacity style={styles.editButton} onPress={() => setShowEditProfile(true)}>
          <Text style={styles.editButtonText}>Edit Profile Thresholds</Text>
        </TouchableOpacity>
      </View>

      {/* Edit Risk Factor Modal */}
      <Modal visible={showEditFactor} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Risk Factors</Text>
            
            <ScrollView style={{ maxHeight: 400 }}>
              {riskFactors.map(factor => (
                <View key={factor.id} style={styles.factorEditItem}>
                  <Text style={styles.factorLabel}>{factor.condition_label}</Text>
                  <View style={styles.factorEditRow}>
                    <Text>Points: </Text>
                    <TextInput
                      style={styles.pointsInput}
                      value={String(factor.points)}
                      onChangeText={(value) => updateFactorPoints(factor.id, parseInt(value) || 0)}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              ))}
            </ScrollView>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowEditFactor(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={saveFactorChanges}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Risk Profile Modal */}
      <Modal visible={showEditProfile} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Risk Profile Thresholds</Text>
            
            <ScrollView style={{ maxHeight: 400 }}>
              {riskProfiles.map(profile => (
                <View key={profile.id} style={styles.profileEditItem}>
                  <Text style={styles.profileName}>{profile.profile_name}</Text>
                  <View style={styles.profileEditRow}>
                    <Text>Min Score: </Text>
                    <TextInput
                      style={styles.scoreInput}
                      value={String(profile.min_score)}
                      onChangeText={(value) => updateProfileScore(profile.id, 'min_score', parseInt(value) || 0)}
                      keyboardType="numeric"
                    />
                    <Text> Max Score: </Text>
                    <TextInput
                      style={styles.scoreInput}
                      value={String(profile.max_score)}
                      onChangeText={(value) => updateProfileScore(profile.id, 'max_score', parseInt(value) || 0)}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              ))}
            </ScrollView>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowEditProfile(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={saveProfileChanges}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function QuizQuestionsConfig() {
  const [questions, setQuestions] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [showEditScoring, setShowEditScoring] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ question: '', explanation: '', options: [{ text: '', correct: false }] });
  const [correctPoints, setCorrectPoints] = useState('10');
  const [wrongPoints, setWrongPoints] = useState('-5');

  useEffect(() => {
    fetchQuizData();
  }, []);

  const fetchQuizData = async () => {
    try {
      const [questionsRes, settingsRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/admin/quiz-questions`),
        fetch(`${BACKEND_URL}/api/admin/quiz-settings`)
      ]);
      
      const questionsData = await questionsRes.json();
      const settingsData = await settingsRes.json();
      
      setQuestions(questionsData);
      const settingsObj = settingsData.reduce((acc, setting) => {
        acc[setting.setting_name] = setting.setting_value;
        return acc;
      }, {});
      setSettings(settingsObj);
      setCorrectPoints(String(settingsObj.correct_answer_points || 10));
      setWrongPoints(String(settingsObj.wrong_answer_points || -5));
    } catch (error) {
      Alert.alert('Error', 'Failed to load quiz data');
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/quiz-questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: newQuestion.question,
          explanation: newQuestion.explanation,
          options: newQuestion.options.map(opt => ({ option_text: opt.text, is_correct: opt.correct }))
        })
      });
      
      if (response.ok) {
        Alert.alert('Success', 'Question added successfully!');
        setShowAddQuestion(false);
        setNewQuestion({ question: '', explanation: '', options: [{ text: '', correct: false }] });
        fetchQuizData();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add question');
    }
  };

  const updateScoring = async () => {
    try {
      await Promise.all([
        fetch(`${BACKEND_URL}/api/admin/quiz-settings/correct_answer_points`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ setting_value: parseInt(correctPoints) })
        }),
        fetch(`${BACKEND_URL}/api/admin/quiz-settings/wrong_answer_points`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ setting_value: parseInt(wrongPoints) })
        })
      ]);
      
      Alert.alert('Success', 'Scoring updated successfully!');
      setShowEditScoring(false);
      fetchQuizData();
    } catch (error) {
      Alert.alert('Error', 'Failed to update scoring');
    }
  };

  const addOption = () => {
    setNewQuestion(prev => ({
      ...prev,
      options: [...prev.options, { text: '', correct: false }]
    }));
  };

  const updateOption = (index, field, value) => {
    setNewQuestion(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => 
        i === index ? { ...opt, [field]: value } : opt
      )
    }));
  };

  const deleteQuestion = async (questionId) => {
    console.log('Delete button clicked for question ID:', questionId);
    
    const confirmed = window.confirm('Are you sure you want to delete this question? This action cannot be undone.');
    
    if (confirmed) {
      try {
        console.log('Sending DELETE request to:', `${BACKEND_URL}/api/admin/quiz-questions/${questionId}`);
        const response = await fetch(`${BACKEND_URL}/api/admin/quiz-questions/${questionId}`, {
          method: 'DELETE'
        });
        
        console.log('Delete response status:', response.status);
        const responseData = await response.json();
        console.log('Delete response data:', responseData);
        
        if (response.ok) {
          alert('Question deleted successfully!');
          fetchQuizData();
        } else {
          throw new Error(responseData.error || 'Failed to delete question');
        }
      } catch (error) {
        console.error('Delete error:', error);
        alert(`Failed to delete question: ${error.message}`);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text>Loading quiz configuration...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.configContainer}>
      <Text style={styles.configTitle}>Quiz Questions Management</Text>
      <Text style={styles.configDescription}>
        Add, edit, or remove quiz questions and configure scoring
      </Text>
      
      <View style={styles.configCard}>
        <Text style={styles.cardTitle}>Current Questions: {questions.length}</Text>
        <View style={styles.configRow}>
          <Text>Correct Answer Points:</Text>
          <Text style={styles.configValue}>+{settings.correct_answer_points || 10}</Text>
        </View>
        <View style={styles.configRow}>
          <Text>Wrong Answer Points:</Text>
          <Text style={styles.configValue}>{settings.wrong_answer_points || -5}</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddQuestion(true)}>
          <Text style={styles.addButtonText}>+ Add New Question</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.editButton} onPress={() => setShowEditScoring(true)}>
          <Text style={styles.editButtonText}>Edit Scoring System</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.configCard}>
        <Text style={styles.cardTitle}>All Questions ({questions.length})</Text>
        {questions.map(question => (
          <View key={question.id} style={styles.questionItem}>
            <View style={styles.questionContent}>
              <Text style={styles.questionText} numberOfLines={2}>{question.question}</Text>
              <Text style={styles.questionMeta}>{question.options?.length || 0} options • {question.category}</Text>
            </View>
            <TouchableOpacity 
              style={styles.deleteButton} 
              onPress={() => deleteQuestion(question.id)}
            >
              <Text style={styles.deleteButtonText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Add Question Modal */}
      <Modal visible={showAddQuestion} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Question</Text>
            
            <TextInput
              style={styles.textInput}
              placeholder="Question text"
              value={newQuestion.question}
              onChangeText={(text) => setNewQuestion(prev => ({ ...prev, question: text }))}
              multiline
            />
            
            <TextInput
              style={styles.textInput}
              placeholder="Explanation"
              value={newQuestion.explanation}
              onChangeText={(text) => setNewQuestion(prev => ({ ...prev, explanation: text }))}
              multiline
            />
            
            <Text style={styles.sectionTitle}>Options:</Text>
            {newQuestion.options.map((option, index) => (
              <View key={index} style={styles.optionRow}>
                <TextInput
                  style={[styles.textInput, { flex: 1 }]}
                  placeholder={`Option ${index + 1}`}
                  value={option.text}
                  onChangeText={(text) => updateOption(index, 'text', text)}
                />
                <TouchableOpacity
                  style={[styles.correctButton, option.correct && styles.correctButtonActive]}
                  onPress={() => updateOption(index, 'correct', !option.correct)}
                >
                  <Text style={styles.correctButtonText}>{option.correct ? '✓' : '○'}</Text>
                </TouchableOpacity>
              </View>
            ))}
            
            <TouchableOpacity style={styles.addOptionButton} onPress={addOption}>
              <Text style={styles.addOptionText}>+ Add Option</Text>
            </TouchableOpacity>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddQuestion(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={addQuestion}>
                <Text style={styles.saveButtonText}>Add Question</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Scoring Modal */}
      <Modal visible={showEditScoring} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Scoring System</Text>
            
            <Text style={styles.inputLabel}>Correct Answer Points:</Text>
            <TextInput
              style={styles.textInput}
              value={correctPoints}
              onChangeText={setCorrectPoints}
              keyboardType="numeric"
            />
            
            <Text style={styles.inputLabel}>Wrong Answer Points:</Text>
            <TextInput
              style={styles.textInput}
              value={wrongPoints}
              onChangeText={setWrongPoints}
              keyboardType="numeric"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowEditScoring(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={updateScoring}>
                <Text style={styles.saveButtonText}>Update Scoring</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function GuruTipsConfig() {
  const [tips, setTips] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddTip, setShowAddTip] = useState(false);
  const [showAddRule, setShowAddRule] = useState(false);
  const [newTip, setNewTip] = useState({ tip_code: '', trade_action: 'buy', scenario_type: 'profit', tip_message: '' });
  const [newRule, setNewRule] = useState({ rule_name: '', rule_type: 'quantity', threshold_value: '', comparison_operator: '>=', trigger_message: '' });

  useEffect(() => {
    fetchTips();
  }, []);

  const fetchTips = async () => {
    try {
      const [tipsRes, rulesRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/admin/trading-tips`),
        fetch(`${BACKEND_URL}/api/admin/trading-rules`)
      ]);
      const tipsData = await tipsRes.json();
      const rulesData = await rulesRes.json();
      setTips(tipsData);
      setRules(rulesData);
    } catch (error) {
      alert('Failed to load trading data');
    } finally {
      setLoading(false);
    }
  };

  const addTip = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/trading-tips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTip)
      });
      
      if (response.ok) {
        alert('Trading tip added successfully!');
        setShowAddTip(false);
        setNewTip({ tip_code: '', trade_action: 'buy', scenario_type: 'profit', tip_message: '' });
        fetchTips();
      }
    } catch (error) {
      alert('Failed to add trading tip');
    }
  };

  const addRule = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/trading-rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newRule,
          threshold_value: parseFloat(newRule.threshold_value)
        })
      });
      
      if (response.ok) {
        alert('Trading rule added successfully!');
        setShowAddRule(false);
        setNewRule({ rule_name: '', rule_type: 'quantity', threshold_value: '', comparison_operator: '>=', trigger_message: '' });
        fetchTips();
      }
    } catch (error) {
      alert('Failed to add trading rule');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text>Loading trading data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.configContainer}>
      <Text style={styles.configTitle}>Trading Tips & Rules Management</Text>
      <Text style={styles.configDescription}>
        Configure trading insights, threshold-based rules, and educational tips
      </Text>
      
      <View style={styles.configCard}>
        <Text style={styles.cardTitle}>Trading Rules: {rules.length} | Tips: {tips.length}</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.addButton, { flex: 1, marginRight: 5 }]} onPress={() => setShowAddRule(true)}>
            <Text style={styles.addButtonText}>+ Add Rule</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.addButton, { flex: 1, marginLeft: 5 }]} onPress={() => setShowAddTip(true)}>
            <Text style={styles.addButtonText}>+ Add Tip</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.configCard}>
        <Text style={styles.cardTitle}>Trading Rules (Threshold-based)</Text>
        {rules.map(rule => (
          <View key={rule.id} style={styles.ruleItem}>
            <View style={styles.ruleHeader}>
              <Text style={styles.ruleName}>{rule.rule_name}</Text>
              <Text style={styles.ruleThreshold}>{rule.rule_type} {rule.comparison_operator} {rule.threshold_value}</Text>
            </View>
            <Text style={styles.ruleMessage}>{rule.trigger_message}</Text>
          </View>
        ))}
      </View>

      <View style={styles.configCard}>
        <Text style={styles.cardTitle}>General Trading Tips</Text>
        {tips.map(tip => (
          <View key={tip.id} style={styles.tipItem}>
            <View style={styles.tipHeader}>
              <Text style={styles.tipType}>{tip.trade_action.toUpperCase()} - {tip.scenario_type.toUpperCase()}</Text>
              <Text style={styles.tipId}>Code: {tip.tip_code}</Text>
            </View>
            <Text style={styles.tipMessage}>{tip.tip_message}</Text>
          </View>
        ))}
      </View>

      <Modal visible={showAddTip} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Guru Tip</Text>
            
            <Text style={styles.inputLabel}>Tip Code:</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., TRADE011"
              value={newTip.tip_code}
              onChangeText={(text) => setNewTip(prev => ({ ...prev, tip_code: text }))}
              autoComplete="off"
              selectTextOnFocus
            />
            
            <Text style={styles.inputLabel}>Trade Action:</Text>
            <View style={styles.pickerContainer}>
              <TouchableOpacity 
                style={[styles.pickerOption, newTip.trade_action === 'buy' && styles.pickerOptionActive]}
                onPress={() => setNewTip(prev => ({ ...prev, trade_action: 'buy' }))}
              >
                <Text style={styles.pickerText}>Buy</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.pickerOption, newTip.trade_action === 'sell' && styles.pickerOptionActive]}
                onPress={() => setNewTip(prev => ({ ...prev, trade_action: 'sell' }))}
              >
                <Text style={styles.pickerText}>Sell</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.pickerOption, newTip.trade_action === 'hold' && styles.pickerOptionActive]}
                onPress={() => setNewTip(prev => ({ ...prev, trade_action: 'hold' }))}
              >
                <Text style={styles.pickerText}>Hold</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.inputLabel}>Scenario Type:</Text>
            <View style={styles.pickerContainer}>
              <TouchableOpacity 
                style={[styles.pickerOption, newTip.scenario_type === 'profit' && styles.pickerOptionActive]}
                onPress={() => setNewTip(prev => ({ ...prev, scenario_type: 'profit' }))}
              >
                <Text style={styles.pickerText}>Profit</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.pickerOption, newTip.scenario_type === 'loss' && styles.pickerOptionActive]}
                onPress={() => setNewTip(prev => ({ ...prev, scenario_type: 'loss' }))}
              >
                <Text style={styles.pickerText}>Loss</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.pickerOption, newTip.scenario_type === 'general' && styles.pickerOptionActive]}
                onPress={() => setNewTip(prev => ({ ...prev, scenario_type: 'general' }))}
              >
                <Text style={styles.pickerText}>General</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.inputLabel}>Tip Message:</Text>
            <TextInput
              style={[styles.textInput, { height: 80 }]}
              placeholder="Enter the trading tip message..."
              value={newTip.tip_message}
              onChangeText={(text) => setNewTip(prev => ({ ...prev, tip_message: text }))}
              multiline
              autoComplete="off"
              selectTextOnFocus
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddTip(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={addTip}>
                <Text style={styles.saveButtonText}>Add Tip</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showAddRule} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Trading Rule</Text>
            
            <Text style={styles.inputLabel}>Rule Name:</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., High Quantity Alert"
              value={newRule.rule_name}
              onChangeText={(text) => setNewRule(prev => ({ ...prev, rule_name: text }))}
            />
            
            <Text style={styles.inputLabel}>Rule Type:</Text>
            <View style={styles.pickerContainer}>
              <TouchableOpacity 
                style={[styles.pickerOption, newRule.rule_type === 'quantity' && styles.pickerOptionActive]}
                onPress={() => setNewRule(prev => ({ ...prev, rule_type: 'quantity' }))}
              >
                <Text style={styles.pickerText}>Quantity</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.pickerOption, newRule.rule_type === 'value' && styles.pickerOptionActive]}
                onPress={() => setNewRule(prev => ({ ...prev, rule_type: 'value' }))}
              >
                <Text style={styles.pickerText}>Value</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.conditionRow}>
              <TouchableOpacity 
                style={[styles.operatorButton, newRule.comparison_operator === '>=' && styles.operatorActive]}
                onPress={() => setNewRule(prev => ({ ...prev, comparison_operator: '>=' }))}
              >
                <Text style={styles.operatorText}>&gt;=</Text>
              </TouchableOpacity>
              <TextInput
                style={[styles.textInput, { flex: 1, marginLeft: 10 }]}
                placeholder="Threshold value"
                value={newRule.threshold_value}
                onChangeText={(text) => setNewRule(prev => ({ ...prev, threshold_value: text }))}
                keyboardType="numeric"
              />
            </View>
            
            <Text style={styles.inputLabel}>Trigger Message:</Text>
            <TextInput
              style={[styles.textInput, { height: 80 }]}
              placeholder="Message to show when rule triggers..."
              value={newRule.trigger_message}
              onChangeText={(text) => setNewRule(prev => ({ ...prev, trigger_message: text }))}
              multiline
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddRule(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={addRule}>
                <Text style={styles.saveButtonText}>Add Rule</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function BadgeSystemConfig() {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditBadge, setShowEditBadge] = useState(false);
  const [editingBadge, setEditingBadge] = useState(null);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/badge-types`);
      const data = await response.json();
      setBadges(data);
    } catch (error) {
      alert('Failed to load badges');
    } finally {
      setLoading(false);
    }
  };

  const initBadges = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/init-badges`, {
        method: 'POST'
      });
      const data = await response.json();
      alert(data.message);
      fetchBadges();
    } catch (error) {
      alert('Failed to initialize badges');
    }
  };

  const editBadge = (badge) => {
    setEditingBadge({ ...badge });
    setShowEditBadge(true);
  };

  const updateBadgeThreshold = (field, value) => {
    setEditingBadge(prev => ({ ...prev, [field]: parseInt(value) || 0 }));
  };

  const saveBadgeChanges = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/badge-types/${editingBadge.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          min_value: editingBadge.min_value,
          max_value: editingBadge.max_value,
          description: editingBadge.description
        })
      });
      
      if (response.ok) {
        alert('Badge thresholds updated successfully!');
        setShowEditBadge(false);
        fetchBadges();
      }
    } catch (error) {
      alert('Failed to update badge thresholds');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text>Loading badges...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.configContainer}>
      <Text style={styles.configTitle}>Badge System Configuration</Text>
      <Text style={styles.configDescription}>
        Configure badge thresholds and criteria for risk score allocation
      </Text>
      
      <View style={styles.configCard}>
        <Text style={styles.cardTitle}>Risk Score Badge Thresholds: {badges.length}</Text>
        {badges.length === 0 ? (
          <TouchableOpacity style={styles.addButton} onPress={initBadges}>
            <Text style={styles.addButtonText}>Initialize Default Badges</Text>
          </TouchableOpacity>
        ) : (
          badges.map(badge => (
            <View key={badge.id} style={styles.badgeItem}>
              <Text style={styles.badgeIcon}>{badge.badge_icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.badgeName}>{badge.badge_name}</Text>
                <Text style={styles.badgeCriteria}>Risk Score: {badge.min_value}-{badge.max_value}</Text>
                <Text style={styles.badgeDescription}>{badge.description}</Text>
              </View>
              <TouchableOpacity style={styles.editItemButton} onPress={() => editBadge(badge)}>
                <Text style={styles.editItemText}>✏️</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      <Modal visible={showEditBadge} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Badge Thresholds</Text>
            
            {editingBadge && (
              <>
                <Text style={styles.inputLabel}>Badge: {editingBadge.badge_name}</Text>
                
                <View style={styles.thresholdRow}>
                  <Text style={styles.inputLabel}>Min Risk Score:</Text>
                  <TextInput
                    style={styles.scoreInput}
                    value={String(editingBadge.min_value)}
                    onChangeText={(value) => updateBadgeThreshold('min_value', value)}
                    keyboardType="numeric"
                  />
                  <Text style={styles.inputLabel}>Max Risk Score:</Text>
                  <TextInput
                    style={styles.scoreInput}
                    value={String(editingBadge.max_value)}
                    onChangeText={(value) => updateBadgeThreshold('max_value', value)}
                    keyboardType="numeric"
                  />
                </View>
                
                <Text style={styles.inputLabel}>Description:</Text>
                <TextInput
                  style={[styles.textInput, { height: 60 }]}
                  value={editingBadge.description}
                  onChangeText={(text) => setEditingBadge(prev => ({ ...prev, description: text }))}
                  multiline
                />
              </>
            )}
            
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowEditBadge(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={saveBadgeChanges}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function StockDataConfig() {
  return (
    <ScrollView style={styles.configContainer}>
      <Text style={styles.configTitle}>Stock Data Configuration</Text>
      <Text style={styles.configDescription}>
        Configure mock stock scenarios and case studies
      </Text>
      
      <View style={styles.configCard}>
        <Text style={styles.cardTitle}>Current Case Studies: 6</Text>
        <View style={styles.stockItem}>
          <Text style={styles.stockSymbol}>AAPL</Text>
          <Text style={styles.stockScenario}>iPhone 15 Launch Week</Text>
          <Text style={styles.stockPrice}>Base: $175</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => Alert.alert('Add Case Study', 'Feature coming soon!')}>
          <Text style={styles.addButtonText}>+ Add New Case Study</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function TutorialsConfig() {
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddTutorial, setShowAddTutorial] = useState(false);
  const [newTutorial, setNewTutorial] = useState({ level: 1, title: '', video_embed_id: '', content: [{ heading: '', body: '' }] });

  useEffect(() => {
    fetchTutorials();
  }, []);

  const fetchTutorials = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/tutorials`);
      const data = await response.json();
      setTutorials(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load tutorials');
    } finally {
      setLoading(false);
    }
  };

  const addTutorial = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/tutorials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTutorial)
      });
      
      if (response.ok) {
        alert('Tutorial added successfully!');
        setShowAddTutorial(false);
        setNewTutorial({ level: 1, title: '', video_embed_id: '', content: [{ heading: '', body: '' }] });
        fetchTutorials();
      }
    } catch (error) {
      alert('Failed to add tutorial');
    }
  };

  const deleteTutorial = async (tutorialId) => {
    const confirmed = confirm('Are you sure you want to delete this tutorial?');
    if (confirmed) {
      try {
        const response = await fetch(`${BACKEND_URL}/api/admin/tutorials/${tutorialId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          alert('Tutorial deleted successfully!');
          fetchTutorials();
        }
      } catch (error) {
        alert('Failed to delete tutorial');
      }
    }
  };

  const addContentSection = () => {
    setNewTutorial(prev => ({
      ...prev,
      content: [...prev.content, { heading: '', body: '' }]
    }));
  };

  const updateContentSection = (index, field, value) => {
    setNewTutorial(prev => ({
      ...prev,
      content: prev.content.map((section, i) => 
        i === index ? { ...section, [field]: value } : section
      )
    }));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text>Loading tutorials...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.configContainer}>
      <Text style={styles.configTitle}>Tutorials Management</Text>
      <Text style={styles.configDescription}>
        Manage learning modules, content sections, and educational materials
      </Text>
      
      <View style={styles.configCard}>
        <Text style={styles.cardTitle}>Current Tutorials: {tutorials.length}</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddTutorial(true)}>
          <Text style={styles.addButtonText}>+ Add New Tutorial</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.configCard}>
        <Text style={styles.cardTitle}>All Tutorials</Text>
        {tutorials.map(tutorial => (
          <View key={tutorial.id} style={styles.tutorialItem}>
            <View style={styles.tutorialContent}>
              <Text style={styles.tutorialTitle}>Level {tutorial.level}: {tutorial.title}</Text>
              <Text style={styles.tutorialMeta}>
                {tutorial.content?.filter(c => c.id).length || 0} sections
                {tutorial.video_embed_id && ' • Has video'}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.deleteButton} 
              onPress={() => deleteTutorial(tutorial.id)}
            >
              <Text style={styles.deleteButtonText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <Modal visible={showAddTutorial} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Tutorial</Text>
            
            <Text style={styles.inputLabel}>Level:</Text>
            <TextInput
              style={styles.textInput}
              value={String(newTutorial.level)}
              onChangeText={(text) => setNewTutorial(prev => ({ ...prev, level: parseInt(text) || 1 }))}
              keyboardType="numeric"
            />
            
            <Text style={styles.inputLabel}>Title:</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Tutorial title"
              value={newTutorial.title}
              onChangeText={(text) => setNewTutorial(prev => ({ ...prev, title: text }))}
            />
            
            <Text style={styles.inputLabel}>Video Embed ID (optional):</Text>
            <TextInput
              style={styles.textInput}
              placeholder="YouTube video ID"
              value={newTutorial.video_embed_id}
              onChangeText={(text) => setNewTutorial(prev => ({ ...prev, video_embed_id: text }))}
            />
            
            <Text style={styles.sectionTitle}>Content Sections:</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {newTutorial.content.map((section, index) => (
                <View key={index} style={styles.contentSection}>
                  <Text style={styles.sectionLabel}>Section {index + 1}</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Section heading"
                    value={section.heading}
                    onChangeText={(text) => updateContentSection(index, 'heading', text)}
                  />
                  <TextInput
                    style={[styles.textInput, { height: 80 }]}
                    placeholder="Section content"
                    value={section.body}
                    onChangeText={(text) => updateContentSection(index, 'body', text)}
                    multiline
                  />
                </View>
              ))}
            </ScrollView>
            
            <TouchableOpacity style={styles.addOptionButton} onPress={addContentSection}>
              <Text style={styles.addOptionText}>+ Add Content Section</Text>
            </TouchableOpacity>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddTutorial(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={addTutorial}>
                <Text style={styles.saveButtonText}>Add Tutorial</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function PortfolioConfig() {
  return (
    <ScrollView style={styles.configContainer}>
      <Text style={styles.configTitle}>Portfolio Configuration</Text>
      <Text style={styles.configDescription}>
        Configure virtual portfolio settings and formulas
      </Text>
      
      <View style={styles.configCard}>
        <Text style={styles.cardTitle}>Virtual Trading Settings</Text>
        <View style={styles.configRow}>
          <Text>Starting Balance:</Text>
          <Text style={styles.configValue}>₹100,000</Text>
        </View>
        <View style={styles.configRow}>
          <Text>Volatility Formula:</Text>
          <Text style={styles.configValue}>(score/100) * 0.30 + 0.04</Text>
        </View>
        <TouchableOpacity style={styles.editButton} onPress={() => Alert.alert('Edit Portfolio', 'Feature coming soon!')}>
          <Text style={styles.editButtonText}>Edit Portfolio Settings</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    backgroundColor: '#2c3e50',
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ecf0f1',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 250,
    backgroundColor: '#34495e',
    padding: 20,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  activeTab: {
    backgroundColor: '#3498db',
  },
  tabIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  tabLabel: {
    color: '#bdc3c7',
    fontSize: 16,
  },
  activeTabLabel: {
    color: 'white',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  configContainer: {
    flex: 1,
  },
  configTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  configDescription: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 20,
  },
  configCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  configRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  configValue: {
    fontWeight: 'bold',
    color: '#3498db',
  },
  editButton: {
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  editButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#27ae60',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  tipItem: {
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 10,
  },
  tipType: {
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  tipPreview: {
    color: '#7f8c8d',
    fontSize: 14,
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 10,
  },
  badgeIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  badgeName: {
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  badgeCriteria: {
    color: '#7f8c8d',
    fontSize: 14,
  },
  stockItem: {
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 10,
  },
  stockSymbol: {
    fontWeight: 'bold',
    color: '#2c3e50',
    fontSize: 16,
  },
  stockScenario: {
    color: '#7f8c8d',
    fontSize: 14,
  },
  stockPrice: {
    color: '#27ae60',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },
  questionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 10,
  },
  questionContent: {
    flex: 1,
  },
  questionText: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 5,
  },
  questionMeta: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    padding: 8,
    borderRadius: 6,
    marginLeft: 10,
  },
  deleteButtonText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
    outlineStyle: 'none',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  correctButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  correctButtonActive: {
    backgroundColor: '#27ae60',
  },
  correctButtonText: {
    fontSize: 18,
    color: 'white',
  },
  addOptionButton: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  addOptionText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
    padding: 12,
    borderRadius: 8,
    flex: 0.45,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#27ae60',
    padding: 12,
    borderRadius: 8,
    flex: 0.45,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  factorEditItem: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  factorLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2c3e50',
  },
  factorEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    width: 60,
    textAlign: 'center',
  },
  profileEditItem: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2c3e50',
  },
  profileEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    width: 50,
    textAlign: 'center',
    marginHorizontal: 5,
  },
  tutorialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 10,
  },
  tutorialContent: {
    flex: 1,
  },
  tutorialTitle: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  tutorialMeta: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  contentSection: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#2c3e50',
  },
  tipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  tipId: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: 'bold',
  },
  tipMessage: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
  },
  pickerContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  pickerOption: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    marginHorizontal: 2,
    borderRadius: 6,
  },
  pickerOptionActive: {
    backgroundColor: '#3498db',
  },
  pickerText: {
    color: '#2c3e50',
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  ruleItem: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  ruleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  ruleName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  ruleThreshold: {
    fontSize: 12,
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  ruleMessage: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  operatorButton: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 4,
    marginRight: 5,
    minWidth: 40,
    alignItems: 'center',
  },
  operatorActive: {
    backgroundColor: '#3498db',
  },
  operatorText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editItemButton: {
    backgroundColor: '#3498db',
    padding: 6,
    borderRadius: 4,
    marginLeft: 10,
  },
  editItemText: {
    fontSize: 14,
  },
  badgeDescription: {
    color: '#7f8c8d',
    fontSize: 12,
    marginTop: 2,
  },
  thresholdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  activeTabButton: {
    backgroundColor: '#3498db',
  },
  tabText: {
    color: '#7f8c8d',
    fontWeight: 'bold',
  },
  activeTabText: {
    color: 'white',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 10,
  },
  topUser: {
    backgroundColor: '#fff3cd',
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  userRank: {
    fontSize: 20,
    marginRight: 15,
    minWidth: 40,
    textAlign: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  topUserName: {
    color: '#856404',
  },
  userEmail: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  userStats: {
    fontSize: 12,
    color: '#6c757d',
  },
  userActions: {
    flexDirection: 'row',
  },
  viewButton: {
    backgroundColor: '#17a2b8',
    padding: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  editButton: {
    backgroundColor: '#ffc107',
    padding: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  detailText: {
    fontSize: 14,
    marginBottom: 8,
    color: '#2c3e50',
  },
  tradeText: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
    paddingLeft: 10,
  },
});