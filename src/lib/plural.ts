/**
 * Русские числительные: 1 ролик, 2 ролика, 5 роликов.
 * Порядок форм — как в Intl.PluralRules: one, few, many.
 */
export function plural(n: number, one: string, few: string, many: string): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return many;
  const mod10 = n % 10;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}
