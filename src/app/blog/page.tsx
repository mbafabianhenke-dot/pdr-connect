import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { BLOG_POSTS } from '@/lib/blog';
import { ArrowRight, Clock, Calendar } from 'lucide-react';

export const metadata: Metadata = {
  title: 'PDR Connect Blog — Tips, Guides & Industry News',
  description:
    'Expert articles on paintless dent repair, PDR technician careers, finding PDR professionals in Europe, and the latest industry trends.',
  openGraph: {
    title: 'PDR Connect Blog',
    description: 'Expert guides on PDR, technician careers, and the European auto body market.',
    url: '/blog',
    images: [{ url: 'https://pdrconnect.eu/og-image.png', width: 1200, height: 630 }],
  },
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-brand-900 to-brand-800 text-white py-20 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-brand-300 hover:text-white text-sm font-medium mb-6 transition">
            ← Back to PDR Connect
          </Link>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            PDR Connect Blog
          </h1>
          <p className="text-lg text-brand-200 max-w-2xl mx-auto">
            Expert guides on paintless dent repair, technician careers, and the European PDR industry.
          </p>
        </div>
      </div>

      {/* Articles */}
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="space-y-10">
          {BLOG_POSTS.map((post) => (
            <article key={post.slug} className="group border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200">
              <Link href={`/blog/${post.slug}`}>
                <div className="flex flex-col md:flex-row">
                  {/* Thumbnail */}
                  <div className="md:w-64 md:flex-shrink-0 bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center p-8 min-h-[160px]">
                    <Image
                      src="/logo.png"
                      alt="PDR Connect"
                      width={80}
                      height={80}
                      unoptimized
                      className="opacity-80"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6 md:p-8">
                    <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {post.readTime} min read
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-brand-700 transition mb-3 leading-snug">
                      {post.title}
                    </h2>
                    <p className="text-sm text-gray-500 leading-relaxed mb-4">
                      {post.description}
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 group-hover:gap-2.5 transition-all">
                      Read article <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-800 p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Ready to join PDR Connect?</h2>
          <p className="text-brand-200 mb-6">Connect with 1,000+ PDR professionals across 48+ countries. Free to join.</p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-lg bg-white text-brand-700 font-bold px-6 py-3 hover:bg-brand-50 transition"
          >
            Create Free Account <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
