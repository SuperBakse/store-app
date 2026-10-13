// Настройки API каталога. Чтобы проверить экран ошибки, временно
// поменяйте адрес на неверный (например, добавьте лишнюю букву).
export const API_BASE_URL = 'https://fefu2026spring.deploy.feip.dev';
export const CATALOG_URL = `${API_BASE_URL}/catalog`;

export const API_TOKEN = 'Cmt7wdwFgDIi1_SRX8hlJIExs0jJKPr4axflLpExAxM';

// fetch в React Native сам по себе не имеет таймаута
export const REQUEST_TIMEOUT_MS = 10_000;