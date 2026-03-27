import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { makeApiRequest, handleApiError } from "../services/api-client.js";
import { CHARACTER_LIMIT } from "../constants.js";
import type { ReservationResponse } from "../types.js";

export function registerReservationTools(server: McpServer): void {
  server.registerTool(
    "pricelabs_get_reservations",
    {
      title: "Get Reservations",
      description: `Retrieve PMS reservations with revenue data. Supports pagination and date filtering.

Returns reservation details including: listing info, check-in/check-out dates, booking status,
rental revenue, total cost, length of stay, currency, cleaning fees, booking channel,
and confirmation codes.

Results are paginated at 100 per page. Use offset to fetch subsequent pages.

Args:
  - pms (string, optional): Filter by PMS name
  - start_date (string, optional): Start date filter (YYYY-MM-DD)
  - end_date (string, optional): End date filter (YYYY-MM-DD)
  - limit (number, optional): Results per page (default: 100)
  - offset (number, optional): Pagination offset (default: 0)

Returns: Paginated reservation data with next_page indicator.

Examples:
  - Get recent reservations: { start_date: "2025-01-01" }
  - Get reservations for specific PMS: { pms: "airbnb", limit: 50 }
  - Get next page: { offset: 100 }`,
      inputSchema: {
        pms: z.string()
          .optional()
          .describe("Filter by PMS name"),
        start_date: z.string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
          .optional()
          .describe("Start date filter (YYYY-MM-DD)"),
        end_date: z.string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
          .optional()
          .describe("End date filter (YYYY-MM-DD)"),
        limit: z.number()
          .int()
          .min(1)
          .max(100)
          .default(100)
          .describe("Results per page (max 100)"),
        offset: z.number()
          .int()
          .min(0)
          .default(0)
          .describe("Pagination offset"),
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
        const result = await makeApiRequest<ReservationResponse>(
          "reservation_data",
          "GET",
          undefined,
          {
            pms: params.pms,
            start_date: params.start_date,
            end_date: params.end_date,
            limit: params.limit,
            offset: params.offset,
          }
        );

        const output = {
          ...result,
          pagination: {
            limit: params.limit,
            offset: params.offset,
            has_more: result.next_page,
            next_offset: result.next_page ? params.offset + params.limit : undefined,
          },
        };

        const text = JSON.stringify(output, null, 2);
        return {
          content: [{
            type: "text" as const,
            text: text.length > CHARACTER_LIMIT
              ? text.slice(0, CHARACTER_LIMIT) + "\n\n[Truncated. Use date filters or pagination to reduce data.]"
              : text,
          }],
        };
      } catch (error) {
        return { content: [{ type: "text" as const, text: handleApiError(error) }] };
      }
    }
  );
}
