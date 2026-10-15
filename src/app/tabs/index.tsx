import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useCatalog } from '../../context/catalog-context';
import { formatPrice } from '../../utils/format-price';

export default function HomeScreen() {
  const {
    status,
    // errorMessage,
    reload,
    tabs,
    selectedTabId,
    selectTab,
    visibleProducts,
    openProduct,
  } = useCatalog();

  if (status === 'loading') {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Каталог товаров</Text>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1F6FEB" />
        </View>
      </SafeAreaView>
    );
  }

  if (status === 'error') {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Каталог товаров</Text>
        <View style={styles.center}>
          <Text style={styles.stateTitle}>Не удалось загрузить каталог</Text>
          {/* <Text style={styles.stateText}>{errorMessage}</Text> */}
          <TouchableOpacity style={styles.retryButton} onPress={reload}>
            <Text style={styles.retryButtonText}>Повторить</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Каталог товаров</Text>

      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.chip, selectedTabId === tab.id && styles.chipActive]}
              onPress={() => selectTab(tab.id)}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedTabId === tab.id && styles.chipTextActive,
                ]}
              >
                {tab.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={visibleProducts}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>В этой категории пока нет товаров</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => openProduct(item.id)}>
            <Image source={{ uri: item.imageUrl }} style={styles.image} />

            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.description} numberOfLines={2}>
                {item.shortDescription}
              </Text>

              {/* Цена — просто подпись; добавление в корзину только из карточки товара */}
              <View style={styles.pricePill}>
                <Text style={styles.priceText}>{formatPrice(item.priceInKopecks)}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 15, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 5 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  stateTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  stateText: { fontSize: 14, color: '#7A7A7A', textAlign: 'center', marginTop: 8 },
  retryButton: {
    backgroundColor: '#1F6FEB',
    borderRadius: 10,
    paddingHorizontal: 28,
    paddingVertical: 12,
    marginTop: 20,
  },
  retryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  emptyText: { fontSize: 15, color: '#7A7A7A', textAlign: 'center', marginTop: 40 },
  chips: { paddingVertical: 12, gap: 8 },
  chip: {
    backgroundColor: '#F2F2F2',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chipActive: { backgroundColor: '#1F6FEB' },
  chipText: { fontSize: 14, color: '#333' },
  chipTextActive: { color: '#fff' },
  row: { flexDirection: 'row', paddingVertical: 12, gap: 12 },
  image: { width: 90, height: 100, borderRadius: 8, resizeMode: 'cover', backgroundColor: '#F5F5F5' },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold' },
  description: { fontSize: 13, color: '#7A7A7A', marginTop: 4 },
  pricePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#EAF2FF',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 8,
  },
  priceText: { fontSize: 14, fontWeight: '600', color: '#1F6FEB' },
});