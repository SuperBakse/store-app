import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCart } from '../context/cart-context';
import { useCatalog } from '../context/catalog-context';
import type { Product } from '../types/product';
import { formatPrice } from '../utils/format-price';

const ACCENT = '#1F6FEB';
const ACCENT_LIGHT = '#EAF2FF';
const GREY_TEXT = '#7A7A7A';

const TAG_LABELS: Record<string, string> = {
  New: 'NEW',
  Popular: 'ХИТ',
  Sale: 'SALE',
};

// Внешняя часть: показывает Modal, пока в каталоге выбран товар.
export function ProductSheet() {
  const { selectedProduct, closeProduct } = useCatalog();
  // Попап (i) живёт здесь, чтобы кнопка «назад» на Android сначала закрывала его
  const [infoOpen, setInfoOpen] = useState(false);

  const handleClosed = () => {
    setInfoOpen(false);
    closeProduct();
  };

  return (
    <Modal
      visible={selectedProduct !== null}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={() => (infoOpen ? setInfoOpen(false) : handleClosed())}
    >
      {selectedProduct && (
        <SheetBody
          key={selectedProduct.id}
          product={selectedProduct}
          onClosed={handleClosed}
          infoOpen={infoOpen}
          setInfoOpen={setInfoOpen}
        />
      )}
    </Modal>
  );
}

type SheetBodyProps = {
  product: Product;
  onClosed: () => void;
  infoOpen: boolean;
  setInfoOpen: (open: boolean) => void;
};

