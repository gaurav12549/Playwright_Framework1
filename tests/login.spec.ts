import { test, expect } from '@playwright/test';
import { LoginPage } from '../Pages/loginPage.js';

test('valid login test', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.navigate();
  await loginPage.login('student', 'Password123');

  await expect(loginPage.banner).toContainText(
    "Congratulations student. You successfully logged in!"
  );
});