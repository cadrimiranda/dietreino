import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface Message {
  id: string;
  text: string;
  isFromUser: boolean;
  timestamp: Date;
  read: boolean;
}

export default function UserProfile() {
  const { logout } = useAuth();
  const { user, loading } = useCurrentUser();
  const [selectedTab, setSelectedTab] = useState<'profile' | 'chat' | 'stats'>('profile');
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Olá! Como foi o treino de hoje?',
      isFromUser: false,
      timestamp: new Date('2025-06-13T10:30:00'),
      read: true,
    },
    {
      id: '2',
      text: 'Foi ótimo! Consegui aumentar a carga no supino inclinado.',
      isFromUser: true,
      timestamp: new Date('2025-06-13T14:15:00'),
      read: true,
    },
    {
      id: '3',
      text: 'Excelente! Na próxima semana vamos focar mais no desenvolvimento dos ombros.',
      isFromUser: false,
      timestamp: new Date('2025-06-13T16:45:00'),
      read: true,
    },
    {
      id: '4',
      text: 'Você tem alguma dúvida sobre a técnica dos exercícios?',
      isFromUser: false,
      timestamp: new Date('2025-06-14T09:00:00'),
      read: false,
    }
  ]);

  const userName = user?.name || 'Usuário';
  const userEmail = user?.email || '';
  const trainerName = 'Dr. Carlos Santos';

  const handleLogout = () => {
    Alert.alert(
      'Sair da Conta',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: logout }
      ]
    );
  };

  const handleSendMessage = () => {
    if (messageText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: messageText.trim(),
        isFromUser: true,
        timestamp: new Date(),
        read: true,
      };
      setMessages([...messages, newMessage]);
      setMessageText('');
    }
  };

  const renderProfileTab = () => (
    <ScrollView style={styles.tabContent}>
      {/* User Info Card */}
      <View style={styles.userCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#007AFF" />
          </View>
          <TouchableOpacity style={styles.editAvatarButton}>
            <Ionicons name="camera" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.userName}>{userName}</Text>
        <Text style={styles.userEmail}>{userEmail}</Text>
        <TouchableOpacity style={styles.editProfileButton}>
          <Ionicons name="create-outline" size={20} color="#007AFF" />
          <Text style={styles.editProfileText}>Editar Perfil</Text>
        </TouchableOpacity>
      </View>

      {/* Trainer Info Card */}
      <View style={styles.trainerCard}>
        <View style={styles.trainerHeader}>
          <View style={styles.trainerAvatar}>
            <Ionicons name="fitness" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.trainerInfo}>
            <Text style={styles.trainerName}>{trainerName}</Text>
            <Text style={styles.trainerTitle}>Personal Trainer</Text>
            <View style={styles.trainerStatus}>
              <View style={styles.onlineIndicator} />
              <Text style={styles.onlineText}>Online</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.messageButton}
            onPress={() => setSelectedTab('chat')}
          >
            <Ionicons name="chatbubble" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Estatísticas Rápidas</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>47</Text>
            <Text style={styles.statLabel}>Treinos</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Semanas</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>+15kg</Text>
            <Text style={styles.statLabel}>Progresso</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>85%</Text>
            <Text style={styles.statLabel}>Frequência</Text>
          </View>
        </View>
      </View>

      {/* Settings Menu */}
      <View style={styles.menuCard}>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="notifications-outline" size={24} color="#8E8E93" />
          <Text style={styles.menuItemText}>Notificações</Text>
          <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="settings-outline" size={24} color="#8E8E93" />
          <Text style={styles.menuItemText}>Configurações</Text>
          <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="help-circle-outline" size={24} color="#8E8E93" />
          <Text style={styles.menuItemText}>Ajuda e Suporte</Text>
          <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="document-text-outline" size={24} color="#8E8E93" />
          <Text style={styles.menuItemText}>Termos de Uso</Text>
          <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
        <Text style={styles.logoutText}>Sair da Conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderChatTab = () => (
    <View style={styles.chatContainer}>
      <View style={styles.chatHeader}>
        <View style={styles.trainerAvatar}>
          <Ionicons name="fitness" size={20} color="#FFFFFF" />
        </View>
        <View>
          <Text style={styles.chatTrainerName}>{trainerName}</Text>
          <Text style={styles.chatTrainerStatus}>Online agora</Text>
        </View>
      </View>

      <ScrollView style={styles.messagesContainer}>
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageContainer,
              message.isFromUser ? styles.userMessage : styles.trainerMessage
            ]}
          >
            <Text style={[
              styles.messageText,
              message.isFromUser ? styles.userMessageText : styles.trainerMessageText
            ]}>
              {message.text}
            </Text>
            <Text style={styles.messageTime}>
              {message.timestamp.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.messageInputContainer}>
        <TextInput
          style={styles.messageInput}
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Digite sua mensagem..."
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !messageText.trim() && styles.sendButtonDisabled
          ]}
          onPress={handleSendMessage}
          disabled={!messageText.trim()}
        >
          <Ionicons name="send" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStatsTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.achievementsCard}>
        <Text style={styles.achievementsTitle}>Conquistas</Text>
        <View style={styles.achievementsList}>
          <View style={styles.achievementItem}>
            <View style={styles.achievementIcon}>
              <Ionicons name="trophy" size={24} color="#FFD700" />
            </View>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementName}>Primeira Semana</Text>
              <Text style={styles.achievementDescription}>
                Completou sua primeira semana de treinos
              </Text>
            </View>
          </View>
          
          <View style={styles.achievementItem}>
            <View style={styles.achievementIcon}>
              <Ionicons name="flame" size={24} color="#FF6B47" />
            </View>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementName}>Sequência de 7 dias</Text>
              <Text style={styles.achievementDescription}>
                Treinou 7 dias consecutivos
              </Text>
            </View>
          </View>
          
          <View style={styles.achievementItem}>
            <View style={styles.achievementIcon}>
              <Ionicons name="trending-up" size={24} color="#34C759" />
            </View>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementName}>Evolução Consistente</Text>
              <Text style={styles.achievementDescription}>
                Aumentou a carga em 3 exercícios seguidos
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.goalsCard}>
        <Text style={styles.goalsTitle}>Metas Mensais</Text>
        <View style={styles.goalItem}>
          <Text style={styles.goalText}>Frequência de Treino</Text>
          <View style={styles.goalProgress}>
            <View style={[styles.goalProgressFill, { width: '80%' }]} />
          </View>
          <Text style={styles.goalPercentage}>16/20 dias</Text>
        </View>
        
        <View style={styles.goalItem}>
          <Text style={styles.goalText}>Aumento de Carga</Text>
          <View style={styles.goalProgress}>
            <View style={[styles.goalProgressFill, { width: '60%' }]} />
          </View>
          <Text style={styles.goalPercentage}>6/10 exercícios</Text>
        </View>
      </View>
    </ScrollView>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Tabs */}
      <View style={styles.header}>
        <Text style={styles.title}>Perfil</Text>
        <View style={styles.tabSelector}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'profile' && styles.tabActive]}
            onPress={() => setSelectedTab('profile')}
          >
            <Ionicons
              name="person"
              size={20}
              color={selectedTab === 'profile' ? '#FFFFFF' : '#8E8E93'}
            />
            <Text style={[
              styles.tabText,
              selectedTab === 'profile' && styles.tabTextActive
            ]}>Perfil</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'chat' && styles.tabActive]}
            onPress={() => setSelectedTab('chat')}
          >
            <Ionicons
              name="chatbubble"
              size={20}
              color={selectedTab === 'chat' ? '#FFFFFF' : '#8E8E93'}
            />
            <Text style={[
              styles.tabText,
              selectedTab === 'chat' && styles.tabTextActive
            ]}>Chat</Text>
            {messages.some(m => !m.read && !m.isFromUser) && (
              <View style={styles.notificationBadge} />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'stats' && styles.tabActive]}
            onPress={() => setSelectedTab('stats')}
          >
            <Ionicons
              name="trophy"
              size={20}
              color={selectedTab === 'stats' ? '#FFFFFF' : '#8E8E93'}
            />
            <Text style={[
              styles.tabText,
              selectedTab === 'stats' && styles.tabTextActive
            ]}>Stats</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Content */}
      {selectedTab === 'profile' && renderProfileTab()}
      {selectedTab === 'chat' && renderChatTab()}
      {selectedTab === 'stats' && renderStatsTab()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 4,
  },
  tabActive: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  notificationBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
    marginLeft: 4,
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  
  // Profile Tab Styles
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 16,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    gap: 8,
  },
  editProfileText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  trainerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  trainerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trainerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  trainerInfo: {
    flex: 1,
  },
  trainerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  trainerTitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  trainerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
  },
  onlineText: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '600',
  },
  messageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FF3B30',
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
  
  // Chat Tab Styles
  chatContainer: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    gap: 12,
  },
  chatTrainerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  chatTrainerStatus: {
    fontSize: 14,
    color: '#34C759',
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    marginBottom: 16,
    borderRadius: 16,
    padding: 12,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  trainerMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  trainerMessageText: {
    color: '#1C1C1E',
  },
  messageTime: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'right',
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    gap: 12,
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E5EA',
  },
  
  // Stats Tab Styles
  achievementsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  achievementsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  achievementsList: {
    gap: 16,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  goalsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  goalsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  goalItem: {
    marginBottom: 16,
  },
  goalText: {
    fontSize: 16,
    color: '#1C1C1E',
    marginBottom: 8,
  },
  goalProgress: {
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  goalPercentage: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'right',
  },
});