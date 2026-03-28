import { z } from "zod";
import { makeApiRequest, handleApiError } from "../services/api-client.js";
import { CHARACTER_LIMIT } from "../constants.js";
export function registerListingTools(server) {
    server.registerTool("pricelabs_get_listings", {
        title: "Get All Listings",
        description: `Retrieve all listings from your PriceLabs account with pricing and performance metrics.

Returns listings with: name, location, base/min/max prices, occupancy metrics (7/30/60/90 days),
market occupancy comparisons, revenue data, recommended base price, sync status, tags, and groups.

Args:
  - skip_hidden (boolean, optional): Filter out hidden listings (default: false)
  - only_syncing_listings (boolean, optional): Return only actively syncing listings (default: false)

Returns: Array of listing objects with full pricing and performance data.

Examples:
  - Get all active listings: { only_syncing_listings: true }
  - Get all visible listings: { skip_hidden: true }`,
        inputSchema: {
            skip_hidden: z.boolean()
                .default(false)
                .describe("Filter out hidden listings"),
            only_syncing_listings: z.boolean()
                .default(false)
                .describe("Return only actively syncing listings"),
        },
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: true,
        },
    }, async (params) => {
        try {
            const listings = await makeApiRequest("listings", "GET", undefined, {
                skip_hidden: params.skip_hidden ? "true" : undefined,
                only_syncing_listings: params.only_syncing_listings ? "true" : undefined,
            });
            const text = JSON.stringify(listings, null, 2);
            return {
                content: [{
                        type: "text",
                        text: text.length > CHARACTER_LIMIT
                            ? text.slice(0, CHARACTER_LIMIT) + "\n\n[Truncated. Use pricelabs_get_listing for individual listing details.]"
                            : text,
                    }],
            };
        }
        catch (error) {
            return { content: [{ type: "text", text: handleApiError(error) }] };
        }
    });
    server.registerTool("pricelabs_get_listing", {
        title: "Get Single Listing",
        description: `Retrieve detailed information for a specific listing by ID.

Returns full listing data including: name, location, pricing (base/min/max), occupancy metrics,
market comparisons, revenue, recommended base price, sync status, tags, groups, and channel details.

Args:
  - listing_id (string, required): The PriceLabs listing ID

Returns: Single listing object with all metrics.

Examples:
  - Get listing details: { listing_id: "12345" }`,
        inputSchema: {
            listing_id: z.string()
                .min(1, "Listing ID is required")
                .describe("The PriceLabs listing ID"),
        },
        annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: true,
        },
    }, async (params) => {
        try {
            const listing = await makeApiRequest(`listings/${encodeURIComponent(params.listing_id)}`);
            return {
                content: [{ type: "text", text: JSON.stringify(listing, null, 2) }],
            };
        }
        catch (error) {
            return { content: [{ type: "text", text: handleApiError(error) }] };
        }
    });
    server.registerTool("pricelabs_update_listings", {
        title: "Update Listings",
        description: `Update pricing settings and tags for one or more listings.

You can update base price, min price, max price, and tags (up to 10) for each listing.
Both listing ID and PMS name are required for each listing to update.

Args:
  - listings (array, required): Array of listing update objects, each containing:
    - id (string, required): Listing ID
    - pms (string, required): PMS name (e.g., "airbnb", "vrbo")
    - min (number, optional): Minimum price
    - base (number, optional): Base price
    - max (number, optional): Maximum price
    - tags (array of strings, optional): Tags (max 10)

Returns: Updated listing objects.

Examples:
  - Update base price: { listings: [{ id: "123", pms: "airbnb", base: 150 }] }
  - Update tags: { listings: [{ id: "123", pms: "airbnb", tags: ["beachfront", "luxury"] }] }`,
        inputSchema: {
            listings: z.array(z.object({
                id: z.string().min(1).describe("Listing ID"),
                pms: z.string().min(1).describe("PMS name (e.g., 'airbnb', 'vrbo')"),
                min: z.number().optional().describe("Minimum price"),
                base: z.number().optional().describe("Base price"),
                max: z.number().optional().describe("Maximum price"),
                tags: z.array(z.string()).max(10).optional().describe("Tags (max 10)"),
            }).strict())
                .min(1, "At least one listing is required")
                .describe("Array of listings to update"),
        },
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: true,
            openWorldHint: true,
        },
    }, async (params) => {
        try {
            const result = await makeApiRequest("listings", "POST", { listings: params.listings });
            return {
                content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
            };
        }
        catch (error) {
            return { content: [{ type: "text", text: handleApiError(error) }] };
        }
    });
    server.registerTool("pricelabs_add_listing", {
        title: "Import New Listing",
        description: `Import a newly created listing from your PMS into PriceLabs. Currently supports BookingSync only.

Args:
  - listing_id (string, required): The listing ID from your PMS
  - pms_name (string, required): PMS name (currently only "bookingsync")

Returns: Success message with imported listing IDs and any listings missing coordinates.

Examples:
  - Import listing: { listing_id: "abc123", pms_name: "bookingsync" }`,
        inputSchema: {
            listing_id: z.string().min(1).describe("Listing ID from PMS"),
            pms_name: z.string().min(1).describe("PMS name (currently 'bookingsync')"),
        },
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: false,
            openWorldHint: true,
        },
    }, async (params) => {
        try {
            const result = await makeApiRequest("add_listing_data", "POST", { listing_id: params.listing_id, pms_name: params.pms_name });
            return {
                content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
            };
        }
        catch (error) {
            return { content: [{ type: "text", text: handleApiError(error) }] };
        }
    });
}
//# sourceMappingURL=listings.js.map