"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// Схема валидации формы
const formSchema = z.object({
  title: z.string()
    .min(3, "Название должно содержать минимум 3 символа")
    .max(255, "Название не должно превышать 255 символов"),
  slug: z.string()
    .min(3, "Slug должен содержать минимум 3 символа")
    .max(255, "Slug не должен превышать 255 символов")
    .regex(/^[a-z0-9-]+$/, "Slug должен содержать только строчные буквы, цифры и дефисы"),
  description: z.string().optional(),
  isPublished: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface GalleryFormProps {
  galleryId?: number;
  initialData?: FormValues;
}

export default function GalleryForm({ galleryId, initialData }: GalleryFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Инициализация формы с начальными данными
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      title: "",
      slug: "",
      description: "",
      isPublished: true,
    },
  });

  // Загрузка данных для редактирования
  useEffect(() => {
    const fetchGallery = async () => {
      if (!galleryId) return;

      try {
        setIsLoading(true);
        const response = await fetch(`/api/galleries/${galleryId}`);

        if (!response.ok) {
          throw new Error("Не удалось загрузить данные галереи");
        }

        const gallery = await response.json();

        form.reset({
          title: gallery.title,
          slug: gallery.slug,
          description: gallery.description || "",
          isPublished: gallery.isPublished,
        });
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
        toast.error("Не удалось загрузить данные галереи");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGallery();
  }, [galleryId, form]);

  // Автоматическое создание slug из названия
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\wа-яё]/gi, "-") // Заменяем все не-буквенно-цифровые символы на дефис
      .replace(/[а-яё]/gi, (match) => {
        // Транслитерация кириллицы
        const translitMap: Record<string, string> = {
          а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh",
          з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
          п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts",
          ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya"
        };
        return translitMap[match.toLowerCase()] || match;
      })
      .replace(/--+/g, "-") // Заменяем множественные дефисы на один
      .replace(/^-+|-+$/g, ""); // Убираем дефисы в начале и конце
  };

  // Обработка отправки формы
  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);

    try {
      const url = galleryId
        ? `/api/galleries/${galleryId}`
        : "/api/galleries";

      const method = galleryId ? "PATCH" : "POST";

      // Создаем объект FormData
      const formData = new FormData();

      // Если это редактирование, добавляем ID
      if (galleryId) {
        formData.append("id", galleryId.toString());
      }

      // Добавляем все поля в FormData
      formData.append("title", values.title);
      formData.append("slug", values.slug);
      formData.append("description", values.description || "");
      formData.append("isPublished", values.isPublished.toString());

      // Отправляем запрос
      const response = await fetch(url, {
        method,
        body: formData
      });

      // Проверяем на ошибки
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Произошла ошибка при сохранении (${response.status})`);
      }

      // Получаем данные ответа
      const gallery = await response.json();

      // Показываем уведомление об успешном создании
      toast.success(
        galleryId
          ? "Галерея успешно обновлена"
          : "Галерея успешно создана"
      );

      // Перенаправляем на страницу галереи или обновляем текущую
      if (!galleryId) {
        router.push(`/admin/galleries/${gallery.id}`);
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error("Ошибка при сохранении:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Произошла ошибка при сохранении"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Название галереи</FormLabel>
              <FormControl>
                <Input
                  placeholder="Название галереи"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    // Если это новая галерея и slug не был вручную изменён
                    if (!galleryId && !form.getValues("slug")) {
                      const slug = generateSlug(e.target.value);
                      form.setValue("slug", slug, { shouldValidate: true });
                    }
                  }}
                />
              </FormControl>
              <FormDescription>
                Название будет отображаться в списке галерей и на странице галереи
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL галереи (slug)</FormLabel>
              <FormControl>
                <Input placeholder="url-galerei" {...field} />
              </FormControl>
              <FormDescription>
                URL по которому будет доступна галерея. Используйте только строчные латинские буквы, цифры и дефисы.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Описание галереи</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Описание галереи (необязательно)"
                  className="min-h-32"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Описание будет отображаться на странице галереи
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isPublished"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Опубликовать галерею</FormLabel>
                <FormDescription>
                  Если галерея опубликована, она будет видна на сайте
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/galleries")}
            disabled={isLoading}
          >
            Отмена
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {galleryId ? "Сохранить изменения" : "Создать галерею"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
