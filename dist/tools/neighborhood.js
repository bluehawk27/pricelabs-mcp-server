import { z } from "zod";
import { makeApiRequest, handleApiError } from "../services/api-client.js";
import { CHARACTER_LIMIT } from "../constants.js";
export function registerNeighborhoodTools(server) {
    server.registerTool("pricelabs_get_neighborhood_data", {
        title: "Get Neighborhood Data",
        description: `Retrieve market comparison data and KPIs for a listing's neighborhood.

Returns comprehensive market analytics including:
- Future percentile prices by bedroom category (25th, 50th, 75th, 90th percentiles, median booked price)
- Summary table of base prices over 180 days (past and future)
- Future occupancy, new bookings, and cancellation trends (with year-over-year comparisons)
- Market KPIs: total available days, booking window, length of stay, revenue, total booked days

Bedroom categories: -1=Room, 0=Studio, 1+=Number of bedrooms.

Args:
  - listing_id (string, required): Listing ID
  - pms (string, required): PMS name

Returns: Neighborhood analytics with market data, pricing percentiles, and occupancy metrics.

Examples:
  - Get market data: { listing_id: "123", pms: "airbnb" }`,
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
            const result = await makeApiRequest("neighborhood_data", "GET", undefined, { listing_id: params.listing_id, pms: params.pms });
            const text = JSON.stringify(result, null, 2);
            return {
                content: [{
                        type: "text",
                        text: text.length > CHARACTER_LIMIT
                            ? text.slice(0, CHARACTER_LIMIT) + "\n\n[Truncated due to large dataset.]"
                            : text,
                    }],
            };
        }
        catch (error) {
            return { content: [{ type: "text", text: handleApiError(error) }] };
        }
    });
}
//# sourceMappingURL=neighborhood.js.map