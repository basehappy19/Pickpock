import Link from "next/link";
import { Home, FileX } from "lucide-react";
import { Button } from "@/components/shared/button";
import { cookies } from "next/headers";
import { Language } from "@/lib/translations";

export default async function NotFound() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("language")?.value as Language) || "th";

  const content = {
    th: {
      title: "ไม่พบหน้าเว็บ",
      description: "หน้าเว็บที่คุณค้นหาไม่มีอยู่ในระบบ หรืออาจถูกย้ายไปแล้ว",
      returnHome: "กลับหน้าแรก",
    },
    en: {
      title: "Page Not Found",
      description: "The page you're looking for doesn't exist or has been moved.",
      returnHome: "Return Home",
    },
  };

  const t = content[lang];

  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh] px-4">
      <div className="text-center space-y-8 max-w-md">
        <div className="flex justify-center">
          <div className="p-6 rounded-2xl bg-muted/50 border">
            <FileX className="h-16 w-16 text-muted-foreground" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-medium tracking-tight">{t.title}</h1>
          <p className="text-muted-foreground">
            {t.description}
          </p>
        </div>

        <Link href="/">
          <Button size="lg" className="gap-2">
            <Home className="h-4 w-4" />
            {t.returnHome}
          </Button>
        </Link>
      </div>
    </div>
  );
}
