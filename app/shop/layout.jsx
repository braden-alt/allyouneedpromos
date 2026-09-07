import Link from 'next/link';

const GOVERNED_DIRECTIONS = [
  {
    id: 'SWAGR-CAT-001',
    label: 'Tees / apparel',
    note: 'Decorated short-sleeve tee concept',
  },
  {
    id: 'SWAGR-CAT-003',
    label: 'Caps / headwear',
    note: 'Structured cap / headwear concept',
  },
  {
    id: 'SWAGR-CAT-004',
    label: 'Drinkware',
    note: 'Insulated drinkware concept',
  },
  {
    id: 'SWAGR-CAT-005',
    label: 'Totes / carry',
    note: 'Canvas tote / carry concept',
  },
];

export default function ShopLayout({ children }) {
  return (
    <>
      {children}

      <aside className="fixed bottom-4 right-4 z-[60] w-[min(92vw,380px)]">
        <details className="overflow-hidden rounded-2xl border border-[#6C47FF]/50 bg-[#140F1E]/95 text-white shadow-2xl backdrop-blur-xl">
          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-black tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-[#F5C842]">
            <span className="flex items-center justify-between gap-3">
              <span>
                Continue in <span className="text-[#F5C842]">SWAGR AI</span>
              </span>
              <span className="rounded-full border border-[#34D399]/40 bg-[#34D399]/10 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-[#34D399]">
                Governed
              </span>
            </span>
          </summary>

          <div className="border-t border-[#352A46] px-4 pb-4 pt-3">
            <p className="text-xs leading-5 text-zinc-400">
              Move from the storefront preview into a governed product direction. These links open synthetic planning concepts only—no live SKU, price, inventory, MOQ, supplier approval, or production authority is implied.
            </p>

            <div className="mt-3 grid grid-cols-2 gap-2">
              {GOVERNED_DIRECTIONS.map((direction) => (
                <Link
                  key={direction.id}
                  href={`/swagr/virtual?concept=${encodeURIComponent(direction.id)}&source=storefront`}
                  className="rounded-xl border border-[#352A46] bg-[#1B1530] p-3 transition hover:-translate-y-0.5 hover:border-[#6C47FF] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C842]"
                >
                  <div className="text-xs font-bold text-white">{direction.label}</div>
                  <div className="mt-1 text-[10px] leading-4 text-zinc-500">{direction.note}</div>
                  <div className="mt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-[#B6A6FF]">Open controlled virtual →</div>
                </Link>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href="/swagr/library"
                className="rounded-lg border border-[#6C47FF]/60 px-3 py-2 text-[11px] font-bold text-[#B6A6FF] hover:bg-[#6C47FF]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C842]"
              >
                Browse all governed directions
              </Link>
              <Link
                href="/swagr"
                className="rounded-lg border border-[#352A46] px-3 py-2 text-[11px] font-semibold text-zinc-300 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C842]"
              >
                Open SWAGR AI workspace
              </Link>
            </div>
          </div>
        </details>
      </aside>
    </>
  );
}
