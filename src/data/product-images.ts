import type { ImageSourcePropType } from 'react-native';

// require() принимает только статичную строку, поэтому каждый файл прописан явно.
// Ключ = значение поля imageUrl в products.json.
const LOCAL_IMAGES: Record<string, ImageSourcePropType> = {
  'ps5-pro.png': require('../../assets/images/products/ps5-pro.png'),
  'ps5-slim.png': require('../../assets/images/products/ps5-slim.png'),
  'gta6.png': require('../../assets/images/products/gta6.png'),
  'bass-guitar.png': require('../../assets/images/products/bass-guitar.png'),
  'comb.png': require('../../assets/images/products/comb.png'),
  'dj-pult.png': require('../../assets/images/products/dj-pult.png'),
  'synth.png': require('../../assets/images/products/synth.png'),
  'piano.png': require('../../assets/images/products/piano.png'),
  'strings.png': require('../../assets/images/products/strings.png'),
  'headphones.png': require('../../assets/images/products/headphones.png'),
  'interface.png': require('../../assets/images/products/interface.png'),
  'gig-bag.png': require('../../assets/images/products/gig-bag.png'),
};

const FALLBACK_IMAGE: ImageSourcePropType = {
  uri: 'https://placehold.co/400x400.png?text=No+image',
};

// http(s)-ссылка -> сетевая картинка ({ uri }).
// Иначе это имя локального файла -> готовый require() без uri-обёртки.
export function resolveProductImage(imageUrl: string): ImageSourcePropType {
  if (/^https?:\/\//i.test(imageUrl)) {
    return { uri: imageUrl };
  }
  return LOCAL_IMAGES[imageUrl] ?? FALLBACK_IMAGE;
}