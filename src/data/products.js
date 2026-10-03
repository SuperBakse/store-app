// src/data/products.js
const products = [
  {
    id: 1,
    name: "PlayStation 5 Pro",
    price: 149990,
    image: require('../../assets/images/products/ps5-pro.png'),
    description: "Топовая версия консоли с усиленным GPU, поддержкой 4K/120fps и трассировкой лучей.",
    category: "gaming",
    isNew: true
  },
  {
    id: 2,
    name: "PlayStation 5 Slim",
    price: 94990,
    image: require('../../assets/images/products/ps5-slim.png'),
    description: "Компактная версия консоли девятого поколения с приводом для дисков.",
    category: "gaming",
    isNew: true
  },
  {
    id: 3,
    name: "GTA 6 (предзаказ)",
    price: 9990,
    image: require('../../assets/images/products/gta6.png'),
    description: "Долгожданная часть серии от Rockstar Games, предзаказ цифровой версии.",
    category: "gaming",
    isNew: true
  },
  {
    id: 4,
    name: "Бас-гитара Höfner 500/1 (Contemporary)",
    price: 112900,
    image: require('../../assets/images/products/bass-guitar.png'),
    description: "4-струнная бас-гитара с активной электроникой и корпусом из красного дерева.",
    category: "music",
    isNew: false
  },
  {
    id: 5,
    name: "Комбик для бас-гитары Fender Rumble 40",
    price: 41190,
    image: require('../../assets/images/products/comb.png'),
    description: "Усилитель мощностью 40 Вт с 10-дюймовым динамиком, специально под бас.",
    category: "music",
    isNew: false
  },
  {
    id: 6,
    name: "DJ-контроллер Pioneer DDJ-FLX4",
    price: 42990,
    image: require('../../assets/images/products/dj-pult.png'),
    description: "Диджейский пульт с 2 деками, поддержкой rekordbox и Serato DJ Lite.",
    category: "music",
    isNew: true
  },
  {
    id: 7,
    name: "Синтезатор Korg Minilogue",
    price: 72990,
    image: require('../../assets/images/products/synth.png'),
    description: "4-голосный аналоговый синтезатор с полифонией и встроенным секвенсором.",
    category: "music",
    isNew: true
  },
  {
    id: 8,
    name: "Электропианино Yamaha P-145",
    price: 58990,
    image: require('../../assets/images/products/piano.png'),
    description: "Компактное цифровое пианино с 88 взвешенными клавишами и реалистичным звуком.",
    category: "music",
    isNew: false
  },
  {
    id: 9,
    name: "Струны Elixir Nanoweb для бас-гитары",
    price: 10490,
    image: require('../../assets/images/products/strings.png'),
    description: "Комплект струн с полимерным покрытием для долгого срока службы и яркого звука.",
    category: "music",
    isNew: false
  },
  {
    id: 10,
    name: "Студийные наушники Audio-Technica ATH-M50x",
    price: 20990,
    image: require('../../assets/images/products/headphones.png'),
    description: "Закрытые мониторные наушники с точным звуком, стандарт для звукорежиссёров.",
    category: "music",
    isNew: false
  },
  {
    id: 11,
    name: "Аудиоинтерфейс Focusrite Scarlett 2i2",
    price: 16990,
    image: require('../../assets/images/products/interface.png'),
    description: "2-канальная звуковая карта для записи гитары, баса и вокала с минимальной задержкой.",
    category: "music",
    isNew: false
  },
  {
    id: 12,
    name: "Чехол для бас-гитары Fender FB405 (gig bag)",
    price: 6490,
    image: require('../../assets/images/products/gig-bag.png'),
    description: "Мягкий чехол с утеплителем и накладными карманами для аксессуаров.",
    category: "music",
    isNew: false
  }
];

export default products;