'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { SWAGR_FIXTURES } from '../swagr-lab/fixtures';
import { loadBrandProfile } from './brand-profile';

export const SWAGR_ACTIVE_BRIEF_KEY = 'swagr.activeBrief.v1';
export const SWAGR_PROPOSAL_REVIEW_KEY = 'swagr.proposalReview.v1';

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
    if (!hasPlanningSignal) return null;

    const captured = {
      ...brief,
      source: 'SWAGR_CUSTOMER_EXPERIENCE',
      capturedAt: new Date().toISOString(),
      persistence: 'SESSION_LOCAL_ONLY',
    };
    sessionStorage.setItem(SWAGR_ACTIVE_BRIEF_KEY, JSON.stringify(captured));
    return captured;
  } catch {
    // Session storage can be unavailable in restricted browser contexts.
    // The SWAGR experience must continue safely without persistence.
    return null;
  }
}

function selectedFixtureIdsFromPage() {
  const pressed = Array.from(document.querySelectorAll('button[aria-pressed="true"]'));
  const selectedNames = pressed
    .filter((button) => button.textContent?.includes('In shortlist'))
    .map((button) => button.closest('article')?.querySelector('h3')?.textContent?.trim())
    .filter(Boolean);

  return selectedNames
    .map((name) => SWAGR_FIXTURES.find((fixture) => fixture.name === name)?.id)
    .filter(Boolean);
}

function captureProposalReviewPacket() {
  try {
    const brief = captureActiveBrief() || JSON.parse(sessionStorage.getItem(SWAGR_ACTIVE_BRIEF_KEY) || 'null');
    const selectedIds = selectedFixtureIdsFromPage();
    if (!brief || !selectedIds.length) return false;

    const pageText = document.body?.innerText || '';
    const versionMatch = pageText.match(/Proposal v(\d+)/i);
    const brandProfile = loadBrandProfile();
    const brandName = valueForLabel('Brand label') || brandProfile?.brandName || 'Sample Brand';
    const packet = {
      schemaVersion: 1,
      source: 'SWAGR_CUSTOMER_EXPERIENCE_SHORTLIST',
      sourceState: 'CAPTURED_SHORTLIST',
      persistence: 'SESSION_LOCAL_ONLY',
      requirements: brief,
      brandName,
      brandAsset: brandProfile?.logoDataUrl || '',
      brandProfile: brandProfile ? {
        brandName: brandProfile.brandName,
        tagline: brandProfile.tagline,
        primaryColor: brandProfile.primaryColor,
        secondaryColor: brandProfile.secondaryColor,
        visualDirection: brandProfile.visualDirection,
        audienceNote: brandProfile.audienceNote,
        doNotes: brandProfile.doNotes,
        avoidNotes: brandProfile.avoidNotes,
        persistence: 'SESSION_LOCAL_ONLY',
      } : null,
      selectedIds,
      version: Number(versionMatch?.[1]) || 1,
      status: 'DRAFT_HANDOFF_READY',
      capturedAt: new Date().toISOString(),
    };
    sessionStorage.setItem(SWAGR_PROPOSAL_REVIEW_KEY, JSON.stringify(packet));
    return true;
  } catch {
    return false;
  }
}

export default function SwagrLayout({ children }) {
  const pathname = usePathname();
  const [reviewReady, setReviewReady] = useState(false);

  useEffect(() => {
    if (pathname !== '/swagr') {
      setReviewReady(false);
      return undefined;
    }

    try {
      setReviewReady(Boolean(sessionStorage.getItem(SWAGR_PROPOSAL_REVIEW_KEY)));
    } catch {
      setReviewReady(false);
    }

    const captureBeforeNavigation = (event) => {
      const anchor = event.target?.closest?.('a[href]');
      if (anchor?.getAttribute('href')?.startsWith('/swagr/library')) captureActiveBrief();
    };

    const captureDraftReady = (event) => {
      const button = event.target?.closest?.('button');
      if (!button || button.disabled || !button.textContent?.includes('Mark draft ready')) return;
      if (captureProposalReviewPacket()) setReviewReady(true);
    };

    // Capture synchronously. Delaying this with setTimeout can let a client-side
    // route mount before the latest local planning state reaches sessionStorage.
    captureActiveBrief();
    document.addEventListener('input', captureActiveBrief, true);
    document.addEventListener('change', captureActiveBrief, true);
    document.addEventListener('pointerdown', captureBeforeNavigation, true);
    document.addEventListener('click', captureBeforeNavigation, true);
    document.addEventListener('click', captureDraftReady, true);

    return () => {
      document.removeEventListener('input', captureActiveBrief, true);
      document.removeEventListener('change', captureActiveBrief, true);
      document.removeEventListener('pointerdown', captureBeforeNavigation, true);
      document.removeEventListener('click', captureBeforeNavigation, true);
      document.removeEventListener('click', captureDraftReady, true);
    };
  }, [pathname]);

  return (
    <>
      {children}
      {pathname === '/swagr' && reviewReady && (
        <aside className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-xl rounded-2xl border p-4 shadow-2xl sm:left-auto sm:right-5 sm:w-[390px]" style={{ borderColor: 'rgba(52,211,153,.55)', background: 'rgba(20,15,30,.97)', color: '#F1EAD8' }} aria-live="polite">
          <div className="text-xs font-black" style={{ color: '#34D399' }}>Draft review packet captured locally</div>
          <p className="mt-1 text-[11px] leading-5" style={{ color: '#AAA0B8' }}>Open the dedicated proposal review to keep directions, request changes, replace ideas, and preserve proposal versions. Nothing is sent externally.</p>
          <Link href="/swagr/proposal" className="mt-3 inline-flex rounded-xl px-3.5 py-2.5 text-xs font-black focus:outline-none focus:ring-2" style={{ background: '#34D399', color: '#071710', '--tw-ring-color': '#34D399' }}>Open proposal review →</Link>
        </aside>
      )}
    </>
  );
}
