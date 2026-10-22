import { tools } from "@/lib/tools";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Construction } from "lucide-react";
import TextTools from "@/components/tools/TextTools";
import ImageTools from "@/components/tools/ImageTools";
import MiscTools from "@/components/tools/MiscTools";

export const dynamicParams = false;

export function generateStaticParams() {
  return tools.map((tool) => ({
    slug: tool.slug,
  }));
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const tool = tools.find((t) => t.slug === resolvedParams.slug);

  if (!tool) {
    return notFound();
  }

  const renderTool = () => {
    switch (tool.category) {
      case "Text":
        return <TextTools slug={tool.slug} />;
      case "Image":
        return <ImageTools slug={tool.slug} />;
      case "Misc":
      case "Media":
        return <MiscTools slug={tool.slug} />;
      default:
        return null;
    }
  };

  const toolComponent = renderTool();

  return (
    <div className="p-4 space-y-6 min-h-screen">
      <header className="flex items-center gap-3 pt-2">
        <Link href="/" className="p-2 rounded-full glass-button">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-bold text-xl">{tool.name}</h1>
      </header>

      <div className="glass-card p-6 min-h-[300px]">
        {toolComponent ? (
          toolComponent
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-12">
            <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <Construction className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h2 className="text-lg font-bold">Segera Hadir</h2>
            <p className="text-sm text-slate-500 max-w-[250px]">
              Fitur {tool.name} sedang dalam tahap pengembangan. Nantikan update selanjutnya!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
