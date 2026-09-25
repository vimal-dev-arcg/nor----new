import { useState } from "react";

export default function PropertyGallery({ images }) {
  const [active, setActive] = useState(0);

  return (
    <div>
      {/* Main Image */}
      <div className="mb-4">
        <img
          src={images[active]}
          className="w-full h-[420px] object-cover rounded-2xl"
        />
      </div>

      {/* Thumbnails */}
      <div className="flex gap-4">
        {images.map((img, index) => (
          <button
            key={index}
            onClick={() => setActive(index)}
            className={`border rounded-xl overflow-hidden transition
              ${active === index ? "border-gold" : "border-transparent"}`}
          >
            <img
              src={img}
              className="w-28 h-20 object-cover hover:opacity-80"
            />
          </button>
        ))}
      </div>
    </div>
  );
}