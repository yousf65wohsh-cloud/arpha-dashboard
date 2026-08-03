// مجموعة أيقونات خطّية موحّدة، SVG مباشر بلا أي حزمة خارجية.
// السبب: لم يُتحقق من وجود lucide-react في المشروع، وأيقونة مفقودة تكسر البناء.
// كلها 24×24، سماكة 1.75، وترث اللون من النص المحيط.

type P = { size?: number; className?: string };

const base = (size = 20) => ({
  width: size, height: size, viewBox: '0 0 24 24',
  fill: 'none', stroke: 'currentColor',
  strokeWidth: 1.75, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
});

export const IconHome = ({ size, className }: P) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M9.5 21v-6h5v6" />
  </svg>
);

export const IconQuestion = ({ size, className }: P) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.5 8.5 0 0 1-3.9-.9L3 21l1.9-5a8.4 8.4 0 0 1-.9-3.9 8.4 8.4 0 0 1 8.4-9 8.4 8.4 0 0 1 8.6 8.4z" />
    <path d="M9.8 9.3a2.2 2.2 0 0 1 4.3.7c0 1.5-2.2 2.2-2.2 2.2" /><path d="M12 15.6h.01" />
  </svg>
);

export const IconBox = ({ size, className }: P) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <path d="M21 8.5v7a2 2 0 0 1-1 1.7l-7 3.9a2 2 0 0 1-2 0l-7-3.9a2 2 0 0 1-1-1.7v-7a2 2 0 0 1 1-1.7l7-3.9a2 2 0 0 1 2 0l7 3.9a2 2 0 0 1 1 1.7z" />
    <path d="m3.3 7.5 8.7 4.8 8.7-4.8" /><path d="M12 21.3v-9" />
  </svg>
);

export const IconBook = ({ size, className }: P) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z" />
    <path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20" /><path d="M8 7h8" />
  </svg>
);

export const IconRules = ({ size, className }: P) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <path d="M9 5h11" /><path d="M9 12h11" /><path d="M9 19h11" />
    <path d="m3.5 5 1.2 1.2L7 4" /><path d="m3.5 12 1.2 1.2L7 11" /><path d="m3.5 19 1.2 1.2L7 18" />
  </svg>
);

export const IconCart = ({ size, className }: P) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" />
    <path d="M2 3h2.2l2.4 12.1a1.8 1.8 0 0 0 1.8 1.4h8.8a1.8 1.8 0 0 0 1.8-1.4L21 7H5" />
  </svg>
);

export const IconChart = ({ size, className }: P) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <path d="M3 3v16.5A1.5 1.5 0 0 0 4.5 21H21" />
    <path d="M7.5 15.5V12" /><path d="M12 15.5V7.5" /><path d="M16.5 15.5v-5" />
  </svg>
);

export const IconUser = ({ size, className }: P) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <circle cx="12" cy="8" r="4" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
  </svg>
);

export const IconTrendUp = ({ size, className }: P) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <path d="m3 16 5.5-5.5 3.5 3.5L21 5" /><path d="M15.5 5H21v5.5" />
  </svg>
);

export const IconCoins = ({ size, className }: P) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <ellipse cx="12" cy="6" rx="7.5" ry="3.2" />
    <path d="M4.5 6v5.5c0 1.8 3.4 3.2 7.5 3.2s7.5-1.4 7.5-3.2V6" />
    <path d="M4.5 11.5V17c0 1.8 3.4 3.2 7.5 3.2s7.5-1.4 7.5-3.2v-5.5" />
  </svg>
);

export const IconCheck = ({ size, className }: P) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="9.2" /><path d="m8 12.3 2.7 2.7L16 9.5" />
  </svg>
);

export const IconClock = ({ size, className }: P) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="9.2" /><path d="M12 6.8V12l3.4 2" />
  </svg>
);

export const IconPlus = ({ size, className }: P) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <path d="M12 5v14" /><path d="M5 12h14" />
  </svg>
);

export const IconEdit = ({ size, className }: P) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z" />
  </svg>
);

export const IconEye = ({ size, className }: P) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" />
    <circle cx="12" cy="12" r="2.7" />
  </svg>
);

export const IconEyeOff = ({ size, className }: P) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <path d="M10.7 6.1A9.9 9.9 0 0 1 12 5.5c6.4 0 10 6.5 10 6.5a17 17 0 0 1-3 3.8" />
    <path d="M6.5 7.8A16.9 16.9 0 0 0 2 12s3.6 6.5 10 6.5a9.7 9.7 0 0 0 3.8-.8" />
    <path d="m3 3 18 18" /><path d="M9.9 10a2.7 2.7 0 0 0 3.8 3.8" />
  </svg>
);

export const IconLogout = ({ size, className }: P) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <path d="M14 20H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8" />
    <path d="m16.5 8.5 3.5 3.5-3.5 3.5" /><path d="M20 12H9.5" />
  </svg>
);

export const IconAlert = ({ size, className }: P) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="9.2" /><path d="M12 7.5V13" /><path d="M12 16.4h.01" />
  </svg>
);

export const IconSparkle = ({ size, className }: P) => (
  <svg {...base(size)} className={className} aria-hidden="true">
    <path d="M12 3.5 13.7 9l5.5 1.7-5.5 1.7L12 18l-1.7-5.6L4.8 10.7 10.3 9z" />
    <path d="M18.5 3v3" /><path d="M20 4.5h-3" />
  </svg>
);
