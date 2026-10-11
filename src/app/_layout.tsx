import { Stack } from 'expo-router';
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
            name="product"
            options={{ title: 'Товар', headerBackTitle: 'Назад' }}
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
      </CartProvider>
    </CatalogProvider>
  );
}