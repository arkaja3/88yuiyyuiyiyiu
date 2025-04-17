import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminGalleryActions from "@/components/admin/gallery/AdminGalleryActions";

export const metadata: Metadata = {
  title: "Управление фотогалереями | Админ панель",
  description: "Управление фотогалереями сайта",
};

async function getGalleries() {
  try {
    const galleries = await prisma.photoGallery.findMany({
      include: {
        photos: {
          take: 1,
          orderBy: { order: "asc" },
        },
        _count: {
          select: { photos: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return galleries;
  } catch (error) {
    console.error("Error fetching galleries:", error);
    return [];
  }
}

export default async function AdminGalleriesPage() {
  const galleries = await getGalleries();

  return (
    <div className="container mx-auto p-6">
      <AdminHeader
        title="Управление фотогалереями"
        description="Создавайте и редактируйте фотогалереи сайта"
      />

      <div className="flex justify-between mb-6">
        <h2 className="text-xl font-medium">Список фотогалерей</h2>
        <Button asChild>
          <Link href="/admin/galleries/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Создать галерею
          </Link>
        </Button>
      </div>

      {galleries.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-lg text-gray-600 mb-4">
            У вас пока нет ни одной фотогалереи
          </p>
          <Button asChild>
            <Link href="/admin/galleries/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Создать первую галерею
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {galleries.map((gallery) => (
            <div
              key={gallery.id}
              className="relative flex flex-col md:flex-row bg-white border rounded-lg overflow-hidden shadow-sm"
            >
              <div className="md:w-1/4 h-64 md:h-auto relative">
                {gallery.photos[0] ? (
                  <Image
                    src={gallery.photos[0].url}
                    alt={gallery.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">Нет фото</span>
                  </div>
                )}
              </div>

              <div className="flex-1 p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold">{gallery.title}</h3>
                  <div className="flex items-center gap-2">
                    {gallery.isPublished ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs">
                        Опубликовано
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-md text-xs">
                        Черновик
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-gray-500 mb-1">
                  URL: <span className="font-mono text-sm">/gallery/{gallery.slug}</span>
                </p>
                <p className="text-gray-500 mb-4">
                  Фотографий: {gallery._count.photos}
                </p>

                {gallery.description && (
                  <p className="text-gray-700 mb-4 line-clamp-2">{gallery.description}</p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/galleries/${gallery.id}`}>
                      Управление фотографиями
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/galleries/edit/${gallery.id}`}>
                      Редактировать
                    </Link>
                  </Button>
                  <AdminGalleryActions galleryId={gallery.id} />
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/gallery/${gallery.slug}`} target="_blank">
                      Просмотр
                    </Link>
                  </Button>
                </div>

                <p className="text-xs text-gray-400 mt-4">
                  Создано: {formatDate(gallery.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
