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

  // 10. Așteptare actualizare rezultate
  await page.waitForTimeout(1000); // Înlocuiți cu o condiție specifică dacă e posibil

  // 11. Selectare prima carte din rezultate
  const firstBook = results.first();
  const bookTitle = await firstBook.locator('h3').textContent();
  await firstBook.click();

  // 12. Așteptare pagină detalii carte
  await page.waitForSelector('.pdp-main');

  // 13. Verificare titlu carte
  const detailsTitle = await page.locator('h1[itemprop="name"]').textContent();
  await expect(detailsTitle).toContain(searchTerm);

  // 14. Setare cantitate la 2 (dacă e disponibil)
  const quantitySelector = page.locator('select#quantity');
  if (await quantitySelector.isVisible()) {
    await quantitySelector.selectOption('2');
  }

  // 15. Adăugare în coș
  await page.click('button#add-to-cart');

  // 16. Verificare mesaj de confirmare
  await expect(page.locator('.add-to-cart-confirmation')).toBeVisible();

  // 17. Navigare la coș
  await page.click('a[href*="/cart"]');

  // 18. Așteptare pagină coș
  await page.waitForSelector('.cart-items');

  // 19. Verificare conținut coș
  const cartItem = page.locator('.cart-item').first();
  const cartItemTitle = await cartItem.locator('.item-title').textContent();
  const cartItemQuantity = await cartItem.locator('.quantity-value').textContent();
  await expect(cartItemTitle).toContain(bookTitle.trim());
  await expect(cartItemQuantity).toContain('2');

  // 20. Captură de ecran
  await page.screenshot({ path: 'cart-page.png' });
});