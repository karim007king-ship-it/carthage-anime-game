'use strict';
const { test, expect } = require('@playwright/test');
test('chapter 27 lab renders timeline JSON without browser errors', async ({ page }) => {
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://127.0.0.1:41739/examples/qarton-single-load-lab.html');
  await expect(page.getByRole('heading',{name:'حمولة واحدة'})).toBeVisible();
  await expect(page.locator('[data-choice="prioritizeBridge"]')).toBeDisabled();
  await page.getByRole('button',{name:/تشغيل/}).click();
  await expect(page.locator('#subtitle')).toContainText('نور');
  await page.getByRole('button',{name:/إيقاف/}).click();
  await page.getByRole('button',{name:/إعادة/}).click();
  await expect(page.locator('#subtitle')).toContainText('...');
  expect(errors).toEqual([]);
});
