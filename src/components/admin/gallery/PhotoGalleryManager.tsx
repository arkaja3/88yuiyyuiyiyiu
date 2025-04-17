"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  PlusCircle,
  Pencil,
  Trash2,
  MoveUp,
  MoveDown,
  Loader2,
  X
} from "lucide-react";

// Тип данных для галереи и фотографий
interface GalleryPhoto {
  id: number;
  url: string;
  title: string | null;
  description: string | null;
  order: number;
}

interface Gallery {
  id: number;
  title: string;
  slug: string;
  photos: GalleryPhoto[];
}

// Схема валидации для добавления/редактирования фотографии
const photoFormSchema = z.object({
  url: z.string().url("Введите корректный URL изображения"),
  title: z.string().optional(),
  description: z.string().optional(),
});

type PhotoFormValues = z.infer<typeof photoFormSchema>;

// Схема для массового добавления фотографий
const batchPhotoFormSchema = z.object({
  urls: z.string()
    .min(1, "Добавьте хотя бы один URL")
    .refine(
      (value) => {
        const urls = value.split("\n").filter(url => url.trim() !== "");
        return urls.every(url => {
          try {
            return new URL(url);
          } catch {
            return false;
          }
        });
      },
      {
        message: "Все строки должны содержать корректные URL",
      }
    ),
});

type BatchPhotoFormValues = z.infer<typeof batchPhotoFormSchema>;

interface PhotoGalleryManagerProps {
  gallery: Gallery;
}

