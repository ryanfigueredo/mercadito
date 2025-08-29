import * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement> & { size?: number };

const createIcon = (path: React.ReactNode, viewBox: string = "0 0 24 24") =>
  function Icon({ size = 20, className, ...props }: IconProps) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-hidden="true"
        width={size}
        height={size}
        viewBox={viewBox}
        className={className}
        fill="currentColor"
        {...props}
      >
        {path}
      </svg>
    );
  };

export const MailIcon = createIcon(
  <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4-8 5-8-5V6l8 5 8-5Z" />
);

export const LockIcon = createIcon(
  <path d="M17 9h-1V7a4 4 0 1 0-8 0v2H7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2Zm-6 6.73V17a1 1 0 1 0 2 0v-1.27a2 2 0 1 0-2 0ZM9 7a3 3 0 1 1 6 0v2H9V7Z" />
);

export const EyeIcon = createIcon(
  <path d="M12 5c-4.5 0-8.27 2.61-10 7 1.73 4.39 5.5 7 10 7s8.27-2.61 10-7c-1.73-4.39-5.5-7-10-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
);

export const EyeOffIcon = createIcon(
  <>
    <path d="M2 5.27 3.28 4 20 20.72 18.73 22l-3.13-3.13A12.4 12.4 0 0 1 12 19c-4.5 0-8.27-2.61-10-7a12.88 12.88 0 0 1 4.41-5.5L2 5.27Z" />
    <path d="M9.88 7.76 12 9.88A3 3 0 0 0 9 12a3 3 0 0 0 3 3c.51 0 .98-.13 1.4-.36l1.5 1.5A5 5 0 0 1 7 12a5 5 0 0 1 2.88-4.24Z" />
    <path d="M12 5c4.5 0 8.27 2.61 10 7a12.76 12.76 0 0 1-3.14 4.53l-1.42-1.42A10.75 10.75 0 0 0 21 12c-1.73-4.39-5.5-7-10-7-1.03 0-2.02.13-2.96.38L6.53 3.87A12.5 12.5 0 0 1 12 5Z" />
  </>
);

export const AppleIcon = createIcon(
  <path d="M16.5 13.5c-.5 1.2-.9 2.2-1.7 3.2-.7.9-1.5 1.8-2.6 1.8-1.1 0-1.4-.6-2.7-.6s-1.6.6-2.7.6c-1.1 0-1.9-.9-2.6-1.8-1.8-2.2-3.2-6.2-1.3-8.9 1-1.4 2.6-2.3 4.2-2.3 1.1 0 2.1.6 2.7.6.6 0 1.9-.7 3.2-.6.5 0 2.2.2 3.2 1.7-2.8 1.5-2.3 5.4,0 6.9ZM13 3c-.7.9-1.9 1.6-3.1 1.5-.1-1 .4-2 .9-2.6.7-.8 2-1.4 3-.5.1.1-.3.9-.8 1.6Z" />,
  "0 0 24 24"
);

export const FacebookIcon = createIcon(
  <path d="M13 3h4a1 1 0 0 1 1 1v3h-3a1 1 0 0 0-1 1v3h4l-1 4h-3v7h-4v-7H7v-4h3V8a5 5 0 0 1 5-5Z" />
);

export const GoogleIcon = createIcon(
  <path d="M21.35 11.1H12v2.9h5.32c-.23 1.27-.94 2.35-2 3.06v2.54h3.22c1.88-1.73 2.96-4.28 2.96-7.32 0-.62-.06-1.22-.15-1.78Z" />,
  "0 0 24 24"
);

export const UserIcon = createIcon(
  <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z" />
);

export const IdIcon = createIcon(
  <>
    <rect
      x="3"
      y="5"
      width="18"
      height="14"
      rx="2"
      stroke="currentColor"
      fill="none"
    />
    <circle cx="9" cy="12" r="2" />
    <path d="M13 10h6M13 13h6M13 16h4" stroke="currentColor" fill="none" />
  </>
);

// App specific icons
export const HomeIcon = createIcon(
  <path d="M12 3 2 12h3v8h6v-5h2v5h6v-8h3L12 3Z" />
);

export const GridIcon = createIcon(
  <path d="M3 3h8v8H3V3Zm10 0h8v8h-8V3ZM3 13h8v8H3v-8Zm10 0h8v8h-8v-8Z" />
);

export const BagIcon = createIcon(
  <>
    <path d="M6 7h12l-1.5 12a2 2 0 0 1-2 1.8H9.5A2 2 0 0 1 7.5 19L6 7Z" />
    <path d="M9 10V8a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" />
  </>
);

// New icons for top bar and search
export const MapPinIcon = createIcon(
  <path d="M12 2C8.69 2 6 4.69 6 8c0 5 6 12 6 12s6-7 6-12c0-3.31-2.69-6-6-6Zm0 8.5A2.5 2.5 0 1 1 12 5.5a2.5 2.5 0 0 1 0 5Z" />
);

export const ChevronDownIcon = createIcon(
  <path
    d="M6 9l6 6 6-6"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  />,
  "0 0 24 24"
);

export const BellIcon = createIcon(
  <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Zm-6 13a3 3 0 0 0 3-3H9a3 3 0 0 0 3 3Z" />
);

export const SearchIcon = createIcon(
  <path d="M11 4a7 7 0 1 0 4.9 12l3.7 3.7 1.4-1.4-3.7-3.7A7 7 0 0 0 11 4Zm0 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z" />
);

const icons = {
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  AppleIcon,
  FacebookIcon,
  GoogleIcon,
  UserIcon,
  IdIcon,
  HomeIcon,
  GridIcon,
  BagIcon,
  MapPinIcon,
  ChevronDownIcon,
  BellIcon,
  SearchIcon,
};

export default icons;
