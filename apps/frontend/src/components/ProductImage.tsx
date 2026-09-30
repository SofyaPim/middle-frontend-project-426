import { useState } from 'react';

type ProductImageProps = {
  src?: string | null;
  alt: string;
  imageClassName: string;
  placeholderClassName: string;
  loading?: 'lazy' | 'eager';
  testId?: string;
};

export function ProductImage({
  src,
  alt,
  imageClassName,
  placeholderClassName,
  loading,
  testId,
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <div className={placeholderClassName} data-testid={testId}>Без фото</div>;
  }

  return (
    <img
      className={imageClassName}
      src={src}
      alt={alt}
      loading={loading}
      data-testid={testId}
      onError={() => setFailed(true)}
    />
  );
}