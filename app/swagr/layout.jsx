'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export const SWAGR_ACTIVE_BRIEF_KEY = 'swagr.activeBrief.v1';

const FIELD_LABELS = {
  audience: 'Who is it for?',
  useCase: 'What is happening?',
  quantity: 'Quantity planning band',
  budget: 'Budget planning band',
  inHandsDate: 'Needed by',
  location: 'Delivery area',
  style: 'Style / feel',
  exclusions: 'Avoid',
};

function valueForLabel(labelPrefix) {
  const labels = Array.from(document.querySelectorAll('label'));
  const label = labels.find((item) => item.textContent?.trim().startsWith(labelPrefix));
  const field = label?.querySelector('input, select, textarea');
  return field?.value ?? '';
}

function captureActiveBrief() {
  try {
    const brief = Object.fromEntries(
      Object.entries(FIELD_LABELS).map(([key, label]) => [key, valueForLabel(label)])
    );

    const hasPlanningSignal = Boolean(
      brief.audience || brief.useCase || brief.quantity || brief.budget || brief.style || brief.exclusions
    );
    if (!hasPlanningSignal) return;

    sessionStorage.setItem(SWAGR_ACTIVE_BRIEF_KEY, JSON.stringify({
      ...brief,
      source: 'SWAGR_CUSTOMER_EXPERIENCE',
      capturedAt: new Date().toISOString(),
      persistence: 'SESSION_LOCAL_ONLY',
    }));
  } catch {
    // Session storage can be unavailable in restricted browser contexts.
    // The SWAGR experience must continue safely without persistence.
  }
}

export default function SwagrLayout({ children }) {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== '/swagr') return undefined;

    const captureAfterUiUpdate = () => window.setTimeout(captureActiveBrief, 0);
    const captureBeforeNavigation = (event) => {
      const anchor = event.target?.closest?.('a[href]');
      if (anchor?.getAttribute('href')?.startsWith('/swagr/library')) captureActiveBrief();
    };

    captureAfterUiUpdate();
    document.addEventListener('input', captureAfterUiUpdate, true);
    document.addEventListener('change', captureAfterUiUpdate, true);
    document.addEventListener('click', captureBeforeNavigation, true);

    return () => {
      document.removeEventListener('input', captureAfterUiUpdate, true);
      document.removeEventListener('change', captureAfterUiUpdate, true);
      document.removeEventListener('click', captureBeforeNavigation, true);
    };
  }, [pathname]);

  return children;
}
