# PriceLabs MCP Server

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server that provides programmatic access to the [PriceLabs Customer API](https://developer.pricelabs.co/) — dynamic pricing and revenue management for short-term rentals.

This server exposes 11 tools that let AI assistants manage listings, retrieve pricing recommendations, set date-specific overrides, analyze market data, and track reservations across multiple property management systems.

## Prerequisites

- **Node.js** >= 18
- A **PriceLabs** account with API access (Settings > API Details)

## Installation

```bash
git clone <repository-url>
cd pricelabs-mcp-server
npm install
npm run build
```

## Configuration

The server requires a PriceLabs API key provided via environment variable:

```bash
export PRICELABS_API_KEY="your-api-key-here"
```

### Claude Desktop / Claude Code

Add the server to your MCP configuration (`.mcp.json` or Claude Desktop config):

```json
{
  "mcpServers": {
    "pricelabs": {
      "command": "node",
      "args": ["/path/to/pricelabs-mcp-server/dist/index.js"],
      "env": {
        "PRICELABS_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

## Usage

```bash
# Production
npm start

# Development (hot reload)
npm run dev
```

The server communicates over **stdio** using the MCP protocol.

## Tools

### Listings

| Tool | Description |
|------|-------------|
| `pricelabs_get_listings` | Retrieve all listings with pricing metrics and occupancy data |
| `pricelabs_get_listing` | Get detailed info for a specific listing |
| `pricelabs_update_listings` | Update base/min/max prices and tags for one or more listings |
| `pricelabs_add_listing` | Import a new listing from a PMS into PriceLabs (BookingSync only) |

### Pricing

| Tool | Description |
|------|-------------|
| `pricelabs_get_listing_prices` | Get recommended daily prices with optional breakdown reasoning |
| `pricelabs_get_rate_plans` | Retrieve rate plan adjustments (non-refundable, long-stay, etc.) |

### Date-Specific Overrides

| Tool | Description |
|------|-------------|
| `pricelabs_get_overrides` | Get date-specific pricing and restriction overrides |
| `pricelabs_set_overrides` | Create or update overrides (fixed price, percentage, min stay, check-in/check-out rules) |
| `pricelabs_delete_overrides` | Delete overrides for specific dates |

### Market Data

| Tool | Description |
|------|-------------|
| `pricelabs_get_neighborhood_data` | Market comparison analytics — percentile pricing, occupancy trends, and KPIs |

### Reservations

| Tool | Description |
|------|-------------|
| `pricelabs_get_reservations` | Retrieve reservations with revenue data, supports pagination and date filtering |

## API Rate Limits

- **60** requests per minute
- **1,000** requests per hour
- **300s** request timeout (as recommended by PriceLabs)

## Project Structure

```
src/
├── index.ts                 # MCP server entry point
├── types.ts                 # TypeScript interfaces
├── constants.ts             # API configuration
├── services/
│   └── api-client.ts        # HTTP client with error handling
└── tools/
    ├── listings.ts          # Listing management tools
    ├── pricing.ts           # Pricing and rate plan tools
    ├── overrides.ts         # Date-specific override tools
    ├── neighborhood.ts      # Market comparison tool
    └── reservations.ts      # Reservation retrieval tool
```

## Development

```bash
npm run dev       # Start with hot reload
npm run build     # Compile TypeScript
npm run clean     # Remove compiled output
```

## License

ISC
