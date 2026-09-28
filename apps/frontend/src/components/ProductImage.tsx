import { useState } from 'react';

type ProductImageProps = {
  src?: string | null;
  alt: string;
  imageClassName: string;
  placeholderClassName: string;
  loading?: 'lazy' | 'eager';
};

export function ProductImage({
  src,
  alt,
  imageClassName,
  placeholderClassName,
  loading,
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <div className={placeholderClassName}>Без фото</div>;
  }

  return (
    <img
      className={imageClassName}
      src={src}
      alt={alt}
      loading={loading}
      onError={() => setFailed(true)}
    />
  );
}