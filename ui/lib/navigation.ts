/**
 * Sessiya o'zgarganda (rol almashuvi, chiqish) sahifani to'liq qayta yuklaydi.
 *
 * Soft navigatsiyada eski sessiya ekranlari yangi route tayyor bo'lguncha mount holida
 * qoladi va o'z so'rovlarini yangi token bilan qaytadan yuboradi — natijada 403 toast va
 * ekranda xato holati ko'rinadi. To'liq qayta yuklash store va cache'ni ham tozalaydi.
 */
export function reloadTo(path: string) {
  window.location.href = new URL(path, window.location.origin).href;
}
