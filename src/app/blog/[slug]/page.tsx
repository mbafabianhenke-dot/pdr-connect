import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getPost, getAllSlugs, BLOG_POSTS } from '@/lib/blog';
import { ArrowLeft, Clock, Calendar, ArrowRight } from 'lucide-react';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://pdrconnect.eu';

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = getPost(params.slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      url: `${APP_URL}/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.date,
      images: [{ url: `${APP_URL}/og-image.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [`${APP_URL}/og-image.png`],
    },
    alternates: { canonical: `${APP_URL}/blog/${post.slug}` },
  };
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);
  if (!post) notFound();

  const related = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-brand-900 to-brand-800 text-white py-16 px-6">
        <div className="mx-auto max-w-3xl">
          <Link href="/blog" className="inline-flex items-center gap-2 text-brand-300 hover:text-white text-sm font-medium mb-6 transition">
            <ArrowLeft className="h-4 w-4" /> Back to Blog
          </Link>
          <div className="flex items-center gap-4 text-xs text-brand-300 mb-4">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.readTime} min read
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black leading-tight mb-4">{post.title}</h1>
          <p className="text-brand-200 text-lg">{post.description}</p>
        </div>
      </div>

      {/* Article */}
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div
          className="prose prose-lg prose-gray max-w-none
            prose-headings:font-bold prose-headings:text-gray-900
            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-gray-600 prose-p:leading-relaxed
            prose-a:text-brand-600 prose-a:font-medium hover:prose-a:text-brand-800
            prose-ul:text-gray-600 prose-li:my-1
            prose-strong:text-gray-800
            prose-table:text-sm"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* CTA */}
        <div className="mt-12 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-800 p-8 text-white text-center">
          <h2 className="text-xl font-bold mb-2">Join PDR Connect — Free</h2>
          <p className="text-brand-200 text-sm mb-5">1,000+ PDR professionals · 48+ countries · €0 to join</p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-lg bg-white text-brand-700 font-bold px-6 py-2.5 hover:bg-brand-50 transition text-sm"
          >
            Create Free Account <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-14">
            <h2 className="text-xl font-bold text-gray-900 mb-6">More Articles</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/blog/${r.slug}`}
                  className="group border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-brand-200 transition"
                >
                  <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {r.readTime} min read
                  </p>
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-brand-700 transition leading-snug mb-2">
                    {r.title}
                  </h3>
                  <span className="text-xs font-semibold text-brand-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
