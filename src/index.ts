#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerListingTools } from "./tools/listings.js";
import { registerPricingTools } from "./tools/pricing.js";
import { registerOverrideTools } from "./tools/overrides.js";
import { registerNeighborhoodTools } from "./tools/neighborhood.js";
import { registerReservationTools } from "./tools/reservations.js";

const server = new McpServer({
  name: "pricelabs-mcp-server",
  version: "1.0.0",
});

registerListingTools(server);
registerPricingTools(server);
registerOverrideTools(server);
registerNeighborhoodTools(server);
registerReservationTools(server);

async function main(): Promise<void> {
  if (!process.env.PRICELABS_API_KEY) {
    console.error(
      "ERROR: PRICELABS_API_KEY environment variable is required.\n" +
      "Get your API key from PriceLabs: Settings → API Details."
    );
    process.exit(1);
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("PriceLabs MCP server running via stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
