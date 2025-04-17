import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";

async function getFeaturedGalleries() {
  try {
    const galleries = await prisma.photoGallery.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: {
        photos: {
          take: 1,
          orderBy: { order: "asc" }
        }
      }
    });
    return galleries;
  } catch (error) {
    console.error("Error fetching featured galleries:", error);
    return [];
  }
}

export default async function GalleryHomeSection() {
  const galleries = await getFeaturedGalleries();

  if (!galleries.length) {
    return null;
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Наша фотогалерея</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Ознакомьтесь с нашей коллекцией фотографий, показывающих наши услуги и опыт работы
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {galleries.map((gallery) => (
            <Link key={gallery.id} href={`/gallery/${gallery.slug}`}>
              <div className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <div className="relative w-full h-64">
                  {gallery.photos[0] ? (
                    <Image
                      src={gallery.photos[0].url}
                      alt={gallery.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">Нет фото</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-bold mb-2">{gallery.title}</h3>
                  {gallery.description && (
                    <p className="text-gray-600 line-clamp-2">{gallery.description}</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Button asChild>
            <Link href="/gallery">Смотреть все галереи</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
