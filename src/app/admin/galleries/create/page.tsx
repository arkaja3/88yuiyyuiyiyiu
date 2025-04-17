import { Metadata } from "next";
import AdminHeader from "@/components/admin/AdminHeader";
import GalleryForm from "@/components/admin/gallery/GalleryForm";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Создать новую галерею | Админ панель",
  description: "Создание новой фотогалереи",
};

export default function CreateGalleryPage() {
  return (
    <div className="container mx-auto p-6">
      <AdminHeader
        title="Создать новую галерею"
        description="Заполните форму для создания новой фотогалереи"
      />

      <Separator className="my-6" />

      <div className="max-w-3xl mx-auto">
        <GalleryForm />
      </div>
    </div>
  );
}
