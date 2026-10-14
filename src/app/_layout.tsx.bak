import { Stack } from 'expo-router';

import { ProductSheet } from '../components/product-sheet';
import { CartProvider } from '../context/cart-context';
import { CatalogProvider } from '../context/catalog-context';

export default function RootLayout() {
  return (
    <CatalogProvider>
      <CartProvider>
        <Stack>
          <Stack.Screen
            name="tabs"
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="checkout-success"
            options={{ title: '', headerBackTitle: 'Назад' }}
          />

          <Stack.Screen
            name="checkout-error"
            options={{ title: '', headerBackTitle: 'Назад' }}
          />
        </Stack>

        {/* Один bottom sheet на всё приложение; сам решает, показываться ли */}
        <ProductSheet />
      </CartProvider>
    </CatalogProvider>
  );
}
