import type { Page, Locator } from '@playwright/test';
import { HealerAgent } from './healerAgent.js';

export class HealerLoginPage {
  readonly page: Page;
  readonly healer: HealerAgent;
  username: Locator;
  password: Locator;
  loginBtn: Locator;
  banner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.healer = new HealerAgent(page);
    // Initial selectors
    this.username = page.locator('#username');
    this.password = page.locator('#password');
    this.loginBtn = page.locator('#submit');
    this.banner = page.locator('//strong');
  }

  async navigate() {
    await this.page.goto('https://practicetestautomation.com/practice-test-login/');
  }

  async login(user: string, pass: string) {
    // Heal username
    const usernameSelector = await this.healer.healLocator('#username', [
      '[name="username"]',
      'input[type="text"]',
      'input[placeholder*="user"]',
    ]);
    this.username = this.page.locator(usernameSelector);
    await this.username.fill(user);

    // Heal password
    const passwordSelector = await this.healer.healLocator('#password', [
      '[name="password"]',
      'input[type="password"]',
      'input[placeholder*="pass"]',
    ]);
    this.password = this.page.locator(passwordSelector);
    await this.password.fill(pass);

    // Heal login button
    const loginBtnSelector = await this.healer.healLocator('#submit', [
      'button[type="submit"]',
      'button:has-text("Log in")',
      'input[type="submit"]',
    ]);
    this.loginBtn = this.page.locator(loginBtnSelector);
    await this.loginBtn.click();
  }

  async getBannerText() {
    // Heal banner
    const bannerSelector = await this.healer.healLocator('//strong', [
      'div.banner',
      'h2',
      'div:has-text("Congratulations")',
    ]);
    this.banner = this.page.locator(bannerSelector);
    return await this.banner.textContent();
  }

  getHealerLogs() {
    return this.healer.getLogs();
  }
}
