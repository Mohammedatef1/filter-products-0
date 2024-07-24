const ProductSkeleton = () => {
  return (
    <div className="relative animate-pulse">
      <div className="aspect-square w-full overflow-hidden rounded-md group-hover:opacity-75 bg-gray-200 lg:aspect-none lg:h-80">
        <div className="w-full h-full bg-gray-200" />
      </div>
      <div className="flex flex-col mt-4 gap-2">
        <div className="w-full h-4 bg-gray-200" />
        <div className="w-full h-4 bg-gray-200" />
      </div>
    </div>
  );
};

export default ProductSkeleton;
