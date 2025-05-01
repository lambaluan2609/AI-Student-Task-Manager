import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  useColorScheme,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Camera, LogOut, Edit2, Check } from 'lucide-react-native';
import { useAuth } from '../services/AuthContext';
import { toast } from 'sonner-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { user, logout, updateProfile, isLoading } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.user_metadata?.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.user_metadata?.avatar_url || null);

  // Reset state when user changes
  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.full_name || '');
      setAvatarUrl(user.user_metadata?.avatar_url || null);
    }
  }, [user]);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        toast.error('Sorry, we need media library permissions to make this work!');
      }
    })();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await logout();
              toast.success('Logged out successfully');
            } catch (error) {
              console.error('Logout error:', error);
              toast.error('Failed to log out. Please try again.');
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    try {
      const { error } = await updateProfile({
        full_name: name,
        avatar_url: avatarUrl,
      });

      if (error) {
        toast.error(error);
      } else {
        toast.success('Profile updated successfully');
        setEditMode(false);
      }
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error('Failed to update profile. Please try again.');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatarUrl(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      toast.error('Failed to pick an image. Please try again.');
    }
  };

  // If user is not loaded yet, show loading indicator
  if (!user) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: isDark ? '#000' : '#fff' }]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      <LinearGradient
        colors={isDark ? ['#1a1a1a', '#000'] : ['#f5f5f5', '#fff']}
        style={styles.header}
      >
        <Text style={[styles.headerTitle, { color: isDark ? '#fff' : '#000' }]}>
          Profile
        </Text>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <LogOut size={20} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.profileSection}>
          <TouchableOpacity 
            style={styles.avatarContainer} 
            onPress={editMode ? pickImage : undefined}
            disabled={!editMode}
          >
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.placeholderAvatar, { backgroundColor: isDark ? '#333' : '#e0e0e0' }]}>
                <User size={40} color={isDark ? '#fff' : '#666'} />
              </View>
            )}
            {editMode && (
              <View style={styles.cameraIconContainer}>
                <Camera size={16} color="#fff" />
              </View>
            )}
          </TouchableOpacity>

          {editMode ? (
            <TextInput
              style={[
                styles.nameInput,
                {
                  backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
                  color: isDark ? '#fff' : '#000',
                  borderColor: isDark ? '#333' : '#ddd',
                },
              ]}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={isDark ? '#666' : '#999'}
            />
          ) : (
            <Text style={[styles.userName, { color: isDark ? '#fff' : '#000' }]}>
              {user.user_metadata?.full_name || 'User'}
            </Text>
          )}
          <Text style={[styles.userEmail, { color: isDark ? '#999' : '#666' }]}>
            {user.email || 'user@example.com'}
          </Text>
        </View>

        <View style={styles.accountSection}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>
            Account Information
          </Text>
          <View style={[styles.infoCard, { backgroundColor: isDark ? '#1a1a1a' : '#fff' }]}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: isDark ? '#fff' : '#000' }]}>
                Username
              </Text>
              <Text style={[styles.infoValue, { color: isDark ? '#999' : '#666' }]}>
                {user.email?.split('@')[0] || 'username'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: isDark ? '#fff' : '#000' }]}>
                Account Type
              </Text>
              <Text style={[styles.infoValue, { color: isDark ? '#999' : '#666' }]}>
                Student
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: isDark ? '#fff' : '#000' }]}>
                Join Date
              </Text>
              <Text style={[styles.infoValue, { color: isDark ? '#999' : '#666' }]}>
                May 15, 2023
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.aboutSection}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>
            App Information
          </Text>
          <View style={[styles.infoCard, { backgroundColor: isDark ? '#1a1a1a' : '#fff' }]}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: isDark ? '#fff' : '#000' }]}>
                Version
              </Text>
              <Text style={[styles.infoValue, { color: isDark ? '#999' : '#666' }]}>
                1.0.0
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: isDark ? '#fff' : '#000' }]}>
                Build
              </Text>
              <Text style={[styles.infoValue, { color: isDark ? '#999' : '#666' }]}>
                42
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.editButton,
          editMode ? styles.saveButton : null,
          { opacity: isLoading ? 0.7 : 1 }
        ]}
        onPress={editMode ? handleSaveProfile : () => setEditMode(true)}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            {editMode ? <Check size={20} color="#fff" /> : <Edit2 size={20} color="#fff" />}
            <Text style={styles.editButtonText}>{editMode ? 'Save Profile' : 'Edit Profile'}</Text>
          </>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  logoutButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  placeholderAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
  },
  nameInput: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    width: '80%',
    marginBottom: 8,
  },
  accountSection: {
    marginBottom: 24,
  },
  aboutSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
  },
  editButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  saveButton: {
    backgroundColor: '#34C759',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 