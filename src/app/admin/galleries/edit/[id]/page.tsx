import { Metadata } from "next";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import AdminHeader from "@/components/admin/AdminHeader";
import GalleryForm from "@/components/admin/gallery/GalleryForm";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Редактировать галерею | Админ панель",
  description: "Редактирование существующей фотогалереи",
};

interface EditGalleryPageProps {
  params: {
    id: string;
  };
}

async function getGallery(id: number) {
  try {
    const gallery = await prisma.photoGallery.findUnique({
      where: { id },
    });
    return gallery;
  } catch (error) {
    console.error("Error fetching gallery:", error);
    return null;
  }
}

export default async function EditGalleryPage({ params }: EditGalleryPageProps) {
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
      <AdminHeader
        title={`Редактировать галерею: ${gallery.title}`}
        description="Внесите изменения в информацию о галерее"
      />

      <Separator className="my-6" />

      <div className="max-w-3xl mx-auto">
        <GalleryForm galleryId={id} />
      </div>
    </div>
  );
}
