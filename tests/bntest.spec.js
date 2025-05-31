import { test, expect } from '@playwright/test';
import { selectOption } from '../utils.js';

const searchTerm = 'Harry Potter';

test('Barnes & Noble E2E Test', async ({ page }) => {
  // 1. Navigare la pagina principală
  await page.goto('https://www.barnesandnoble.com/');

  // 2. Gestionare banner cookie (dacă există)
  const cookieButton = page.locator('button[id*="accept"]');
  if (await cookieButton.isVisible()) {
    await cookieButton.click();
  }

  // 3. Verificare că bara de căutare este vizibilă
  await expect(page.locator('input#searchBarBN')).toBeVisible();

  // 4. Completare formular căutare (Formular 1)
  await page.fill('input#searchBarBN', searchTerm);

  // 5. Trimitere formular căutare
  await page.press('input#searchBarBN', 'Enter');

  // 6. Așteptare rezultate căutare
  await page.waitForSelector('.product-shelf-list');

  // 7. Verificare că rezultatele sunt afișate
  const results = page.locator('.product-shelf-tile');
  await expect(results).toHaveCountGreaterThan(0);

  // 8. Aplicare filtru categorie "Books" (Formular 2)
  await selectOption(page, 'select#formatFilter', 'Books');

  // 9. Aplicare filtru format "Hardcover" (Formular 3)
  await selectOption(page, 'select#bindingFilter', 'Hardcover');

  // 10. Așteptare actualizare rezultate (improved)
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('.product-shelf-tile', { state: 'visible' });

  // 11. Selectare prima carte din rezultate (improved)
  const firstBook = page.locator('.product-shelf-tile').first();
  await firstBook.waitFor({ state: 'visible' });
  const bookTitle = await firstBook.locator('h3').textContent();
  await firstBook.click();

  // 12. Așteptare pagină detalii carte
  await page.waitForSelector('.pdp-main');

  // 13. Verificare titlu carte
  const detailsTitle = await page.locator('h1[itemprop="name"]').textContent();
  await expect(detailsTitle).toContain(searchTerm);

  // 14. Setare cantitate la 2 (improved error handling)
  const quantitySelector = page.locator('select#quantity');
  try {
    await quantitySelector.waitFor({ state: 'visible', timeout: 5000 });
    await quantitySelector.selectOption('2');
  } catch (error) {
    console.log('Quantity selector not available, proceeding with default quantity');
  }

  // 15. Adăugare în coș (improved)
  await page.waitForSelector('button#add-to-cart', { state: 'visible' });
  await page.click('button#add-to-cart');

  // 16. Verificare mesaj de confirmare (improved)
  try {
    await expect(page.locator('.add-to-cart-confirmation')).toBeVisible({ timeout: 10000 });
  } catch (error) {
    // Alternative selector if the first one doesn't work
    await expect(page.locator('[data-testid="add-to-cart-success"], .cart-notification, .success-message')).toBeVisible({ timeout: 5000 });
  }

  // 17. Navigare la coș (improved)
  await page.waitForSelector('a[href*="/cart"]', { state: 'visible' });
  await page.click('a[href*="/cart"]');

  // 18. Așteptare pagină coș
  await page.waitForSelector('.cart-items');

  // 19. Verificare conținut coș (improved)
  const cartItem = page.locator('.cart-item').first();
  await cartItem.waitFor({ state: 'visible' });
  const cartItemTitle = await cartItem.locator('.item-title').textContent();
  const cartItemQuantity = await cartItem.locator('.quantity-value').textContent();
  await expect(cartItemTitle).toContain(bookTitle.trim());
  await expect(cartItemQuantity).toContain('2');

  // 20. Captură de ecran
  await page.screenshot({ path: 'cart-page.png' });
});