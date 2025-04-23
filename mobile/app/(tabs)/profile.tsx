import React, { useState } from "react";
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button, Modal, Card, Text as KittenText } from "@ui-kitten/components";
import { useAuth } from "@/hooks/useAuth";

export default function ProfileScreen() {
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutAlertVisible, setLogoutAlertVisible] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const handleLogout = async () => {
    setLogoutAlertVisible(true);
    // Limpar qualquer erro anterior
    setLogoutError(null);
  };

  const confirmLogout = async () => {
    setLogoutAlertVisible(false);
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      setLogoutError(
        "Não foi possível fazer logout. Tente novamente mais tarde."
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Ionicons name="person-circle" size={80} color="#007AFF" />
          <Text style={styles.name}>Camila Silva</Text>
          <Text style={styles.email}>camila@example.com</Text>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.logoutText}>Sair</Text>
          )}
        </TouchableOpacity>

        {/* Mensagem de erro */}
        {logoutError && <Text style={styles.errorText}>{logoutError}</Text>}
      </ScrollView>

      {/* Alert do UI Kitten */}
      <Modal
        visible={logoutAlertVisible}
        backdropStyle={styles.backdrop}
        onBackdropPress={() => setLogoutAlertVisible(false)}
      >
        <Card disabled={true} style={styles.alertCard}>
          <KittenText category="h6" style={styles.alertTitle}>
            Deseja sair?
          </KittenText>
          <KittenText style={styles.alertDescription}>
            Você será desconectado da sua conta.
          </KittenText>
          <View style={styles.alertButtonsContainer}>
            <Button
              style={styles.alertButton}
              appearance="outline"
              onPress={() => setLogoutAlertVisible(false)}
            >
              Cancelar
            </Button>
            <Button
              style={[styles.alertButton, styles.alertButtonDanger]}
              status="danger"
              onPress={confirmLogout}
            >
              Sair
            </Button>
          </View>
        </Card>
      </Modal>

      {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conta</Text>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="person" size={24} color="#666" />
            <Text style={styles.menuItemText}>Editar perfil</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="notifications" size={24} color="#666" />
            <Text style={styles.menuItemText}>Notificações</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferências</Text>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="fitness" size={24} color="#666" />
            <Text style={styles.menuItemText}>Objetivos de treino</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="settings" size={24} color="#666" />
            <Text style={styles.menuItemText}>Configurações</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Estilos existentes
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 12,
  },
  email: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  logoutButton: {
    margin: 24,
    backgroundColor: "#ff3b30",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  // Novos estilos para o Alert do UI Kitten
  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  alertCard: {
    width: 280,
    borderRadius: 8,
  },
  alertTitle: {
    marginBottom: 8,
    fontWeight: "bold",
  },
  alertDescription: {
    marginBottom: 20,
  },
  alertButtonsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  alertButton: {
    marginLeft: 8,
    minWidth: 80,
  },
  alertButtonDanger: {
    backgroundColor: "#ff3b30",
    borderColor: "#ff3b30",
  },

  // Adicione o estilo para a mensagem de erro
  errorText: {
    color: "#ff3b30",
    textAlign: "center",
    marginHorizontal: 24,
    marginTop: 8,
    fontSize: 14,
  },

  // Outros estilos existentes
  section: {
    backgroundColor: "#fff",
    marginTop: 24,
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuItemText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    color: "#333",
  },
});
