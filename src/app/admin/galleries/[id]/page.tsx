import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import AdminHeader from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, PenLine } from "lucide-react";
import PhotoGalleryManager from "@/components/admin/gallery/PhotoGalleryManager";

export const metadata: Metadata = {
  title: "Управление фотографиями | Админ панель",
  description: "Управление фотографиями галереи",
};

interface GalleryPhotoPageProps {
  params: {
    id: string;
  };
}

async function getGallery(id: number) {
  try {
    const gallery = await prisma.photoGallery.findUnique({
      where: { id },
      include: {
        photos: {
          orderBy: { order: "asc" },
        },
      },
    });
    return gallery;
  } catch (error) {
    console.error("Error fetching gallery:", error);
    return null;
  }
}

export default async function GalleryPhotoPage({ params }: GalleryPhotoPageProps) {
  const id = parseInt(params.id);

  if (isNaN(id)) {
    notFound();
  }

  const gallery = await getGallery(id);

  if (!gallery) {
    notFound();
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <AdminHeader
          title={`Фотографии галереи: ${gallery.title}`}
          description="Добавляйте и управляйте фотографиями в галерее"
        />

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/galleries">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Назад к галереям
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/galleries/edit/${gallery.id}`}>
              <PenLine className="h-4 w-4 mr-1" />
              Редактировать галерею
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/gallery/${gallery.slug}`} target="_blank">
              Просмотр на сайте
            </Link>
          </Button>
        </div>
      </div>

      <Separator className="my-6" />

      <PhotoGalleryManager gallery={gallery} />
    </div>
  );
}
