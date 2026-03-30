'use client';

import { track } from '@vercel/analytics';

interface TrackedEmailLinkProps {
  email: string;
  className?: string;
}

export default function TrackedEmailLink({ email, className }: TrackedEmailLinkProps) {
  return (
    <a
      href={`mailto:${email}`}
      onClick={() => track('email_click', { email })}
      className={className}
    >
      {email}
    </a>
  );
}
