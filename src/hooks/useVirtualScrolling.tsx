import { useRef, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface UseVirtualScrollingProps {
  items: any[];
  itemHeight?: number;
  containerHeight?: number;
  overscan?: number;
}

export function useVirtualScrolling({
  items,
  itemHeight = 80,
  containerHeight = 400,
  overscan = 5
}: UseVirtualScrollingProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan,
  });

  const virtualItems = virtualizer.getVirtualItems();

  const containerProps = useMemo(() => ({
    ref: parentRef,
    style: {
      height: `${containerHeight}px`,
      overflow: 'auto',
    },
  }), [containerHeight]);

  const scrollElementProps = useMemo(() => ({
    style: {
      height: `${virtualizer.getTotalSize()}px`,
      width: '100%',
      position: 'relative' as const,
    },
  }), [virtualizer]);

  const getItemProps = (virtualItem: any) => ({
    key: virtualItem.key,
    style: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      width: '100%',
      height: `${virtualItem.size}px`,
      transform: `translateY(${virtualItem.start}px)`,
    },
  });

  return {
    parentRef,
    virtualItems,
    containerProps,
    scrollElementProps,
    getItemProps,
    virtualizer,
  };
}
