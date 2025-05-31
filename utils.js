export async function selectOption(page, selector, value) {
  await page.waitForSelector(selector, { state: 'visible' });
  await page.selectOption(selector, value);
}