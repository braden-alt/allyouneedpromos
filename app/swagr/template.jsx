'use client';

import JourneyHub from './journey-hub';

export default function SwagrTemplate({ children }) {
  return (
    <>
      <JourneyHub />
      <div id="swagr-main-experience">{children}</div>
    </>
  );
}
