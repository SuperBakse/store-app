import { useEffect, useMemo, useState } from 'react';
import {
  Animated,
  Image,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCart } from '../context/cart-context';
import { useCatalog } from '../context/catalog-context';
import type { Product } from '../types/product';
import { formatPrice } from '../utils/format-price';

const TAG_LABELS: Record<string, string> = {
  New: 'Новинка',
  Popular: 'Популярное',
  Sale: 'Скидка',
};

// Внешняя часть: показывает Modal, пока в каталоге выбран товар.
export function ProductSheet() {
  const { selectedProduct, closeProduct } = useCatalog();

  return (
    <Modal
      visible={selectedProduct !== null}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={closeProduct}
    >
      {selectedProduct && (
        <SheetBody
          key={selectedProduct.id}
          product={selectedProduct}
          onClosed={closeProduct}
        />
      )}
    </Modal>
  );
}

function SheetBody({ product, onClosed }: { product: Product; onClosed: () => void }) {
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { items, addToCart } = useCart();

  // 0 — sheet открыт, windowHeight — уехал за нижний край экрана
  const [translateY] = useState(() => new Animated.Value(windowHeight));

  const quantity = items.find((i) => i.id === product.id)?.quantity ?? 0;

  const animateTo = (toValue: number, done?: () => void) => {
    Animated.timing(translateY, {
      toValue,
      duration: 250,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && done) done();
    });
  };

  // Плавное появление при открытии
  useEffect(() => {
    animateTo(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Закрытие (крестик, затемнение, кнопка «назад», свайп): уезжает вниз и только потом размонтируется
  const close = () => animateTo(windowHeight, onClosed);

  // Свайп вниз за шапку (ручка + картинка)
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_e, g) =>
          g.dy > 6 && Math.abs(g.dy) > Math.abs(g.dx),
        onPanResponderMove: (_e, g) => {
          if (g.dy > 0) translateY.setValue(g.dy);
        },
        onPanResponderRelease: (_e, g) => {
          if (g.dy > 120 || g.vy > 0.8) {
            Animated.timing(translateY, {
              toValue: windowHeight,
              duration: 200,
              useNativeDriver: true,
            }).start(({ finished }) => {
              if (finished) onClosed();
            });
          } else {
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          }
        },
        onPanResponderTerminate: () => {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        },
      }),
    [translateY, windowHeight, onClosed]
  );

  const backdropOpacity = translateY.interpolate({
    inputRange: [0, windowHeight],
    outputRange: [0.5, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.root}>
      {/* Затемнение: тап закрывает */}
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: backdropOpacity }]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      </Animated.View>

      <Animated.View
        style={[
          styles.sheet,
          { maxHeight: windowHeight * 0.9, transform: [{ translateY }] },
        ]}
      >
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Шапка: ручка + картинка, за неё тянем sheet вниз */}
          <View {...panResponder.panHandlers}>
            <View style={styles.handleArea}>
              <View style={styles.handle} />
            </View>

            <View style={styles.imageWrap}>
              <Image source={{ uri: product.imageUrl }} style={styles.image} />

              {/* Теги чипами поверх картинки, левый верхний угол */}
              <View style={styles.tags}>
                {product.tags.map((tag) => (
                  <View key={tag} style={styles.tagChip}>
                    <Text style={styles.tagText}>{TAG_LABELS[tag] ?? tag}</Text>
                  </View>
                ))}
              </View>

              {/* Крестик, правый верхний угол */}
              <Pressable style={styles.closeButton} onPress={close} hitSlop={8}>
                <Text style={styles.closeText}>✕</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.content}>
            <Text style={styles.name}>{product.name}</Text>
            <Text style={styles.price}>{formatPrice(product.priceInKopecks)}</Text>
            <Text style={styles.description}>{product.longDescription}</Text>
          </View>
        </ScrollView>

        {/* Закреплено внизу */}
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <Pressable style={styles.cartButton} onPress={() => addToCart(product.id)}>
            <Text style={styles.cartButtonText}>
              {quantity > 0 ? `В корзину (уже в корзине: ${quantity})` : 'В корзину'}
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { backgroundColor: '#000' },

  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  scroll: { flexShrink: 1 },

  handleArea: { alignItems: 'center', paddingVertical: 10, backgroundColor: '#fff' },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#D0D0D0' },

  imageWrap: { width: '100%', height: 300, backgroundColor: '#F5F5F5' },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },

  tags: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 60,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagChip: {
    backgroundColor: '#1F6FEB',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { fontSize: 16, color: '#333', fontWeight: 'bold' },

  content: { padding: 20 },
  name: { fontSize: 22, fontWeight: 'bold' },
  price: { fontSize: 22, fontWeight: 'bold', color: '#1F6FEB', marginTop: 8 },
  description: { fontSize: 15, lineHeight: 22, color: '#7A7A7A', marginTop: 12 },

  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#fff',
  },
  cartButton: {
    backgroundColor: '#1F6FEB',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cartButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
