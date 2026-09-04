'use client';

import JourneyHub from './journey-hub';
import JourneyCapabilityLaunchpad from './journey-capability-launchpad';

export default function SwagrTemplate({ children }) {
  return (
    <>
      <JourneyHub />
      <JourneyCapabilityLaunchpad />
      <div id="swagr-main-experience">{children}</div>
    </>
  );
}
