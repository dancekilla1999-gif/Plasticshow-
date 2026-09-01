export function Marquee({
  items,
  duration = 40,
  reverse = false,
  className = '',
  separator = '✦',
}: {
  items: string[];
  duration?: number;
  reverse?: boolean;
  className?: string;
  separator?: string;
}) {
  return (
    <div className={`marquee overflow-hidden ${className}`}>
      <div
        className="marquee-track"
        data-reverse={reverse ? 'true' : undefined}
        style={{ ['--marquee-duration' as string]: `${duration}s` }}
      >
        {/* Two identical copies make the -50% loop seamless. */}
        {[0, 1].map((copy) => (
          <div key={copy} aria-hidden={copy === 1} className="flex shrink-0">
            {items.map((item) => (
              <span key={item} className="flex shrink-0 items-center whitespace-nowrap">
                {item}
                <span className="mx-[0.35em] text-scarlet">{separator}</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
