export default function WaveBackground() {
  const wave =
    'M0 120 C 120 60, 240 60, 360 120 S 600 180, 720 120 S 960 60, 1080 120 S 1320 180, 1440 120';
  return (
    <div className="wave-bg" aria-hidden="true">
      <div className="wave-track">
        {[0, 1].map((i) => (
          <svg key={i} viewBox="0 0 1440 240" preserveAspectRatio="none" fill="none">
            <path d={wave} stroke="rgba(245,158,11,0.32)" strokeWidth="1.5" />
          </svg>
        ))}
      </div>
      <div className="wave-track slow">
        {[0, 1].map((i) => (
          <svg key={i} viewBox="0 0 1440 240" preserveAspectRatio="none" fill="none">
            <path d={wave} stroke="rgba(96,140,220,0.26)" strokeWidth="1.5" />
          </svg>
        ))}
      </div>
    </div>
  );
}
