import { XCircle } from "lucide-react";

const NoProducts = () => {
  return (
    <div className="relative col-span-full flex flex-col justify-center items-center h-80 bg-gray-50 ">
      <XCircle className="h-8 w-8 text-red-500" />
      <h3 className="font-medium text-xl">No product found</h3>
      <p className="text-zinc-500 text-sm">We found no search results for these filters.</p>
    </div>
  );
};

export default NoProducts;
