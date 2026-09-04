'use client';

import JourneyHub from './journey-hub';
import JourneyCapabilityLaunchpad from './journey-capability-launchpad';
import JourneyVirtualLaunchpad from './journey-virtual-launchpad';
import JourneyPromoFacts from './journey-promo-facts';

export default function SwagrTemplate({ children }) {
  return (
    <>
      <JourneyHub />
      <JourneyCapabilityLaunchpad />
      <JourneyPromoFacts />
      <JourneyVirtualLaunchpad />
      <div id="swagr-main-experience">{children}</div>
    </>
  );
}
