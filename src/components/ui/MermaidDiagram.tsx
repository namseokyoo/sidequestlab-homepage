'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface MermaidDiagramProps {
  chart: string;
  className?: string;
}

export default function MermaidDiagram({ chart, className = '' }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const idRef = useRef(`mermaid-${Math.random().toString(36).substring(2, 9)}`);

  const renderChart = useCallback(async () => {
    try {
      const mermaid = (await import('mermaid')).default;
      const isDark = document.documentElement.classList.contains('dark');

      mermaid.initialize({
        startOnLoad: false,
        theme: isDark ? 'dark' : 'default',
        securityLevel: 'loose',
        fontFamily: 'var(--font-geist-sans), sans-serif',
      });

      // mermaid.render requires a unique ID each time
      const uniqueId = `${idRef.current}-${Date.now()}`;
      const { svg: renderedSvg } = await mermaid.render(uniqueId, chart);
      setSvg(renderedSvg);
    } catch (error) {
      console.error('Mermaid rendering error:', error);
    }
  }, [chart]);

  useEffect(() => {
    renderChart();

    // Watch for dark mode changes via MutationObserver on html element
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'class'
        ) {
          renderChart();
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, [renderChart]);

  return (
    <div
      ref={containerRef}
      className={`overflow-x-auto ${className}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