export default function PhotoGalleryManager({ gallery }: PhotoGalleryManagerProps) {
  const [photos, setPhotos] = useState<GalleryPhoto[]>(gallery.photos);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Форма для добавления фотографии
  const addForm = useForm<PhotoFormValues>({
    resolver: zodResolver(photoFormSchema),
    defaultValues: {
      url: "",
      title: "",
      description: "",
    },
  });

  // Форма для редактирования фотографии
  const editForm = useForm<PhotoFormValues>({
    resolver: zodResolver(photoFormSchema),
    defaultValues: {
      url: "",
      title: "",
      description: "",
    },
  });

  // Форма для пакетного добавления фотографий
  const batchForm = useForm<BatchPhotoFormValues>({
    resolver: zodResolver(batchPhotoFormSchema),
    defaultValues: {
      urls: "",
    },
  });

  // Добавление фотографии
  const onAddPhoto = async (values: PhotoFormValues) => {
    setIsLoading(true);

    try {
      // Используем FormData вместо JSON
      const formData = new FormData();
      formData.append("url", values.url);
      if (values.title) formData.append("title", values.title);
      if (values.description) formData.append("description", values.description);

      const response = await fetch(`/api/galleries/${gallery.id}/photos`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `Ошибка сервера (${response.status})`);
      }

      const newPhoto = await response.json().catch(() => {
        throw new Error(`Не удалось прочитать ответ сервера`);
      });

      setPhotos([...photos, newPhoto]);
      toast.success("Фотография успешно добавлена");
      addForm.reset();
      setIsAddDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error adding photo:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Произошла ошибка при добавлении фотографии"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Пакетное добавление фотографий
  const onAddBatchPhotos = async (values: BatchPhotoFormValues) => {
    setIsLoading(true);

    try {
      const urls = values.urls.split("\n")
        .map(url => url.trim())
        .filter(url => url !== "");

      if (urls.length === 0) {
        throw new Error("Добавьте хотя бы один URL");
      }

      // Используем FormData вместо JSON
      const formData = new FormData();
      urls.forEach((url, index) => {
        formData.append(`urls[${index}]`, url);
      });

      const response = await fetch(`/api/galleries/${gallery.id}/photos/batch`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `Ошибка сервера (${response.status})`);
      }

      const result = await response.json().catch(() => {
        throw new Error(`Не удалось прочитать ответ сервера`);
      });

      if (result.errors && result.errors.length > 0) {
        toast.warning(`Добавлено ${result.created.length} из ${urls.length} фотографий. Некоторые URL некорректны.`);
      } else {
        toast.success(`Добавлено ${result.created.length} фотографий`);
      }

      // Обновляем список фотографий
      setPhotos([...photos, ...result.created]);
      batchForm.reset();
      setIsBatchDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error adding photos:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Произошла ошибка при добавлении фотографий"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Редактирование фотографии
  const onEditPhoto = async (values: PhotoFormValues) => {
    if (!selectedPhoto) return;

    setIsLoading(true);

    try {
      // Используем FormData вместо JSON
      const formData = new FormData();
      formData.append("url", values.url);
      if (values.title) formData.append("title", values.title);
      if (values.description) formData.append("description", values.description);

      const response = await fetch(`/api/galleries/photos/${selectedPhoto.id}`, {
        method: "PATCH",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || `Ошибка сервера (${response.status})`);
      }

      const updatedPhoto = await response.json().catch(() => {
        throw new Error(`Не удалось прочитать ответ сервера`);
      });

      setPhotos(photos.map(photo =>
        photo.id === selectedPhoto.id ? updatedPhoto : photo
      ));

      toast.success("Фотография успешно обновлена");
      setIsEditDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error updating photo:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Произошла ошибка при обновлении фотографии"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Удаление фотографии
  const onDeletePhoto = async () => {
    if (!selectedPhoto) return;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/galleries/photos/${selectedPhoto.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Произошла ошибка при удалении фотографии");
      }

      setPhotos(photos.filter(photo => photo.id !== selectedPhoto.id));
      toast.success("Фотография успешно удалена");
      setIsDeleteDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error deleting photo:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Произошла ошибка при удалении фотографии"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Изменение порядка фотографии
  const changePhotoOrder = async (photoId: number, direction: "up" | "down") => {
    const photoIndex = photos.findIndex(p => p.id === photoId);
    if (photoIndex === -1) return;

    // Если перемещаем вверх первую или вниз последнюю фотографию - ничего не делаем
    if ((direction === "up" && photoIndex === 0) ||
        (direction === "down" && photoIndex === photos.length - 1)) {
      return;
    }

    const newIndex = direction === "up" ? photoIndex - 1 : photoIndex + 1;

    // Сохраняем текущий порядок
    const currentOrder = photos[photoIndex].order;
    const targetOrder = photos[newIndex].order;

    setIsLoading(true);

    try {
      // Обновляем порядок для текущей фотографии
      const formData1 = new FormData();
      formData1.append("order", targetOrder.toString());

      const response1 = await fetch(`/api/galleries/photos/${photoId}`, {
        method: "PATCH",
        body: formData1
      });

      if (!response1.ok) {
        throw new Error("Ошибка при изменении порядка фотографии");
      }

      // Обновляем порядок для другой фотографии
      const formData2 = new FormData();
      formData2.append("order", currentOrder.toString());

      const response2 = await fetch(`/api/galleries/photos/${photos[newIndex].id}`, {
        method: "PATCH",
        body: formData2
      });

      if (!response2.ok) {
        throw new Error("Ошибка при изменении порядка фотографии");
      }

      // Обновляем локальный массив
      const newPhotos = [...photos];

      // Меняем местами фотографии
      [newPhotos[photoIndex], newPhotos[newIndex]] = [newPhotos[newIndex], newPhotos[photoIndex]];

      // Обновляем порядок
      newPhotos[photoIndex].order = currentOrder;
      newPhotos[newIndex].order = targetOrder;

      setPhotos(newPhotos);
      toast.success("Порядок фотографий изменен");
      router.refresh();
    } catch (error) {
      console.error("Error changing photo order:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Ошибка при изменении порядка фотографий"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-6">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Добавить фотографию
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Добавить новую фотографию</DialogTitle>
            </DialogHeader>
            <Form {...addForm}>
              <form onSubmit={addForm.handleSubmit(onAddPhoto)} className="space-y-6">
                <FormField
                  control={addForm.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL изображения</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Название (необязательно)</FormLabel>
                      <FormControl>
                        <Input placeholder="Название фотографии" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Описание (необязательно)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Описание фотографии"
                          className="min-h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    disabled={isLoading}
                  >
                    Отмена
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Добавить
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <Dialog open={isBatchDialogOpen} onOpenChange={setIsBatchDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <PlusCircle className="mr-2 h-4 w-4" />
              Добавить несколько фото
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Добавить несколько фотографий</DialogTitle>
            </DialogHeader>
            <Form {...batchForm}>
              <form onSubmit={batchForm.handleSubmit(onAddBatchPhotos)} className="space-y-6">
                <FormField
                  control={batchForm.control}
                  name="urls"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL изображений (по одному в строке)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                          className="min-h-48"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsBatchDialogOpen(false)}
                    disabled={isLoading}
                  >
                    Отмена
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Добавить все
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {photos.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-lg text-gray-600 mb-4">
            В этой галерее пока нет фотографий
          </p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Добавить первую фотографию
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {photos.map((photo, index) => (
            <Card key={photo.id} className="overflow-hidden">
              <CardHeader className="p-0">
                <div className="relative aspect-video">
                  <Image
                    src={photo.url}
                    alt={photo.title || `Фото ${index + 1}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="text-lg mb-2">
                  {photo.title || `Фото ${index + 1}`}
                </CardTitle>
                {photo.description && (
                  <p className="text-sm text-gray-500 line-clamp-2">{photo.description}</p>
                )}
              </CardContent>
              <CardFooter className="flex justify-between p-4 pt-0">
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={index === 0 || isLoading}
                    onClick={() => changePhotoOrder(photo.id, "up")}
                  >
                    <MoveUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={index === photos.length - 1 || isLoading}
                    onClick={() => changePhotoOrder(photo.id, "down")}
                  >
                    <MoveDown className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedPhoto(photo);
                      editForm.reset({
                        url: photo.url,
                        title: photo.title || "",
                        description: photo.description || "",
                      });
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setSelectedPhoto(photo);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Диалог редактирования фотографии */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать фотографию</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditPhoto)} className="space-y-6">
              <FormField
                control={editForm.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL изображения</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название (необязательно)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Описание (необязательно)</FormLabel>
                    <FormControl>
                      <Textarea className="min-h-24" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={isLoading}
                >
                  Отмена
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Сохранить
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Фотография будет безвозвратно удалена из галереи.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                onDeletePhoto();
              }}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Удаление..." : "Удалить"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
