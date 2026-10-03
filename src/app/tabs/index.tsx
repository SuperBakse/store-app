import { router } from 'expo-router';
import { useState } from 'react';
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../../context/cart-context';
import products from '../../data/products';

const FILTERS = [
  { key: 'new', label: 'Новинки' },
  { key: 'gaming', label: 'Гейминг' },
  { key: 'music', label: 'Музыка' },
];

export default function HomeScreen() {
  const [filter, setFilter] = useState('new');
  const { items, addToCart, increment, decrement } = useCart();

  const list = products.filter((p) =>
    filter === 'new' ? p.isNew : p.category === filter
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Каталог товаров</Text>

      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[styles.chip, filter === f.key && styles.chipActive]}
              onPress={() => setFilter(f.key)}
            >
              <Text
                style={[
                  styles.chipText,
                  filter === f.key && styles.chipTextActive,
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={list}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const cartItem = items.find((i) => i.id === item.id);
          const quantity = cartItem?.quantity ?? 0;

          return (
            <TouchableOpacity
              style={styles.row}
              onPress={() =>
                router.push({ pathname: '/product', params: { id: item.id } })
              }
            >
              <Image source={item.image} style={styles.image} />

              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.description} numberOfLines={2}>
                  {item.description}
                </Text>

                {quantity === 0 ? (
                  <TouchableOpacity
                    style={styles.pricePill}
                    onPress={() => addToCart(item.id)}
                  >
                    <Text style={styles.priceText}>{item.price} ₽</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.miniQtyRow}>
                    <TouchableOpacity
                      style={styles.miniQtyButton}
                      onPress={() => decrement(item.id)}
                    >
                      <Text style={styles.miniQtyButtonText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.miniQtyText}>{quantity}</Text>
                    <TouchableOpacity
                      style={styles.miniQtyButton}
                      onPress={() => increment(item.id)}
                    >
                      <Text style={styles.miniQtyButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 15, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 5 },
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
  image: { width: 90, height: 100, resizeMode: 'contain' },
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
  miniQtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#EAF2FF',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 8,
  },
  miniQtyButton: { width: 16, alignItems: 'center' },
  miniQtyButtonText: { fontSize: 15, fontWeight: 'bold', color: '#1F6FEB' },
  miniQtyText: { fontSize: 13, fontWeight: '600', minWidth: 14, textAlign: 'center' },
});