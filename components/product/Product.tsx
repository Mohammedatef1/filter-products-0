/* eslint-disable @next/next/no-img-element */
import type { Product } from "@/db";

const Product = ({ product }: { product: Product }) => {
  const { imageId, size, color, name, price } = product;

  return (
    <div className="group relative">
      <div className="aspect-square w-full overflow-hidden rounded-md group-hover:opacity-75 bg-gray-200 lg:aspect-none lg:h-80">
        <img
          src={imageId}
          alt="product image"
          className="w-full h-full object-cover object-center"
        />
      </div>
      <div className="flex justify-between mt-4 text-sm">
        <div className="">
          <h3 className="text-gray-700">{name}</h3>
          <p className="mt-1 text-gray-500">
            Size {size.toUpperCase()}, {color}
          </p>
        </div>
        <p className="font-medium text-gray-900">{price}</p>
      </div>
    </div>
  );
};

export default Product;
