"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface GalleryPhoto {
  id: number;
  url: string;
  title: string | null;
  description: string | null;
}

interface PhotoGalleryViewerProps {
  photos: GalleryPhoto[];
}

export default function PhotoGalleryViewer({ photos }: PhotoGalleryViewerProps) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const openPhotoViewer = (index: number) => {
    setSelectedPhotoIndex(index);
    // Отключаем скролл для body когда открыт просмотрщик
    if (typeof document !== "undefined") {
      document.body.style.overflow = "hidden";
    }
  };

  const closePhotoViewer = () => {
    setSelectedPhotoIndex(null);
    // Возвращаем скролл для body
    if (typeof document !== "undefined") {
      document.body.style.overflow = "";
    }
  };

  const goToNextPhoto = () => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex((selectedPhotoIndex + 1) % photos.length);
  };

  const goToPrevPhoto = () => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex((selectedPhotoIndex - 1 + photos.length) % photos.length);
  };

  // Обработка клавиш клавиатуры
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      closePhotoViewer();
    } else if (e.key === "ArrowRight") {
      goToNextPhoto();
    } else if (e.key === "ArrowLeft") {
      goToPrevPhoto();
    }
  };

  return (
    <div>
      {/* Сетка с фотографиями */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="relative aspect-video cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow"
            onClick={() => openPhotoViewer(index)}
          >
            <Image
              src={photo.url}
              alt={photo.title || "Фото галереи"}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
            />
            {(photo.title || photo.description) && (
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2 text-white">
                {photo.title && <h3 className="text-sm font-medium">{photo.title}</h3>}
                {photo.description && (
                  <p className="text-xs line-clamp-1">{photo.description}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Полноэкранный просмотрщик фотографий */}
      {selectedPhotoIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col justify-center items-center"
          onClick={closePhotoViewer}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            onClick={closePhotoViewer}
          >
            <X className="h-8 w-8" />
          </button>

          <div className="relative w-full h-full max-w-6xl max-h-[90vh] flex justify-center items-center" onClick={(e) => e.stopPropagation()}>
            {/* Кнопка "Предыдущее фото" */}
            <button
              className="absolute left-2 md:left-4 z-10 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-75"
              onClick={(e) => {
                e.stopPropagation();
                goToPrevPhoto();
              }}
            >
              <ChevronLeft className="h-8 w-8" />
            </button>

            {/* Фотография */}
            <div className="relative w-full h-full flex justify-center items-center p-4">
              <div className="relative w-full h-full">
                <Image
                  src={photos[selectedPhotoIndex].url}
                  alt={photos[selectedPhotoIndex].title || "Фото галереи"}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            {/* Кнопка "Следующее фото" */}
            <button
              className="absolute right-2 md:right-4 z-10 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-75"
              onClick={(e) => {
                e.stopPropagation();
                goToNextPhoto();
              }}
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          </div>

          {/* Информация о фотографии */}
          {(photos[selectedPhotoIndex].title || photos[selectedPhotoIndex].description) && (
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 p-4 text-white">
              {photos[selectedPhotoIndex].title && (
                <h3 className="text-lg font-medium mb-1">{photos[selectedPhotoIndex].title}</h3>
              )}
              {photos[selectedPhotoIndex].description && (
                <p className="text-sm">{photos[selectedPhotoIndex].description}</p>
              )}
            </div>
          )}

          {/* Индикатор страниц */}
          <div className="absolute bottom-16 left-0 right-0 flex justify-center">
            <div className="flex space-x-1">
              {photos.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === selectedPhotoIndex ? "bg-white" : "bg-gray-500"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPhotoIndex(index);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
