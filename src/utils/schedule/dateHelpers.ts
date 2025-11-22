// src/utils/schedule/dateHelpers.ts
export function formatDate(raw: string | null | undefined) {
  if (!raw) {
    return { day: '--', time: '--' };
  }

  const d = new Date(raw);
  if (String(d) === 'Invalid Date') {
    return { day: '--', time: '--' };
  }

  const day = d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  });

  const time = d.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit'
  });

  return { day, time };
}

export function derivePrimetime(iso: string | null): {
  isPrimetime: boolean;
  primetimeType: 'TNF' | 'SNF' | 'MNF' | null;
} {
  if (!iso) {
    return { isPrimetime: false, primetimeType: null };
  }

  const d = new Date(iso);
  if (String(d) === 'Invalid Date') {
    return { isPrimetime: false, primetimeType: null };
  }

  const day = d.getDay();
  const hour = d.getHours();

  if (day === 4 && hour >= 19) return { isPrimetime: true, primetimeType: 'TNF' };
  if (day === 0 && hour >= 19) return { isPrimetime: true, primetimeType: 'SNF' };
  if (day === 1 && hour >= 19) return { isPrimetime: true, primetimeType: 'MNF' };

  return { isPrimetime: false, primetimeType: null };
}
