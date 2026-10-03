import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CheckoutSuccessScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>✓</Text>
        </View>

        <Text style={styles.title}>Заказ успешно оформлен</Text>
        <Text style={styles.subtitle}>
          Подтверждение и чек отправили на вашу почту
        </Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => router.replace('/tabs')}>
        <Text style={styles.buttonText}>Вернуться на главную</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, justifyContent: 'space-between' },
  content: { alignItems: 'center', marginTop: 100 },
  iconCircle: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#EAF2FF', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  icon: { fontSize: 32, color: '#1F6FEB' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#7A7A7A', textAlign: 'center' },
  button: { backgroundColor: '#1F6FEB', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginBottom: 16 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});