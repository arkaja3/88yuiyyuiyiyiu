import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Фотогалерея | Royal Transfer",
  description: "Фотогалерея трансферной компании Royal Transfer",
};

async function getGalleries() {
  try {
    const galleries = await prisma.photoGallery.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      include: {
        photos: {
          take: 1,
          orderBy: { order: "asc" }
        }
      }
    });
    return galleries;
  } catch (error) {
    console.error("Error fetching galleries:", error);
    return [];
  }
}

export default async function GalleryPage() {
  const galleries = await getGalleries();

  if (!galleries.length) {
    return (
      <div className="container mx-auto py-12">
        <h1 className="text-3xl font-bold mb-6">Фотогалерея</h1>
        <p className="text-lg">В настоящий момент галереи не созданы.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-6">Фотогалерея</h1>
      <p className="text-lg mb-8">
        Ознакомьтесь с нашей коллекцией фотографий, показывающих наши услуги и опыт работы.
      </p>
      <Separator className="my-6" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {galleries.map((gallery) => (
          <Link key={gallery.id} href={`/gallery/${gallery.slug}`}>
            <div className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
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
                <h2 className="text-xl font-bold mb-2">{gallery.title}</h2>
                {gallery.description && (
                  <p className="text-gray-600 line-clamp-2">{gallery.description}</p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
