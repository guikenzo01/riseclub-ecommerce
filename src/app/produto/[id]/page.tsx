import ProductDetail from "@/components/ProductDetail";

type ProductPageProps = {
  params: {
    id: string;
  };
};

export default function ProductPage({ params }: ProductPageProps) {
  return <ProductDetail productId={params.id} />;
}
