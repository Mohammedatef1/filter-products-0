"use client";

import NoProducts from "@/components/product/NoProducts";
import Product from "@/components/product/Product";
import ProductSkeleton from "@/components/product/ProductSkeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import type { Product as typeProduct } from "@/db";
import { cn } from "@/lib/utils";
import { ProductState } from "@/lib/validators/product-validator";
import { useQuery } from "@tanstack/react-query";
import { QueryResult } from "@upstash/vector";
import axios from "axios";
import debounce from "lodash.debounce";
import { ChevronDown } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const SORT_OPTIONS = [
  { name: "None", value: "none" },
  { name: "Price: Low to High", value: "price-asc" },
  { name: "Price: High to Low", value: "price-desc" },
] as const;

const COLOR_FILTER = {
  name: "Color",
  id: "color",
  options: [
    { value: "white", label: "White" },
    { value: "biege", label: "Biege" },
    { value: "blue", label: "Blue" },
    { value: "purple", label: "Purple" },
    { value: "green", label: "Green" },
  ] as const,
};

const SIZE_FILTER = {
  id: "size",
  name: "Size",
  options: [
    { value: "S", label: "Small" },
    { value: "M", label: "Medium" },
    { value: "L", label: "Large" },
  ] as const,
};

const PRICE_FILTER = {
  id: "price",
  name: "Price",
  options: [
    { value: [0, 100], label: "Any Price" },
    { value: [0, 20], label: "Under 20 $" },
    { value: [0, 40], label: "Under 40 $" },
  ] as const,
};

const SUBCATEGORIES = [
  { name: "T-Shirts", selected: true, href: "#" },
  { name: "Hoodies", selected: false, href: "#" },
  { name: "Sweetshirts", selected: false, href: "#" },
  { name: "Accessories", selected: false, href: "#" },
];

const DEFAULT_PRICE_RANGE = [0, 100] as [number, number];

