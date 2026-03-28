import { z } from "zod";
import { makeApiRequest, handleApiError } from "../services/api-client.js";
const OverrideSchema = z.object({
    date: z.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
        .describe("Date for the override (YYYY-MM-DD)"),
    price: z.union([z.string(), z.number()])
        .optional()
        .describe("Price override value. Pass 0 to delete. For percent type: -75 to 500"),
    price_type: z.enum(["fixed", "percent"])
        .optional()
        .describe("'fixed' for absolute price, 'percent' for percentage adjustment"),
    currency: z.string()
        .optional()
        .describe("Currency code (e.g., 'USD', 'EUR')"),
    min_stay: z.number()
        .int()
        .min(0)
        .optional()
        .describe("Minimum stay requirement in nights"),
    min_price: z.number()
        .optional()
        .describe("Minimum price for this date"),
    min_price_type: z.enum(["fixed", "percent_base", "percent_min"])
        .optional()
        .describe("Type for min_price"),
    max_price: z.number()
        .optional()
        .describe("Maximum price for this date"),
    max_price_type: z.enum(["fixed", "percent_base", "percent_max"])
        .optional()
        .describe("Type for max_price"),
    base_price: z.number()
        .optional()
        .describe("Base price override for this date"),
    check_in_check_out_enabled: z.enum(["0", "1"])
        .optional()
        .describe("'1' to enable check-in/check-out restrictions, '0' to disable"),
    check_in: z.string()
        .length(7)
        .optional()
        .describe("7-char binary string (Mon-Sun): 1=allowed, 0=not allowed. E.g., '1111100' for weekdays only"),
    check_out: z.string()
        .length(7)
        .optional()
        .describe("7-char binary string (Mon-Sun): 1=allowed, 0=not allowed"),
    reason: z.string()
        .optional()
        .describe("Reason/note for the override"),
}).strict();
export function registerOverrideTools(server) {
    server.registerTool("pricelabs_get_overrides", {
        title: "Get Date-Specific Overrides",
        description: `Retrieve date-specific pricing and restriction overrides (DSO) for a listing.

Overrides allow custom pricing, min-stay rules, and check-in/check-out restrictions for specific dates.

Args:
  - listing_id (string, required): Listing ID
  - pms (string, required): PMS name

Returns: Array of override objects with date, price, min_stay, check-in/check-out rules.

The check_in/check_out fields use a 7-character binary string (Mon-Sun): '1' = allowed, '0' = not allowed.
Example: '1111100' means check-in/check-out allowed Mon-Fri only.

Examples:
  - Get overrides: { listing_id: "123", pms: "airbnb" }`,
        inputSchema: {
            listing_id: z.string().min(1).describe("Listing ID"),
            pms: z.string().min(1).describe("PMS name"),
        },
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: true,
        },
    }, async (params) => {
        try {
            const result = await makeApiRequest(`listings/${encodeURIComponent(params.listing_id)}/overrides`, "GET", undefined, { pms: params.pms });
            return {
                content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
            };
        }
        catch (error) {
            return { content: [{ type: "text", text: handleApiError(error) }] };
        }
    });
    server.registerTool("pricelabs_set_overrides", {
        title: "Set Date-Specific Overrides",
        description: `Create or update date-specific pricing and restriction overrides for a listing.

Set custom prices, minimum stays, and check-in/check-out rules for specific dates.
Pass price=0 on a date to delete that override.

Args:
  - listing_id (string, required): Listing ID
  - pms (string, required): PMS name
  - update_children (boolean, optional): Apply overrides to child listings too (default: false)
  - overrides (array, required): Array of override objects:
    - date (string, required): Date (YYYY-MM-DD)
    - price (number/string, optional): Price value. 0 to delete override
    - price_type (string, optional): 'fixed' or 'percent' (-75 to 500 for percent)
    - min_stay (number, optional): Minimum stay in nights
    - min_price/max_price (number, optional): Price bounds
    - check_in_check_out_enabled ('0'|'1', optional): Enable restrictions
    - check_in/check_out (string, optional): 7-char binary Mon-Sun
    - reason (string, optional): Note for the override

Returns: Updated overrides and child listing update info.

Examples:
  - Set fixed price: { listing_id: "123", pms: "airbnb", overrides: [{ date: "2025-12-31", price: 200, price_type: "fixed" }] }
  - Set min stay: { listing_id: "123", pms: "airbnb", overrides: [{ date: "2025-07-04", min_stay: 3 }] }
  - Delete override: { listing_id: "123", pms: "airbnb", overrides: [{ date: "2025-12-31", price: 0 }] }`,
        inputSchema: {
            listing_id: z.string().min(1).describe("Listing ID"),
            pms: z.string().min(1).describe("PMS name"),
            update_children: z.boolean()
                .default(false)
                .describe("Apply overrides to child listings"),
            overrides: z.array(OverrideSchema)
                .min(1, "At least one override is required")
                .describe("Array of date-specific overrides"),
        },
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: true,
        },
    }, async (params) => {
        try {
            const result = await makeApiRequest(`listings/${encodeURIComponent(params.listing_id)}/overrides`, "POST", {
                pms: params.pms,
                update_children: params.update_children,
                overrides: params.overrides,
            });
            return {
                content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
            };
        }
        catch (error) {
            return { content: [{ type: "text", text: handleApiError(error) }] };
        }
    });
    server.registerTool("pricelabs_delete_overrides", {
        title: "Delete Date-Specific Overrides",
        description: `Delete date-specific overrides for a listing on specified dates.

Args:
  - listing_id (string, required): Listing ID
  - pms (string, required): PMS name
  - update_children (boolean, optional): Delete from child listings too (default: false)
  - dates (array, required): Array of dates to delete overrides for (YYYY-MM-DD)

Returns: 204 No Content on success.

Examples:
  - Delete overrides: { listing_id: "123", pms: "airbnb", dates: ["2025-12-31", "2025-12-30"] }`,
        inputSchema: {
            listing_id: z.string().min(1).describe("Listing ID"),
            pms: z.string().min(1).describe("PMS name"),
            update_children: z.boolean()
                .default(false)
                .describe("Delete from child listings too"),
            dates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"))
                .min(1, "At least one date is required")
                .describe("Dates to delete overrides for"),
        },
        annotations: {
            readOnlyHint: false,
            destructiveHint: true,
            idempotentHint: true,
            openWorldHint: true,
        },
    }, async (params) => {
        try {
            await makeApiRequest(`listings/${encodeURIComponent(params.listing_id)}/overrides`, "DELETE", {
                pms: params.pms,
                update_children: params.update_children,
                overrides: params.dates.map((date) => ({ date })),
            });
            return {
                content: [{ type: "text", text: "Overrides deleted successfully." }],
            };
        }
        catch (error) {
            return { content: [{ type: "text", text: handleApiError(error) }] };
        }
    });
}
//# sourceMappingURL=overrides.js.map