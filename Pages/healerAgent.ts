import type { Page } from '@playwright/test';

export class HealerAgent {
  private page: Page;
  private log: string[] = [];

  constructor(page: Page) {
    this.page = page;
  }


  async healLocator(selector: string, alternatives: string[]): Promise<string> {
    // Try the original selector
    try {
      await this.page.waitForSelector(selector, { timeout: 2000 });
      return selector;
    } catch (e) {
      this.log.push(`Original locator failed: ${selector}`);
    }

    // Try alternatives
    for (const alt of alternatives) {
      try {
        await this.page.waitForSelector(alt, { timeout: 2000 });
        this.log.push(`Locator healed: ${selector} -> ${alt}`);
        return alt;
      } catch (e) {
        this.log.push(`Alternative failed: ${alt}`);
      }
    }

    // Fuzzy healing: scan DOM for similar elements (by id, name, placeholder, label, role)
    const fuzzySelector = await this.fuzzyHeal(selector);
    if (fuzzySelector) {
      this.log.push(`Fuzzy healed: ${selector} -> ${fuzzySelector}`);
      return fuzzySelector;
    }

    throw new Error(`No valid locator found for: ${selector}`);
  }

  // Fuzzy healing logic: scan DOM for similar elements
  async fuzzyHeal(selector: string): Promise<string | null> {
    // Try to extract a base name from the selector
    const base = selector.replace(/[#.\[\]=:'"\s]/g, '');
    // Try id, name, placeholder, label, role
    const candidates = await this.page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('input,button,textarea,select,label'));
      return elements.map(el => {
        return {
          tag: el.tagName.toLowerCase(),
          id: el.id,
          name: (el as any).name,
          placeholder: (el as any).placeholder,
          type: (el as any).type,
          text: el.textContent,
          role: el.getAttribute('role'),
          ariaLabel: el.getAttribute('aria-label'),
          label: el.labels && el.labels.length > 0 ? el.labels[0].textContent : null
        };
      });
    });

    // Fuzzy match: id, name, placeholder, label, aria-label, text
    for (const c of candidates) {
      if (
        (c.id && c.id.includes(base)) ||
        (c.name && c.name.includes(base)) ||
        (c.placeholder && c.placeholder.toLowerCase().includes(base.toLowerCase())) ||
        (c.label && c.label.toLowerCase().includes(base.toLowerCase())) ||
        (c.ariaLabel && c.ariaLabel.toLowerCase().includes(base.toLowerCase())) ||
        (c.text && c.text.toLowerCase().includes(base.toLowerCase()))
      ) {
        // Prefer id, then name, then placeholder, then label, then aria-label, then text
        if (c.id) return `#${c.id}`;
        if (c.name) return `[name="${c.name}"]`;
        if (c.placeholder) return `input[placeholder="${c.placeholder}"]`;
        if (c.label) return `label:has-text("${c.label}")`;
        if (c.ariaLabel) return `[aria-label="${c.ariaLabel}"]`;
        if (c.text) return `${c.tag}:has-text("${c.text}")`;
      }
    }
    // No fuzzy match found
    this.log.push('Fuzzy healing failed for: ' + selector);
    return null;
  }

  getLogs() {
    return this.log;
  }
}