export default function Home() {
  const [filter, setFilter] = useState<ProductState>({
    color: ["biege", "blue", "green", "purple", "white"],
    sort: "none",
    price: { isCustom: false, range: DEFAULT_PRICE_RANGE },
    size: ["L", "S", "M"],
  });

  useEffect(() => {
    _debounceSubmit();
  }, [filter]);

  const onSubmit = () => refetch();
  const debounceSubmit = debounce(onSubmit, 400);
  const _debounceSubmit = useCallback(debounceSubmit, []);

  const appluArrayFilter = ({ category, value }: { category: keyof Omit<typeof filter, "sort" | "price">; value: string }) => {
    const isFilterApplied = filter[category].includes(value as never);

    if (isFilterApplied) {
      setFilter((prev) => ({
        ...prev,
        [category]: prev[category].filter((v) => v != value),
      }));
    } else {
      setFilter((prev) => ({
        ...prev,
        [category]: [...prev[category], value],
      }));
    }
  };

  const {
    data: products,
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await axios.post<QueryResult<typeProduct>[]>("http://localhost:3000/api/products", {
        filter: {
          sort: filter.sort,
          price: filter.price.range,
          color: filter.color,
          size: filter.size,
        },
      });
      return data;
    },
  });

  //console.log(filter);

  const minPrice = Math.min(filter.price.range[0], filter.price.range[1]);
  const maxPrice = Math.max(filter.price.range[0], filter.price.range[1]);

  return (
    <main className="mx-auto max-w-7xl p-4 sm:p-6 lh:p-8 ">
      <div className="flex items-baseline justify-between border-b border-gray-200 pb-6 pt-24 ">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">High quality cotton selection</h1>
        <DropdownMenu>
          <DropdownMenuTrigger className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900 ">
            Sort
            <ChevronDown className="-mr-1 ml-1 h-5 w-5 text-gray-400 group-hover:text-gray-500 flex-shrink-0" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {SORT_OPTIONS.map((option) => (
              <button
                className={cn("text-left text-sm block py-2 px-4 w-full", {
                  "text-gray-900 bg-gray-100": option.value === filter.sort,
                  "text-gray-500": option.value !== filter.sort,
                })}
                key={option.name}
                onClick={() => {
                  setFilter((prev) => ({ ...prev, sort: option.value }));
                }}>
                {option.name}
              </button>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <section className="pb-24 pt-6">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
          {/*FILTERS*/}
          <div className="hidden lg:block">
            <ul className="space-y-4 border-b border-gray-200 pb-6 text-sm font-medium text-gray-900 ">
              {SUBCATEGORIES.map((category) => (
                <li key={category.name}>
                  <button
                    disabled={!category.selected}
                    className="disabled:cursor-not-allowed disabled:opacity-60">
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
            <Accordion type="multiple">
              <AccordionItem value="color">
                <AccordionTrigger className="py-3 text-sm text-gray-400 hover:text-gray-500">
                  <span className="text-gray-900 font-medium">Color</span>
                </AccordionTrigger>
                <AccordionContent className="pt-6 animate-none">
                  <ul className="space-y-4">
                    {COLOR_FILTER.options.map((option) => (
                      <li
                        key={option.value}
                        className="flex items-center">
                        <input
                          type="checkbox"
                          id={`color-${option.value}`}
                          checked={filter.color.includes(option.value as never)}
                          onChange={() => {
                            appluArrayFilter({
                              category: "color",
                              value: option.value,
                            });
                          }}
                          className="h-4 w-4 border-red-300 rounded text-indigo-600 focus:text-indigo-500"
                        />
                        <label
                          htmlFor={`color-${option.value}`}
                          className="text-sm ml-3 text-gray-600">
                          {option.label}
                        </label>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="size">
                <AccordionTrigger className="py-3 text-sm text-gray-400 hover:text-gray-500">
                  <span className="text-gray-900 font-medium">Size</span>
                </AccordionTrigger>
                <AccordionContent className="pt-6 animate-none">
                  <ul className="space-y-4">
                    {SIZE_FILTER.options.map((option) => (
                      <li
                        key={option.value}
                        className="flex items-center">
                        <input
                          type="checkbox"
                          id={`size-${option.value}`}
                          checked={filter.size.includes(option.value as never)}
                          onChange={() => {
                            appluArrayFilter({
                              category: "size",
                              value: option.value,
                            });
                          }}
                          className="h-4 w-4 border-red-300 rounded text-indigo-600 focus:text-indigo-500"
                        />
                        <label
                          htmlFor={`size-${option.value}`}
                          className="text-sm ml-3 text-gray-600">
                          {option.label}
                        </label>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="price">
                <AccordionTrigger className="py-3 text-sm text-gray-400 hover:text-gray-500">
                  <span className="text-gray-900 font-medium">Price</span>
                </AccordionTrigger>
                <AccordionContent className="pt-6 animate-none">
                  <ul className="space-y-4">
                    {PRICE_FILTER.options.map((option) => (
                      <li
                        key={option.label}
                        className="flex items-center">
                        <input
                          type="radio"
                          id={`price-${option.label}`}
                          checked={filter.price.range[0] == option.value[0] && filter.price.range[1] == option.value[1] && filter.price.isCustom === false}
                          onChange={() => {
                            setFilter((prev) => ({
                              ...prev,
                              price: {
                                isCustom: false,
                                range: [option.value[0], option.value[1]],
                              },
                            }));
                          }}
                          className="h-4 w-4 border-red-300 rounded text-indigo-600 focus:text-indigo-500"
                        />
                        <label
                          htmlFor={`price-${option.label}`}
                          className="text-sm ml-3 text-gray-600">
                          {option.label}
                        </label>
                      </li>
                    ))}
                    <li className="flex flex-col justify-center gap-2">
                      <div>
                        <input
                          type="radio"
                          id={`price-custom`}
                          checked={filter.price.isCustom}
                          onChange={() => {
                            setFilter((prev) => ({
                              ...prev,
                              price: {
                                isCustom: true,
                                range: [0, 100],
                              },
                            }));
                          }}
                          className="h-4 w-4 border-red-300 rounded text-indigo-600 focus:text-indigo-500"
                        />
                        <label
                          htmlFor={`price-custom`}
                          className="text-sm ml-3 text-gray-600">
                          Custom
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="font-medium">Price</p>
                        <div>
                          {filter.price.isCustom ? minPrice.toFixed(0) : filter.price.range[0]} $ - {filter.price.isCustom ? maxPrice.toFixed(0) : filter.price.range[1]} $
                        </div>
                      </div>
                      <Slider
                        className={cn("mt-2", {
                          "opacity-50": !filter.price.isCustom,
                        })}
                        disabled={!filter.price.isCustom}
                        onValueChange={(value) => {
                          const [newMin, newMax] = value;
                          setFilter((prev) => ({
                            ...prev,
                            price: {
                              isCustom: true,
                              range: [newMin, newMax],
                            },
                          }));
                        }}
                        step={1}
                        value={[filter.price.range[0], filter.price.range[1]]}
                        min={DEFAULT_PRICE_RANGE[0]}
                        max={DEFAULT_PRICE_RANGE[1]}
                        defaultValue={DEFAULT_PRICE_RANGE}
                      />
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/*PRODUCTS*/}
          <ul className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {products ? (
              products.length === 0 ? (
                <NoProducts />
              ) : (
                products.map((product, index) => (
                  <Product
                    key={product.metadata!.name + index}
                    product={product.metadata!}
                  />
                ))
              )
            ) : (
              new Array(12).fill(null).map((_, i) => <ProductSkeleton key={i} />)
            )}
          </ul>
        </div>
      </section>
    </main>
  );
}
