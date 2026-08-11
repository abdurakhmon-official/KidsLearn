const TRANSLIT: Record<string, string> = {
  ʻ: '',
  ʼ: '',
  '‘': '',
  '’': '',
  "'": '',
  '`': '',
  ö: 'o',
  ğ: 'g',
  ş: 's',
  ç: 'c',
  ı: 'i',
};

export const slugify = (value: string): string => {
  return value
    .toLowerCase()
    .replace(/[ʻʼ‘’'`öğşçı]/g, char => TRANSLIT[char] ?? char)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
