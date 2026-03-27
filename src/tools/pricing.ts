import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { makeApiRequest, handleApiError } from "../services/api-client.js";
import { CHARACTER_LIMIT } from "../constants.js";
import type { ListingPriceResponse, RatePlan } from "../types.js";

export function registerPricingTools(server: McpServer): void {
  server.registerTool(
    "pricelabs_get_listing_prices",
    {
      title: "Get Listing Prices",
      description: `Retrieve recommended prices and detailed pricing breakdown for one or more listings.

Returns daily pricing data including: recommended price, user price, uncustomized price, min stay,
booking status, ADR, demand indicators, weekly/monthly discounts, extra person fees,
check-in/check-out availability, and optionally the pricing reason breakdown.

Args:
  - listings (array, required): Array of listing price requests:
    - id (string, required): Listing ID
    - pms (string, required): PMS name
    - dateFrom (string, optional): Start date (YYYY-MM-DD)
    - dateTo (string, optional): End date (YYYY-MM-DD)
    - reason (boolean, optional): Include pricing reason breakdown

Returns: Array of listing price objects with daily data.

Error statuses that may appear per listing:
  - LISTING_NOT_PRESENT: Listing doesn't exist
  - LISTING_NO_DATA: Prices not yet fetched
  - LISTING_TOGGLE_OFF: Sync is disabled

Examples:
  - Get prices for date range: { listings: [{ id: "123", pms: "airbnb", dateFrom: "2025-01-01", dateTo: "2025-01-31" }] }
  - Get prices with reasons: { listings: [{ id: "123", pms: "airbnb", reason: true }] }`,
      inputSchema: {
        listings: z.array(
          z.object({
            id: z.string().min(1).describe("Listing ID"),
            pms: z.string().min(1).describe("PMS name"),
            dateFrom: z.string()
              .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
              .optional()
              .describe("Start date (YYYY-MM-DD)"),
            dateTo: z.string()
              .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
              .optional()
              .describe("End date (YYYY-MM-DD)"),
            reason: z.boolean()
              .optional()
              .describe("Include pricing reason breakdown"),
          }).strict()
        )
          .min(1, "At least one listing is required")
          .describe("Array of listing price requests"),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params) => {
      try {
        const result = await makeApiRequest<ListingPriceResponse[]>(
          "listing_prices",
          "POST",
          { listings: params.listings }
        );

        const text = JSON.stringify(result, null, 2);
        return {
          content: [{
            type: "text" as const,
            text: text.length > CHARACTER_LIMIT
              ? text.slice(0, CHARACTER_LIMIT) + "\n\n[Truncated. Use narrower date ranges to reduce data.]"
              : text,
          }],
        };
      } catch (error) {
        return { content: [{ type: "text" as const, text: handleApiError(error) }] };
      }
    }
  );

  server.registerTool(
    "pricelabs_get_rate_plans",
    {
      title: "Get Rate Plans",
      description: `Retrieve rate plan adjustments for a listing's non-default rate plans.

Rate plans define pricing variations (e.g., non-refundable, long-stay) relative to the base rate.

Args:
  - listing_id (string, required): Listing ID
  - pms_name (string, required): PMS name

Returns: Rate plan objects with adjustment percentages and plan types.

Examples:
  - Get rate plans: { listing_id: "123", pms_name: "airbnb" }`,
      inputSchema: {
        listing_id: z.string().min(1).describe("Listing ID"),
        pms_name: z.string().min(1).describe("PMS name"),
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params) => {
      try {
        const result = await makeApiRequest<{ rate_plans: RatePlan }>(
          "fetch_rate_plans",
          "GET",
          undefined,
          { listing_id: params.listing_id, pms_name: params.pms_name }
        );
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return { content: [{ type: "text" as const, text: handleApiError(error) }] };
      }
    }
  );
}
