import { redirect } from "next/navigation";
import { brands } from "../../brands.config.js";
import Sidebar from "../../components/Sidebar";

type BrandConfig = { id: string; name: string };

export default async function BrandLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ brand: string }>;
}) {
  const { brand: brandId } = await params;
  const brand = (brands as Record<string, BrandConfig>)[brandId];

  if (!brand) redirect("/");

  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar brandId={brandId} brandName={brand.name} />
      {/* Main content — offset by sidebar width */}
      <main className="flex-1 min-w-0 ml-60 p-8">
        {children}
      </main>
    </div>
  );
}
