import { expect, test } from '@playwright/test';

test.describe('linha do tempo em escala', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('./');
  });

  test('mostra nove modelos, de 2007 a 2025, em ordem', async ({ page }) => {
    const years = await page.locator('.era__year').allTextContents();
    expect(years).toEqual(['2007', '2008', '2010', '2012', '2014', '2017', '2020', '2023', '2025']);
  });

  test('o desenho usa as mesmas medidas escritas no texto, na mesma escala', async ({ page }) => {
    const eras = await page.$$eval('.era', (items) =>
      items.map((item) => {
        const device = item.querySelector('.device');
        const style = getComputedStyle(device);
        const box = device.getBoundingClientRect();
        const [height, width] = item
          .querySelector('.era__spec span:last-child')
          .textContent.replace(/\s*mm$/, '')
          .split('×')
          .map((n) => Number(n.trim().replace(',', '.')));
        return {
          name: item.querySelector('.era__name').textContent,
          textHeight: height,
          textWidth: width,
          cssHeight: Number(style.getPropertyValue('--h')),
          cssWidth: Number(style.getPropertyValue('--w')),
          pxPerMm: box.height / height,
          ratio: box.height / box.width,
        };
      }),
    );

    const scale = eras[0].pxPerMm;
    for (const era of eras) {
      expect(era.cssHeight, `${era.name}: altura do desenho ≠ texto`).toBe(era.textHeight);
      expect(era.cssWidth, `${era.name}: largura do desenho ≠ texto`).toBe(era.textWidth);
      expect(era.pxPerMm, `${era.name}: fora da escala comum`).toBeCloseTo(scale, 2);
      expect(era.ratio).toBeCloseTo(era.textHeight / era.textWidth, 1);
    }
  });
});
