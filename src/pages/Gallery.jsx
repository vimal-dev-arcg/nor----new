import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { COMPANY_GALLERY_IMAGES } from "../data/galleryData";
import { Helmet } from "react-helmet-async";

export default function Gallery() {
  const [lightboxImg, setLightboxImg] = useState(null);
  const [lightboxIdx, setLightboxIdx] = useState(0);

  const openLightbox = (img, idx) => {
    setLightboxImg(img);
    setLightboxIdx(idx);
  };

  const nextLightbox = (e) => {
    e?.stopPropagation();
    const nextIdx = (lightboxIdx + 1) % COMPANY_GALLERY_IMAGES.length;
    setLightboxIdx(nextIdx);
    setLightboxImg(COMPANY_GALLERY_IMAGES[nextIdx]);
  };

  const prevLightbox = (e) => {
    e?.stopPropagation();
    const prevIdx =
      (lightboxIdx - 1 + COMPANY_GALLERY_IMAGES.length) %
      COMPANY_GALLERY_IMAGES.length;
    setLightboxIdx(prevIdx);
    setLightboxImg(COMPANY_GALLERY_IMAGES[prevIdx]);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxImg) return;
      if (e.key === "Escape") setLightboxImg(null);
      if (e.key === "ArrowRight") nextLightbox();
      if (e.key === "ArrowLeft") prevLightbox();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxImg, lightboxIdx]);

  return (
    <>
      <Helmet>
        <title>Gallery | NCR Properties</title>
        <meta
          name="description"
          content="NCR Properties company gatherings, corporate moments, and team celebrations."
        />
      </Helmet>

      <Header />

      <main className="pt-28 md:pt-32 bg-slate-50 min-h-screen">
        {/* Simple Header */}
        <section className="bg-white border-b border-slate-100 py-10 md:py-14">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="text-xs uppercase font-bold tracking-[0.25em] text-[#b3975b] block mb-2">
              NCR Moments
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Company Gallery
            </h1>
            <p className="text-slate-600 mt-2 text-sm max-w-xl">
              Moments from our company gatherings, team celebrations, and partner summits.
            </p>
          </div>
        </section>

        {/* Clean Grid: only image and small description */}
        <section className="py-12 md:py-16">
          <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
              {COMPANY_GALLERY_IMAGES.map((img, idx) => (
                <div
                  key={img.id}
                  onClick={() => openLightbox(img, idx)}
                  className="cursor-pointer group flex flex-col"
                >
                  {/* Clean Image */}
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-200 shadow-sm group-hover:shadow-lg transition-all duration-300">
                    <img
                      src={img.src}
                      alt={img.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>

                  {/* Small Description only */}
                  <div className="mt-2.5 px-0.5">
                    <h3 className="font-semibold text-xs text-slate-900 line-clamp-1 group-hover:text-[#b3975b] transition-colors">
                      {img.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                      {img.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Lightbox */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
          onClick={() => setLightboxImg(null)}
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxImg(null)}
            className="absolute top-5 right-5 z-20 w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 text-white text-lg flex items-center justify-center transition cursor-pointer"
            title="Close (Esc)"
          >
            ✕
          </button>

          {/* Prev Arrow */}
          <button
            onClick={prevLightbox}
            className="absolute left-4 sm:left-8 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white text-2xl flex items-center justify-center transition cursor-pointer"
            title="Previous (Left Arrow)"
          >
            ‹
          </button>

          {/* Next Arrow */}
          <button
            onClick={nextLightbox}
            className="absolute right-4 sm:right-8 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white text-2xl flex items-center justify-center transition cursor-pointer"
            title="Next (Right Arrow)"
          >
            ›
          </button>

          {/* Image & Small Caption */}
          <div
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImg.src}
              alt={lightboxImg.title}
              className="max-h-[75vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
            />

            <div className="w-full mt-3 bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 text-white flex items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-white">
                  {lightboxImg.title}
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  {lightboxImg.description}
                </p>
              </div>

              <span className="text-xs text-slate-400 font-mono shrink-0">
                {lightboxIdx + 1} / {COMPANY_GALLERY_IMAGES.length}
              </span>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
