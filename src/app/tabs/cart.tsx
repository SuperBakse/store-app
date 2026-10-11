import { useRouter } from 'expo-router';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCart } from '../../context/cart-context';
import { useCatalog } from '../../context/catalog-context';
import { resolveProductImage } from '../../data/product-images';
import type { Product } from '../../types/product';
import { formatPrice } from '../../utils/format-price';

export default function CartScreen() {
  const router = useRouter();
  const { items, increment, decrement, remove, clearCart } = useCart();
  const { products } = useCatalog();

  const cartProducts = items
    .map((cartItem) => {
      const product = products.find((p) => p.id === cartItem.id);
      return product ? { ...product, quantity: cartItem.quantity } : null;
    })
    .filter(Boolean) as (Product & { quantity: number })[];

  const total = cartProducts.reduce(
    (sum, item) => sum + item.priceInKopecks * item.quantity,
    0
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Корзина</Text>

      {cartProducts.length === 0 ? (
        <Text style={styles.empty}>Пока пусто</Text>
      ) : (
        <FlatList
          data={cartProducts}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 16 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <TouchableOpacity
                onPress={() => router.push({ pathname: '/product', params: { id: item.id } })}
              >
                <Image source={resolveProductImage(item.imageUrl)} style={styles.image} />
              </TouchableOpacity>

              <View style={styles.info}>
                <View style={styles.headerRow}>
                  <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                  <TouchableOpacity onPress={() => remove(item.id)}>
                    <Text style={styles.removeText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.price}>{formatPrice(item.priceInKopecks)}</Text>

                <View style={styles.qtyRow}>
                  <TouchableOpacity style={styles.qtyButton} onPress={() => decrement(item.id)}>
                    <Text style={styles.qtyButtonText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{item.quantity}</Text>
                  <TouchableOpacity style={styles.qtyButton} onPress={() => increment(item.id)}>
                    <Text style={styles.qtyButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      )}

      {cartProducts.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Итого</Text>
            <Text style={styles.totalValue}>{formatPrice(total)}</Text>
          </View>

          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={() => {
              clearCart();
              router.push('/checkout-success');
            }}
          >
            <Text style={styles.checkoutButtonText}>Перейти к оформлению</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 15, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginVertical: 15 },
  empty: { fontSize: 16, color: '#7A7A7A' },

  card: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 12,
    resizeMode: 'contain',
    backgroundColor: '#F5F5F5',
  },
  info: { flex: 1 },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  name: { fontSize: 15, fontWeight: 'bold', flex: 1, marginRight: 8 },
  removeText: { fontSize: 16, color: '#B0B0B0' },

  price: { fontSize: 15, fontWeight: 'bold', marginTop: 4 },

  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  qtyButton: { width: 20, alignItems: 'center' },
  qtyButtonText: { fontSize: 16, fontWeight: 'bold', color: '#1F6FEB' },
  qtyText: { fontSize: 14, minWidth: 16, textAlign: 'center' },

  footer: {
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  totalLabel: { fontSize: 16, color: '#7A7A7A' },
  totalValue: { fontSize: 18, fontWeight: 'bold' },

  checkoutButton: {
    backgroundColor: '#1F6FEB',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  checkoutButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});