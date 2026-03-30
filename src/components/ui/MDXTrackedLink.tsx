'use client';

import { track } from '@vercel/analytics';
import type { AnchorHTMLAttributes, MouseEvent } from 'react';

const PRODUCT_PATTERNS: { pattern: RegExp; product: string }[] = [
  { pattern: /pulseup/, product: 'pulseup' },
  { pattern: /booksalon/, product: 'booksalon' },
  { pattern: /display-?lab/, product: 'display-lab' },
  { pattern: /nbbang/, product: 'nbbang' },
  { pattern: /thisor/, product: 'thisor' },
  { pattern: /iscv/, product: 'iscv' },
];

function detectProduct(href: string): string | null {
  for (const { pattern, product } of PRODUCT_PATTERNS) {
    if (pattern.test(href)) return product;
  }
  return null;
}

interface MDXTrackedLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href?: string;
}

export default function MDXTrackedLink({
  href,
  children,
  onClick,
  ...props
}: MDXTrackedLinkProps) {
  if (!href) {
    return <a {...props}>{children}</a>;
  }

  const product = detectProduct(href);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);

    if (!event.defaultPrevented && product) {
      track('blog_to_product_click', { href, product });
    }
  };

  return (
    <a href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
