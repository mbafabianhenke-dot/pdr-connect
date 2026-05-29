import Link from 'next/link';
import Image from 'next/image';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 flex flex-col justify-center py-12 px-4">
      <div className="flex justify-center mb-8">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="Cybratech Solutions" width={72} height={72} unoptimized className="flex-shrink-0" />
          <div className="leading-tight">
            <span className="block text-2xl font-bold text-white tracking-tight">PDR Connect</span>
            <span className="block text-[11px] font-medium text-brand-200 tracking-widest uppercase">by Cybratech Solutions</span>
          </div>
        </Link>
      </div>
      {children}
    </div>
  );
}
