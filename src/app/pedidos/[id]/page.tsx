import OrderDetailClient from "@/components/OrderDetailClient";

type OrderDetailPageProps = {
  params: {
    id: string;
  };
};

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  return <OrderDetailClient orderId={params.id} />;
}
