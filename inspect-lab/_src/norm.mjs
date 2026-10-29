// Normalizzazione delle risposte: usata sia in build (per gli hash) sia nel coach.
export function norm(s, mode) {
  s = String(s == null ? '' : s).normalize('NFKC').trim();
  s = s.replace(/^[\s"'`«»“”‘’<]+|[\s"'`«»“”‘’>;.,]+$/g, '');
  if (mode === 'num') return s.replace(/[.,]00$/, '').replace(/[^0-9]/g, '');
  if (mode === 'url') {
    s = s.split(/[?#]/)[0];
    var parts = s.split('/').filter(Boolean);
    s = parts.length ? parts[parts.length - 1] : s;
  }
  s = s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ');
  if (mode === 'code') s = s.replace(/\s+/g, '');
  return s;
}
