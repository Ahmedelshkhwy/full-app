import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';

const PRIMARY = '#23B6C7';
const PINK = '#E94B7B';
const BG = '#E6F3F7';
const API_BASE = 'http://192.168.8.87:5000/api/admin';

interface User {
  _id: string;
  username: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  totalOrders?: number;
  totalSpent?: number;
}

export default function UsersManagement() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    phone: '',
    role: 'user' as 'user' | 'admin',
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      Alert.alert('غير مصرح', 'هذه الصفحة للمسؤولين فقط');
      router.back();
      return;
    }

    loadUsers();
  }, [user]);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, users]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`${API_BASE}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        console.error('فشل في جلب المستخدمين:', response.status);
        Alert.alert('خطأ', 'فشل في جلب المستخدمين من الخادم');
        setUsers([]);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('خطأ', 'فشل في تحميل قائمة المستخدمين');
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(user =>
      user?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user?.phone?.includes(searchQuery)
    );
    setFilteredUsers(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const handleUserPress = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleEditUser = (user: User) => {
    setEditForm({
      username: user?.username || '',
      email: user?.email || '',
      phone: user?.phone || '',
      role: user?.role || 'user',
    });
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!selectedUser) { return; }

    try {
      const response = await fetch(`${API_BASE}/users/${selectedUser._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setUsers(users.filter(u => u._id !== selectedUser._id));
        Alert.alert('نجح', 'تم حذف المستخدم بنجاح');
      } else {
        Alert.alert('خطأ', 'فشل في حذف المستخدم');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      Alert.alert('خطأ', 'فشل في حذف المستخدم');
    } finally {
      setShowDeleteModal(false);
      setSelectedUser(null);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) { return; }

    try {
      const response = await fetch(`${API_BASE}/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const updatedUsers = users.map(u =>
          u._id === selectedUser._id
            ? { ...u, ...editForm }
            : u
        );
        setUsers(updatedUsers);
        Alert.alert('نجح', 'تم تحديث بيانات المستخدم بنجاح');
      } else {
        Alert.alert('خطأ', 'فشل في تحديث بيانات المستخدم');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      Alert.alert('خطأ', 'فشل في تحديث بيانات المستخدم');
    } finally {
      setShowEditModal(false);
      setSelectedUser(null);
    }
  };

  const toggleUserStatus = async (user: User) => {
    try {
      const response = await fetch(`${API_BASE}/users/${user._id}/toggle-status`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const updatedUsers = users.map(u =>
          u._id === user._id
            ? { ...u, isActive: !u.isActive }
            : u
        );
        setUsers(updatedUsers);
        Alert.alert('نجح', `تم ${user.isActive ? 'إيقاف' : 'تفعيل'} المستخدم بنجاح`);
      } else {
        Alert.alert('خطأ', 'فشل في تغيير حالة المستخدم');
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      Alert.alert('خطأ', 'فشل في تغيير حالة المستخدم');
    }
  };

  const getRoleColor = (role: string) => {
    return role === 'admin' ? '#f44336' : '#4caf50';
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? '#4caf50' : '#f44336';
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={PRIMARY} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={styles.loadingText}>جاري تحميل المستخدمين...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={PRIMARY} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>إدارة المستخدمين</Text>
        <View style={styles.headerRight}>
          <Text style={styles.userCount}>{filteredUsers.length} مستخدم</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="البحث في المستخدمين..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[PRIMARY]}
            tintColor={PRIMARY}
          />
        }
      >
        {filteredUsers.map((user) => (
          <View key={user._id} style={styles.userCard}>
            <TouchableOpacity
              style={styles.userInfo}
              onPress={() => handleUserPress(user)}
            >
              <View style={styles.userAvatar}>
                <Ionicons name="person" size={24} color="white" />
              </View>

              <View style={styles.userDetails}>
                <View style={styles.userHeader}>
                  <Text style={styles.userName}>{user?.username || '---'}</Text>
                  <View style={styles.badges}>
                    <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user?.role || 'user') }]}>
                      <Text style={styles.roleText}>
                        {user?.role === 'admin' ? 'مسؤول' : 'مستخدم'}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(user?.isActive || false) }]}>
                      <Text style={styles.statusText}>
                        {user?.isActive ? 'نشط' : 'موقوف'}
                      </Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.userEmail}>{user?.email || '---'}</Text>
                {user?.phone && <Text style={styles.userPhone}>{user.phone}</Text>}

                <View style={styles.userStats}>
                  <Text style={styles.statText}>
                    الطلبات: {user?.totalOrders || 0}
                  </Text>
                  <Text style={styles.statText}>
                    إجمالي الإنفاق: {user?.totalSpent || 0} ريال
                  </Text>
                </View>

                <Text style={styles.userDate}>
                  انضم في {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ar-SA') : '---'}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.userActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => handleEditUser(user)}
              >
                <Ionicons name="create-outline" size={20} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.toggleButton]}
                onPress={() => toggleUserStatus(user)}
              >
                <Ionicons
                  name={user?.isActive ? "pause-outline" : "play-outline"}
                  size={20}
                  color="white"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDeleteUser(user)}
              >
                <Ionicons name="trash-outline" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {filteredUsers.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchQuery ? 'لا توجد نتائج للبحث' : 'لا يوجد مستخدمين'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* User Details Modal */}
      <Modal
        visible={showUserModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowUserModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>تفاصيل المستخدم</Text>
              <TouchableOpacity onPress={() => setShowUserModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {selectedUser && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>الاسم:</Text>
                  <Text style={styles.detailValue}>{selectedUser?.username || '---'}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>البريد الإلكتروني:</Text>
                  <Text style={styles.detailValue}>{selectedUser?.email || '---'}</Text>
                </View>

                {selectedUser?.phone && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>رقم الهاتف:</Text>
                    <Text style={styles.detailValue}>{selectedUser.phone}</Text>
                  </View>
                )}

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>الدور:</Text>
                  <Text style={styles.detailValue}>
                    {selectedUser?.role === 'admin' ? 'مسؤول' : 'مستخدم'}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>الحالة:</Text>
                  <Text style={styles.detailValue}>
                    {selectedUser?.isActive ? 'نشط' : 'موقوف'}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>تاريخ الانضمام:</Text>
                  <Text style={styles.detailValue}>
                    {selectedUser?.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('ar-SA') : '---'}
                  </Text>
                </View>

                {selectedUser?.lastLogin && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>آخر تسجيل دخول:</Text>
                    <Text style={styles.detailValue}>
                      {new Date(selectedUser.lastLogin).toLocaleDateString('ar-SA')}
                    </Text>
                  </View>
                )}

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>إجمالي الطلبات:</Text>
                  <Text style={styles.detailValue}>{selectedUser?.totalOrders || 0}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>إجمالي الإنفاق:</Text>
                  <Text style={styles.detailValue}>{selectedUser?.totalSpent || 0} ريال</Text>
                </View>
              </ScrollView>
            )}

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.editModalButton]}
                onPress={() => {
                  setShowUserModal(false);
                  handleEditUser(selectedUser!);
                }}
              >
                <Text style={styles.modalButtonText}>تعديل</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.closeModalButton]}
                onPress={() => setShowUserModal(false)}
              >
                <Text style={styles.modalButtonText}>إغلاق</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>تعديل المستخدم</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>الاسم</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.username}
                  onChangeText={(text) => setEditForm({ ...editForm, username: text })}
                  placeholder="أدخل الاسم"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>البريد الإلكتروني</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.email}
                  onChangeText={(text) => setEditForm({ ...editForm, email: text })}
                  placeholder="أدخل البريد الإلكتروني"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>رقم الهاتف</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.phone}
                  onChangeText={(text) => setEditForm({ ...editForm, phone: text })}
                  placeholder="أدخل رقم الهاتف"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>الدور</Text>
                <View style={styles.roleSelector}>
                  <TouchableOpacity
                    style={[
                      styles.roleOption,
                      editForm.role === 'user' && styles.roleOptionActive
                    ]}
                    onPress={() => setEditForm({ ...editForm, role: 'user' })}
                  >
                    <Text style={[
                      styles.roleOptionText,
                      editForm.role === 'user' && styles.roleOptionTextActive
                    ]}>مستخدم</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.roleOption,
                      editForm.role === 'admin' && styles.roleOptionActive
                    ]}
                    onPress={() => setEditForm({ ...editForm, role: 'admin' })}
                  >
                    <Text style={[
                      styles.roleOptionText,
                      editForm.role === 'admin' && styles.roleOptionTextActive
                    ]}>مسؤول</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveModalButton]}
                onPress={handleUpdateUser}
              >
                <Text style={styles.modalButtonText}>حفظ التغييرات</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.modalButtonText}>إلغاء</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContent}>
            <Ionicons name="warning" size={48} color="#f44336" />
            <Text style={styles.deleteModalTitle}>تأكيد الحذف</Text>
            <Text style={styles.deleteModalText}>
              هل أنت متأكد من حذف المستخدم &quot;{selectedUser?.username}&quot;؟
              هذا الإجراء لا يمكن التراجع عنه.
            </Text>

            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteModalButton]}
                onPress={confirmDeleteUser}
              >
                <Text style={styles.modalButtonText}>حذف</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.modalButtonText}>إلغاء</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: PRIMARY,
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    minWidth: 60,
  },
  userCount: {
    color: 'white',
    fontSize: 14,
    textAlign: 'right',
  },
  searchContainer: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: 10,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  userInfo: {
    flexDirection: 'row',
    padding: 20,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  userDetails: {
    flex: 1,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  userStats: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 8,
  },
  statText: {
    fontSize: 12,
    color: '#999',
  },
  userDate: {
    fontSize: 12,
    color: '#999',
  },
  userActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    padding: 15,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#2196f3',
  },
  toggleButton: {
    backgroundColor: '#ff9800',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    textAlign: 'left',
    marginLeft: 10,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editModalButton: {
    backgroundColor: '#2196f3',
  },
  saveModalButton: {
    backgroundColor: '#4caf50',
  },
  closeModalButton: {
    backgroundColor: '#666',
  },
  cancelModalButton: {
    backgroundColor: '#999',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 10,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  roleOptionActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  roleOptionText: {
    fontSize: 14,
    color: '#666',
  },
  roleOptionTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  deleteModalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '80%',
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 12,
  },
  deleteModalText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  deleteModalButtons: {
    flexDirection: 'row',
    gap: 15,
    width: '100%',
  },
  deleteModalButton: {
    backgroundColor: '#f44336',
  },
}); 