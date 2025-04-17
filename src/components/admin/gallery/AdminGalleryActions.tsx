"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface AdminGalleryActionsProps {
  galleryId: number;
}

export default function AdminGalleryActions({ galleryId }: AdminGalleryActionsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/galleries/${galleryId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Произошла ошибка при удалении");
      }

      toast.success("Галерея успешно удалена");
      router.refresh();
    } catch (error) {
      console.error("Error deleting gallery:", error);
      toast.error(error instanceof Error ? error.message : "Произошла ошибка при удалении");
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const togglePublishStatus = async (publish: boolean) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/galleries/${galleryId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isPublished: publish,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Произошла ошибка при изменении статуса");
      }

      toast.success(
        publish ? "Галерея опубликована" : "Галерея скрыта"
      );
      router.refresh();
    } catch (error) {
      console.error("Error updating gallery status:", error);
      toast.error(
        error instanceof Error ? error.message : "Произошла ошибка при изменении статуса"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => togglePublishStatus(true)}
        disabled={isLoading}
      >
        <Eye className="h-4 w-4 mr-2" />
        Опубликовать
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => togglePublishStatus(false)}
        disabled={isLoading}
      >
        <EyeOff className="h-4 w-4 mr-2" />
        Скрыть
      </Button>

      <Button
        variant="destructive"
        size="sm"
        onClick={() => setIsDeleteDialogOpen(true)}
        disabled={isLoading}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Удалить
      </Button>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Галерея будет безвозвратно удалена из базы данных.
              Все фотографии этой галереи также будут удалены.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Удаление..." : "Удалить"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
