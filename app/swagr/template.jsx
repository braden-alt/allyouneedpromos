'use client';

import JourneyHub from './journey-hub';
import JourneyCapabilityLaunchpad from './journey-capability-launchpad';
import JourneyVirtualLaunchpad from './journey-virtual-launchpad';

export default function SwagrTemplate({ children }) {
  return (
    <>
      <JourneyHub />
      <JourneyCapabilityLaunchpad />
      <JourneyVirtualLaunchpad />
      <div id="swagr-main-experience">{children}</div>
    </>
  );
}
