import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Separator } from "@/components/ui/separator";
import PhotoGalleryViewer from "@/components/gallery/PhotoGalleryViewer";
import { ChevronLeft } from "lucide-react";

type Props = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const gallery = await getGalleryBySlug(params.slug);

  if (!gallery) {
    return {
      title: "Галерея не найдена | Royal Transfer",
      description: "Запрашиваемая фотогалерея не найдена",
    };
  }

  return {
    title: `${gallery.title} | Фотогалерея | Royal Transfer`,
    description: gallery.description || `Просмотр фотогалереи ${gallery.title}`,
  };
}

async function getGalleryBySlug(slug: string) {
  try {
    const gallery = await prisma.photoGallery.findUnique({
      where: {
        slug,
        isPublished: true
      },
      include: {
        photos: {
          orderBy: { order: "asc" }
        }
      }
    });

    return gallery;
  } catch (error) {
    console.error(`Error fetching gallery with slug ${slug}:`, error);
    return null;
  }
}

export default async function GalleryDetailPage({ params }: Props) {
  const gallery = await getGalleryBySlug(params.slug);

  if (!gallery) {
    notFound();
  }

  return (
    <div className="container mx-auto py-12">
      <Link
        href="/gallery"
        className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        <ChevronLeft className="h-4 w-4 mr-1" /> Вернуться к галереям
      </Link>

      <h1 className="text-3xl font-bold mb-4">{gallery.title}</h1>

      {gallery.description && (
        <div className="mb-8">
          <p className="text-lg text-gray-700">{gallery.description}</p>
        </div>
      )}

      <Separator className="my-6" />

      {gallery.photos.length > 0 ? (
        <PhotoGalleryViewer photos={gallery.photos} />
      ) : (
        <div className="bg-gray-100 rounded-lg p-12 text-center">
          <h2 className="text-xl font-medium text-gray-600">В этой галерее пока нет фотографий</h2>
        </div>
      )}
    </div>
  );
}
