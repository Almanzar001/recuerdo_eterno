import Image from 'next/image';

export default function RELogo({ size = 60 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center" style={{ width: size, height: size }}>
      <Image 
        src="/logo Recuerdo Eterno4-02.png"
        alt="Recuerdo Eterno Logo"
        width={size}
        height={size}
        className="object-contain"
        priority
      />
    </div>
  );
}