function SheetBody({ product, onClosed, infoOpen, setInfoOpen }: SheetBodyProps) {
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { addItem } = useCart();

  // Обратная связь после добавления: кнопка на секунду показывает «Добавлено»
  const [added, setAdded] = useState(false);
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (addedTimer.current) clearTimeout(addedTimer.current);
    };
  }, []);

  // По умолчанию выбран первый размер (как в макете); для другого товара
  // sheet создаётся заново (key), поэтому выбор сбрасывается сам.
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(
    product.sizes[0]?.id ?? null
  );

  // 0 — sheet открыт, windowHeight — уехал за нижний край экрана
  const [translateY] = useState(() => new Animated.Value(windowHeight));

  // Актуальный onClosed для жеста: колбэк жеста читает его из ref
  const onClosedRef = useRef(onClosed);
  useEffect(() => {
    onClosedRef.current = onClosed;
  });

  // Следим, помещается ли текст: если да, прокрутка выключена и не мешает жесту
  const viewHeight = useRef(0);
  const contentHeight = useRef(0);
  const [scrollable, setScrollable] = useState(false);
  const updateScrollable = () => setScrollable(contentHeight.current > viewHeight.current + 1);

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

  // Добавляем в корзину именно выбранный размер; без размера кнопка неактивна
  const canAdd = selectedSizeId !== null;
  const handleAdd = () => {
    if (selectedSizeId === null) return;
    addItem(product.id, selectedSizeId);
    setAdded(true);
    if (addedTimer.current) clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setAdded(false), 1000);
  };

  // Закрытие (крестик, затемнение, свайп): уезжает вниз и только потом размонтируется
  const close = () => animateTo(windowHeight, onClosed);

  // Свайп вниз через react-native-gesture-handler: жест распознаётся на уровне
  // Android и не зависит от JS-системы касаний (старый PanResponder в Modal не получал
  // движение пальца). Колбэки выполняются в JS (runOnJS), анимация та же.
  const makePan = (enabled: boolean) =>
    Gesture.Pan()
      .runOnJS(true)
      .enabled(enabled)
      .activeOffsetY(10) // начинаем, когда палец ушёл вниз на 10 px
      .failOffsetX([-30, 30]) // горизонтальный жест — не наш
      .onUpdate((e) => {
        if (e.translationY > 0) translateY.setValue(e.translationY);
      })
      .onEnd((e, success) => {
        if (success && (e.translationY > 120 || e.velocityY > 800)) {
          Animated.timing(translateY, {
            toValue: windowHeight,
            duration: 200,
            useNativeDriver: true,
          }).start(({ finished }) => {
            if (finished) onClosedRef.current();
          });
        } else {
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
        }
      });

  // Текст короткий: тянуть можно за любое место карточки.
  // Текст длинный (прокручивается): тянуть можно только за ручку и картинку,
  // чтобы не мешать прокрутке текста.
  const sheetPan = makePan(!scrollable);
  const headerPan = makePan(scrollable);

  const backdropOpacity = translateY.interpolate({
    inputRange: [0, windowHeight],
    outputRange: [0.5, 0],
    extrapolate: 'clamp',
  });

  const specs = [
    { label: 'Материал', value: product.material },
    { label: 'Вес', value: product.weight },
    { label: 'Сезон', value: product.season },
    { label: 'Страна производства', value: product.countryOfOrigin },
  ];

  return (
    <GestureHandlerRootView style={styles.root}>
      {/* Затемнение: тап закрывает */}
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: backdropOpacity }]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      </Animated.View>

      <GestureDetector gesture={sheetPan}>
      <Animated.View
        style={[
          styles.sheet,
          { maxHeight: windowHeight * 0.9, transform: [{ translateY }] },
        ]}
      >
        {/* Шапка: ручка + картинка */}
        <GestureDetector gesture={headerPan}>
        <View>
          <View style={styles.handleArea}>
            <View style={styles.handle} />
          </View>

          <View style={styles.imageWrap}>
            <Image source={{ uri: product.imageUrl }} style={styles.image} />

            {/* Бейджи тегов, левый верхний угол */}
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
        </GestureDetector>

        {/* Прокрутка включается, только если текст не помещается: иначе
            ScrollView на Android перехватывает жест и мешает свайпу */}
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          bounces={false}
          scrollEnabled={scrollable}
          onLayout={(e) => {
            viewHeight.current = e.nativeEvent.layout.height;
            updateScrollable();
          }}
          onContentSizeChange={(_w, h) => {
            contentHeight.current = h;
            updateScrollable();
          }}
        >
          <View style={styles.content}>
            {/* Название + кнопка (i) в одной строке */}
            <View style={styles.titleRow}>
              <Text style={styles.name}>{product.name}</Text>
              <Pressable
                style={styles.infoButton}
                onPress={() => setInfoOpen(true)}
                hitSlop={8}
                accessibilityLabel="Характеристики товара"
              >
                <Text style={styles.infoButtonText}>i</Text>
              </Pressable>
            </View>

            <Text style={styles.description}>{product.longDescription}</Text>
          </View>
        </ScrollView>

        {/* Закреплено внизу: размеры + кнопка */}
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          {product.sizes.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sizes}
              style={styles.sizesScroll}
            >
              {product.sizes.map((size) => {
                const active = size.id === selectedSizeId;
                return (
                  <Pressable
                    key={size.id}
                    style={[styles.sizeChip, active && styles.sizeChipActive]}
                    onPress={() => setSelectedSizeId(size.id)}
                  >
                    <Text style={[styles.sizeText, active && styles.sizeTextActive]}>
                      {size.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}

          <Pressable
            style={[
              styles.cartButton,
              !canAdd && styles.cartButtonDisabled,
              added && styles.cartButtonAdded,
            ]}
            onPress={handleAdd}
            disabled={!canAdd}
          >
            <Text style={styles.cartButtonText}>
              {!canAdd
                ? product.sizes.length === 0
                  ? 'Нет доступных размеров'
                  : 'Выберите размер'
                : added
                  ? 'Добавлено ✓'
                  : `В корзину · ${formatPrice(product.priceInKopecks)}`}
            </Text>
          </Pressable>
        </View>
      </Animated.View>
      </GestureDetector>

      {/* Попап характеристик: обычный оверлей поверх sheet, без второго Modal */}
      {infoOpen && (
        <View style={[StyleSheet.absoluteFill, styles.infoOverlay]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setInfoOpen(false)} />

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Характеристики</Text>

            {specs.map((spec) => (
              <View key={spec.label} style={styles.specRow}>
                <Text style={styles.specLabel}>{spec.label}</Text>
                <Text style={styles.specValue}>{spec.value || '—'}</Text>
              </View>
            ))}

            <Pressable style={styles.infoClose} onPress={() => setInfoOpen(false)}>
              <Text style={styles.infoCloseText}>Закрыть</Text>
            </Pressable>
          </View>
        </View>
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { backgroundColor: '#000' },

  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  scroll: { flexShrink: 1 },

  handleArea: { alignItems: 'center', paddingVertical: 14, backgroundColor: '#fff' },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#D0D0D0' },

  imageWrap: {
    height: 260,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },

  tags: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 56,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagChip: {
    backgroundColor: ACCENT,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },

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

  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { flex: 1, fontSize: 22, fontWeight: 'bold' },
  infoButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: ACCENT_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoButtonText: { fontSize: 15, fontWeight: 'bold', color: ACCENT },
  description: { fontSize: 15, lineHeight: 22, color: GREY_TEXT, marginTop: 10 },

  footer: {
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#fff',
  },
  sizesScroll: { flexGrow: 0, marginBottom: 14 },
  sizes: { paddingHorizontal: 20, gap: 8 },
  sizeChip: {
    minWidth: 48,
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeChipActive: { backgroundColor: ACCENT },
  sizeText: { fontSize: 14, color: '#333' },
  sizeTextActive: { color: '#fff', fontWeight: '600' },

  cartButton: {
    marginHorizontal: 20,
    backgroundColor: ACCENT,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  cartButtonDisabled: { backgroundColor: '#C8C8C8' },
  cartButtonAdded: { backgroundColor: '#2E9E5B' },
  cartButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  infoOverlay: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  infoCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
  },
  infoTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  specRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  specLabel: { fontSize: 13, color: GREY_TEXT },
  specValue: { fontSize: 15, marginTop: 2 },
  infoClose: {
    marginTop: 16,
    backgroundColor: ACCENT_LIGHT,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  infoCloseText: { fontSize: 16, fontWeight: '600', color: ACCENT },
});
