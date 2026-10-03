import { Stack, useLocalSearchParams } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useCart } from '../context/cart-context';

import products from '../data/products';

export default function ProductScreen() {
  const { id } = useLocalSearchParams();

  const product = products.find(
    (item) => item.id === Number(id)
  );

  const { addToCart } = useCart();

  if (!product) {
    return <Text>Товар не найден</Text>;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Товар',
          headerBackTitle: 'Назад',
        }}
      />

      <ScrollView style={styles.container}>
        <Image
          source={product.image }
          style={styles.image}
        />

        <Text style={styles.name}>
          {product.name}
        </Text>

        <Text style={styles.price}>
          {product.price} ₽
        </Text>

        <Text style={styles.description}>
          {product.description}
        </Text>

        <TouchableOpacity style={styles.button} onPress={() => addToCart(product.id)}>
          <Text style={styles.buttonText}>В корзину</Text>
        </TouchableOpacity>

      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },

  image: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
  },

  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
  },

  price: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 15,
  },

  description: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 20,
  },

  button: {
    backgroundColor: '#1F6FEB',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});