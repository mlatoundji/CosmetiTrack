import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string | null;
    currentPrice: number;
    quantity: number;
    minQuantity: number;
    images: Array<{
      url: string;
      alt: string | null;
      isMain: boolean;
    }>;
    category: { id: string; name: string } | null;
    brand: { id: string; name: string } | null;
    supplier: { id: string; name: string } | null;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const mainImage = product.images.find((image) => image.isMain) || product.images[0];
  const isLowStock = product.quantity <= product.minQuantity;

  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 w-full">
        {mainImage ? (
          <Image
            src={mainImage.url}
            alt={mainImage.alt || product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gray-100">
            <span className="text-gray-400">No image</span>
          </div>
        )}
        {isLowStock && (
          <div className="absolute top-2 right-2 rounded-full bg-red-500 px-2 py-1 text-xs text-white">
            Low Stock
          </div>
        )}
      </div>
      <CardHeader>
        <CardTitle className="text-lg">{product.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Category: {product.category?.name || 'Uncategorized'}</span>
            {product.brand && (
              <span className="text-sm text-gray-500">Brand: {product.brand.name}</span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">${product.currentPrice.toFixed(2)}</span>
            <span className="text-sm text-gray-500">Stock: {product.quantity}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Link href={`/dashboard/products/${product.id}`}>
          <Button variant="outline">View Details</Button>
        </Link>
        <Link href={`/dashboard/products/${product.id}/edit`}>
          <Button variant="default">Edit</Button>
        </Link>
      </CardFooter>
    </Card>
  );
} 