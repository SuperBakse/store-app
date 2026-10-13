import { API_TOKEN, CATALOG_URL, REQUEST_TIMEOUT_MS } from '../constants/api';
import type { CatalogData, Category, Product } from '../types/product';

// Единственное место, которое знает, откуда берутся данные каталога.
// Все ошибки выбрасываются как Error с понятным русским текстом.
export async function loadCatalog(signal?: AbortSignal): Promise<CatalogData> {
  const controller = new AbortController();
  let timedOut = false;

  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  // Отмена снаружи (например, нажали «Повторить») тоже обрывает запрос
  const abortFromOutside = () => controller.abort();
  signal?.addEventListener('abort', abortFromOutside);

  try {
    const res = await fetch(CATALOG_URL, {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    // fetch не бросает ошибку на 401/500, поэтому проверяем статус сами
    if (!res.ok) {
      throw new Error(`Сервер вернул ошибку (${res.status})`);
    }

    const json: unknown = await res.json();
    return parseCatalog(json);
  } catch (e) {
    if (signal?.aborted) throw e;
    if (timedOut) throw new Error('Сервер слишком долго не отвечает');
    if (e instanceof SyntaxError) throw new Error('Сервер вернул некорректные данные');
    if (e instanceof TypeError) throw new Error('Нет соединения с сервером');
    throw e;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', abortFromOutside);
  }
}

function parseCatalog(data: unknown): CatalogData {
  const WRONG_FORMAT = 'Сервер вернул данные в неожиданном формате';

  if (typeof data !== 'object' || data === null) throw new Error(WRONG_FORMAT);

  const { categories, items } = data as { categories?: unknown; items?: unknown };
  if (!Array.isArray(categories) || !Array.isArray(items)) throw new Error(WRONG_FORMAT);

  const products = (items as Product[])
    .filter((p) => p && typeof p.id === 'string')
    .map((p) => ({
      ...p,
      tags: Array.isArray(p.tags) ? p.tags : [],
      sizes: Array.isArray(p.sizes) ? p.sizes : [],
    }));

  return { categories: categories as Category[], items: products };
}