const LABEL = ['No heat', 'Warm', 'Hot', 'Napalm'];

/** Heat level as three chilli marks; filled ones are lit. */
export function Heat({ level }: { level: number }) {
  return (
    <span className="heat" aria-label={`Heat: ${LABEL[level]}`} title={LABEL[level]}>
      {[1, 2, 3].map(n => (
        <svg key={n} className={n <= level ? 'on' : ''} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 21c7 0 12.5-4.5 14-11.5.2-1 1.5-1.3 2.1-.5.4.5.4 1.2.1 1.8C18.6 17.6 12.6 23 5 23c-1.3 0-1.3-2 0-2z" />
          <path d="M18.5 8.2c-.4-2.2.6-4 2.6-5" fill="none" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ))}
      <small>{LABEL[level]}</small>
    </span>
  );
}
