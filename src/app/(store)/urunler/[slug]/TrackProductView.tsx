'use client';

import { useEffect } from 'react';

interface TrackProductViewProps {
  productId: string;
}

export default function TrackProductView({ productId }: TrackProductViewProps) {
  useEffect(() => {
    fetch(`/api/products/${productId}`, {
      method: 'POST',
    }).catch(() => undefined);
  }, [productId]);

  return null;
}
