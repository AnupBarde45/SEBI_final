import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useUser } from '../context/UserContext';

const UserHeader = ({ navigation }) => {
  const { user, logout } = useUser();
  const [showDropdown, setShowDropdown] = useState(false);

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  };

  const handleMenuPress = (action) => {
    setShowDropdown(false);
    switch (action) {
      case 'dashboard':
        navigation.navigate('UserDashboard');
        break;
      case 'profile':
        navigation.navigate('UserProfile');
        break;
      case 'settings':
        navigation.navigate('Settings');
        break;
      case 'about':
        navigation.navigate('About');
        break;
      case 'logout':
        logout();
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
        break;
    }
  };

  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity 
        style={styles.avatarContainer}
        onPress={() => setShowDropdown(true)}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
        </View>
      </TouchableOpacity>

      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          onPress={() => setShowDropdown(false)}
        >
          <View style={styles.dropdown}>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
              </View>
              <Text style={styles.userName}>{user?.name}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
            </View>
            
            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuPress('dashboard')}>
              <Text style={styles.menuText}>📊 My Dashboard</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuPress('profile')}>
              <Text style={styles.menuText}>👤 User Profile</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuPress('settings')}>
              <Text style={styles.menuText}>⚙️ Settings</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuPress('about')}>
              <Text style={styles.menuText}>ℹ️ About Us</Text>
            </TouchableOpacity>
            
            <View style={styles.separator} />
            
            <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuPress('logout')}>
              <Text style={[styles.menuText, styles.logoutText]}>🚪 Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1000,
  },
  avatarContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 90,
    paddingRight: 20,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 12,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  userInfo: {
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  userEmail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  menuItem: {
    padding: 12,
    paddingHorizontal: 16,
  },
  menuText: {
    fontSize: 14,
    color: '#333',
  },
  logoutText: {
    color: '#dc3545',
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 16,
  },
});

export default UserHeader;