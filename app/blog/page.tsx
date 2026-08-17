import Footer from "components/layout/footer";
import { Reveal } from "components/ui/reveal";
import { PaperTexture } from "components/ui/paper-texture";
import { PAPER_BACKGROUNDS, PAPER_OVERLAYS } from "lib/backgrounds";
import { getPublishedBlogPosts } from "lib/supabase/blog";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Блог | PaperOK",
  description: "Статии за семенна хартия, еко подаръци и устойчиви идеи.",
};

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts();

  return (
    <>
      <div className="relative overflow-hidden bg-paper-bg">
        <PaperTexture
          src={PAPER_BACKGROUNDS.fibers}
          overlay={PAPER_OVERLAYS.cream}
          sizes="100vw"
          quality={85}
        />
        <div className="relative z-10 mx-auto max-w-6xl px-4 py-12">
          <Reveal>
            <h1 className="font-heading mb-2 text-4xl font-bold text-paper-heading">
              Блог
            </h1>
            <p className="mb-10 text-paper-text">
              Идеи, съвети и вдъхновение от света на семенната хартия
            </p>
          </Reveal>

          {posts.length === 0 ? (
            <p className="text-paper-muted">Все още няма публикувани статии.</p>
          ) : (
            <div className="grid auto-rows-fr grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, index) => (
                <Reveal
                  key={post.id}
                  delay={index * 80}
                  variant="up"
                  className="h-full"
                >
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group hover-lift flex h-full flex-col overflow-hidden rounded-lg border border-paper-border bg-paper-white/90"
                  >
                    <div className="aspect-[16/10] w-full shrink-0 overflow-hidden bg-paper-section">
                      {post.featuredImage?.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={post.featuredImage.url}
                          alt={post.title}
                          className="img-zoom h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <span className="font-heading text-sm text-paper-muted">
                            PaperOK
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <time className="text-xs text-paper-muted">
                        {new Date(post.createdAt).toLocaleDateString("bg-BG")}
                      </time>
                      <h2 className="font-heading mt-1 line-clamp-2 min-h-[3.5rem] text-lg font-semibold leading-snug text-paper-heading transition-colors group-hover:text-paper-green">
                        {post.title}
                      </h2>
                      <p className="mt-2 line-clamp-3 min-h-[3.75rem] text-sm leading-5 text-paper-text">
                        {post.excerpt || "\u00a0"}
                      </p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
