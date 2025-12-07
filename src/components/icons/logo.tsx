import Image from 'next/image';

export function Logo({
  variant = 'full',
  width,
  height,
  className,
}: {
  variant?: 'full' | 'minimal';
  width?: number;
  height?: number;
  className?: string;
}) {
  const isFull = variant === 'full';
  const src = isFull ? "https://i.postimg.cc/0QvQ30bW/full-logo.png" : "https://i.postimg.cc/QtDtPJHn/min-logo.png";
  const alt = isFull ? 'Eclip.pro Full Logo' : 'Eclip.pro Minimal Logo';
  const defaultWidth = isFull ? 160 : 40;
  const defaultHeight = 40;

  return (
    <Image
      src={src}
      alt={alt}
      width={width || defaultWidth}
      height={height || defaultHeight}
      className={className}
      priority
    />
  );
}
