import { expect, test } from '@playwright/test';

test.describe('carrossel de campanhas', () => {
  test('setas e pontos trocam a campanha, e navegar para a rotação', async ({ page }) => {
    await page.goto('./');
    const carousel = page.locator('[data-carousel]');
    const dots = carousel.locator('[data-carousel-dot]');
    const toggle = carousel.locator('[data-carousel-toggle]');
    await carousel.scrollIntoViewIfNeeded();

    await expect(dots.nth(0)).toHaveAttribute('aria-current', 'true');
    await expect(toggle).toHaveAccessibleName('Pausar a rotação');

    await carousel.getByRole('button', { name: 'Próxima campanha' }).click();
    await expect(dots.nth(1)).toHaveAttribute('aria-current', 'true');
    await expect(toggle).toHaveAccessibleName('Retomar a rotação');

    await dots.nth(2).click();
    await expect(dots.nth(2)).toHaveAttribute('aria-current', 'true');

    // Da última, "próxima" volta para a primeira.
    await carousel.getByRole('button', { name: 'Próxima campanha' }).click();
    await expect(dots.nth(0)).toHaveAttribute('aria-current', 'true');

    await carousel.getByRole('button', { name: 'Campanha anterior' }).click();
    await expect(dots.nth(2)).toHaveAttribute('aria-current', 'true');
    await expect(carousel.getByRole('group', { name: '3 de 3' })).toBeInViewport({ ratio: 0.9 });
  });

  test('gira sozinho a cada 7 segundos até alguém pausar', async ({ page }) => {
    await page.clock.install();
    await page.goto('./');
    // Congela o relógio: sem isso ele segue andando no tempo real e, numa
    // máquina lenta, a segunda troca automática acontece antes do clique.
    await page.clock.pauseAt(Date.now() + 1000);
    const carousel = page.locator('[data-carousel]');
    const dots = carousel.locator('[data-carousel-dot]');
    const toggle = carousel.locator('[data-carousel-toggle]');

    await page.clock.fastForward(7100);
    await expect(dots.nth(1)).toHaveAttribute('aria-current', 'true');

    await toggle.click();
    await expect(toggle).toHaveAccessibleName('Retomar a rotação');
    await page.mouse.move(0, 0);
    await page.locator('body').focus();
    await page.clock.fastForward(20000);
    await expect(dots.nth(1)).toHaveAttribute('aria-current', 'true');
  });

  test('não gira sozinho para quem pediu menos movimento', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.clock.install();
    await page.goto('./');
    await page.clock.pauseAt(Date.now() + 1000);
    const carousel = page.locator('[data-carousel]');

    await expect(carousel.locator('[data-carousel-toggle]')).toHaveAccessibleName(
      'Retomar a rotação',
    );
    await page.clock.fastForward(20000);
    await expect(carousel.locator('[data-carousel-dot]').nth(0)).toHaveAttribute(
      'aria-current',
      'true',
    );
  });

  test('as setas do teclado trocam a campanha', async ({ page }) => {
    await page.goto('./');
    const carousel = page.locator('[data-carousel]');
    const track = carousel.getByRole('region', { name: 'Campanhas da linha de 2022' });

    await track.focus();
    await page.keyboard.press('ArrowRight');
    await expect(carousel.locator('[data-carousel-dot]').nth(1)).toHaveAttribute(
      'aria-current',
      'true',
    );
    await page.keyboard.press('ArrowLeft');
    await expect(carousel.locator('[data-carousel-dot]').nth(0)).toHaveAttribute(
      'aria-current',
      'true',
    );
  });
});
