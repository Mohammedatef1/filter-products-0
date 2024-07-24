import { db } from "@/db";
import { ProductFilterValidator } from "@/lib/validators/product-validator";
import { NextApiRequest, NextApiResponse } from "next";

class Filter {
  private filters: Map<string, string[]> = new Map();

  hasFilters() {
    return this.filters.size > 0;
  }

  add(key: string, operator: string, value: string | number) {
    const filter = this.filters.get(key) || [];
    filter.push(`${key} ${operator} ${typeof value === "number" ? value : `"${value}"`}`);
    this.filters.set(key, filter);
  }

  addRow(key: string, row: string) {
    this.filters.set(key, [row]);
  }

  get() {
    const parts: string[] = [];
    this.filters.forEach((filter) => {
      const groupedValues = filter.join(" OR ");
      parts.push(`(${groupedValues})`);
    });
    return parts.join(" AND ");
  }
}

const AVG_PRICE_RANGE = 30;
const MAX_PRICE_RANGE = 50;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { filter: data } = req.body;
    const { sort, color, price, size } = ProductFilterValidator.parse(data);

    const filter = new Filter();

    color.length === 0 ? filter.add("color", "=", "") : color.forEach((color) => filter.add("color", "=", color));
    size.length === 0 ? filter.add("size", "=", "") : size.forEach((size) => filter.add("size", "=", size));
    filter.addRow("price", `price >= ${price[0]} AND price <= ${price[1]}`);

    const products = await db.query({
      topK: 12,
      vector: [0, 0, 0],
      includeMetadata: true,
      filter: filter.hasFilters() ? filter.get() : undefined,
    });

    res.status(200).json(products);
  } catch (error) {
    console.error("Error querying the database:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
