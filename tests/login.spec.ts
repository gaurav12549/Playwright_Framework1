import { test, expect } from '@playwright/test';
import { HealerLoginPage } from '../Pages/healerLoginPage.js';

test('valid login test', async ({ page }) => {
  const loginPage = new HealerLoginPage(page);

  await loginPage.navigate();
  await loginPage.login('student', 'Password123');

  await expect(loginPage.banner).toContainText(
    "Congratulations student. You successfully logged in!"
  );

  // Log healer agent actions
  console.log('Healer logs:', loginPage.getHealerLogs());
});