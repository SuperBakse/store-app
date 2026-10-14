import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCart } from '../../context/cart-context';
import { useCatalog } from '../../context/catalog-context';
import type { Product, Size } from '../../types/product';
import { formatPrice } from '../../utils/format-price';

const ACCENT = '#1F6FEB';
const ACCENT_LIGHT = '#EAF2FF';
const GREY_TEXT = '#7A7A7A';

type CartLine = {
  product: Product;
  size: Size;
  quantity: number;
};

export default function CartScreen() {
  const { items, hydrated, increment, decrement, remove, clear } = useCart();
  const { status, reload, getProductById, openProduct } = useCatalog();

  // Собираем строки: данные товара и размера берём из каталога по id
  const lines: CartLine[] = [];
  for (const item of items) {
    const product = getProductById(item.itemId);
    const size = product?.sizes.find((s) => s.id === item.sizeId);
    if (product && size) lines.push({ product, size, quantity: item.quantity });
  }

  const total = lines.reduce((sum, l) => sum + l.product.priceInKopecks * l.quantity, 0);

  const confirmClear = () => {
    Alert.alert('Очистить корзину?', 'Все товары будут удалены из корзины.', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Очистить', style: 'destructive', onPress: clear },
    ]);
  };

  const checkout = () => {
    clear();
    Alert.alert('Заказ оформлен', 'Спасибо за покупку! Мы уже собираем ваш заказ.');
  };

  // Пока корзина читается с диска или каталог грузится — показываем загрузку
  if (!hydrated || status === 'loading') {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Корзина</Text>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={ACCENT} />
          <Text style={styles.hint}>Загружаем корзину…</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Каталог не загрузился, а в корзине есть сохранённые товары: показать их нечем
  if (status === 'error' && items.length > 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Корзина</Text>
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>Не удалось загрузить каталог</Text>
          <Text style={styles.hint}>
            Ваши товары сохранены. Проверьте интернет и повторите попытку.
          </Text>
          <Pressable style={styles.retryButton} onPress={reload}>
            <Text style={styles.retryText}>Повторить</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (lines.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Корзина</Text>
        <View style={styles.center}>
          <View style={styles.emptyIcon}>
            <Text style={styles.emptyIconText}>🛒</Text>
          </View>
          <Text style={styles.emptyTitle}>Корзина пуста</Text>
          <Text style={styles.hint}>
            Выберите товар в каталоге, укажите размер и нажмите «В корзину»
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.titleInRow}>Корзина</Text>
        <Pressable onPress={confirmClear} hitSlop={8}>
          <Text style={styles.clearText}>Очистить</Text>
        </Pressable>
      </View>

      <FlatList
        data={lines}
        keyExtractor={(l) => `${l.product.id}:${l.size.id}`}
        contentContainerStyle={{ paddingBottom: 16 }}
        renderItem={({ item: line }) => (
          <View style={styles.card}>
            <Pressable onPress={() => openProduct(line.product.id)}>
              <Image source={{ uri: line.product.imageUrl }} style={styles.image} />
            </Pressable>

            <View style={styles.info}>
              <View style={styles.headerRow}>
                <Text style={styles.name} numberOfLines={2}>
                  {line.product.name}
                </Text>
                <Pressable
                  onPress={() => remove(line.product.id, line.size.id)}
                  hitSlop={10}
                  accessibilityLabel="Удалить из корзины"
                >
                  <Text style={styles.removeText}>✕</Text>
                </Pressable>
              </View>

              <Text style={styles.size}>Размер: {line.size.name}</Text>

              <View style={styles.bottomRow}>
                <View style={styles.qtyRow}>
                  <Pressable
                    style={styles.qtyButton}
                    onPress={() => decrement(line.product.id, line.size.id)}
                    hitSlop={8}
                  >
                    <Text style={styles.qtyButtonText}>−</Text>
                  </Pressable>
                  <Text style={styles.qtyText}>{line.quantity}</Text>
                  <Pressable
                    style={styles.qtyButton}
                    onPress={() => increment(line.product.id, line.size.id)}
                    hitSlop={8}
                  >
                    <Text style={styles.qtyButtonText}>+</Text>
                  </Pressable>
                </View>

                <Text style={styles.price}>
                  {formatPrice(line.product.priceInKopecks * line.quantity)}
                </Text>
              </View>
            </View>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Итого</Text>
          <Text style={styles.totalValue}>{formatPrice(total)}</Text>
        </View>

        <Pressable style={styles.checkoutButton} onPress={checkout}>
          <Text style={styles.checkoutButtonText}>Оформить</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 15, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginVertical: 15 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 15,
  },
  titleInRow: { fontSize: 28, fontWeight: 'bold' },
  clearText: { fontSize: 15, fontWeight: '600', color: ACCENT },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: ACCENT_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyIconText: { fontSize: 44 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  hint: { fontSize: 15, color: GREY_TEXT, textAlign: 'center', marginTop: 8, lineHeight: 21 },
  retryButton: {
    marginTop: 20,
    backgroundColor: ACCENT,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  retryText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  card: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 12,
    resizeMode: 'cover',
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

  size: { fontSize: 13, color: GREY_TEXT, marginTop: 2 },

  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  qtyButton: { width: 20, alignItems: 'center' },
  qtyButtonText: { fontSize: 16, fontWeight: 'bold', color: ACCENT },
  qtyText: { fontSize: 14, minWidth: 16, textAlign: 'center' },
  price: { fontSize: 16, fontWeight: 'bold' },

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
  totalLabel: { fontSize: 16, color: GREY_TEXT },
  totalValue: { fontSize: 18, fontWeight: 'bold' },

  checkoutButton: {
    backgroundColor: ACCENT,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  checkoutButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
