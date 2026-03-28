import axios from "axios";
import { API_BASE_URL, DEFAULT_TIMEOUT } from "../constants.js";
let apiKey;
export function getApiKey() {
    if (!apiKey) {
        apiKey = process.env.PRICELABS_API_KEY;
    }
    if (!apiKey) {
        throw new Error("PRICELABS_API_KEY environment variable is required. " +
            "Get your API key from PriceLabs: Settings → API Details.");
    }
    return apiKey;
}
export async function makeApiRequest(endpoint, method = "GET", data, params) {
    const cleanParams = {};
    if (params) {
        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined) {
                cleanParams[key] = value;
            }
        }
    }
    const response = await axios({
        method,
        url: `${API_BASE_URL}/${endpoint}`,
        data,
        params: Object.keys(cleanParams).length > 0 ? cleanParams : undefined,
        timeout: DEFAULT_TIMEOUT,
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-API-Key": getApiKey(),
        },
    });
    return response.data;
}
export function handleApiError(error) {
    if (axios.isAxiosError(error)) {
        const axiosErr = error;
        if (axiosErr.response) {
            const status = axiosErr.response.status;
            const body = axiosErr.response.data;
            const detail = body?.error || body?.message || "";
            switch (status) {
                case 400:
                    return `Error: Bad request. ${detail || "Check that listing IDs and PMS names are correct."}`;
                case 401:
                    return "Error: Invalid API key. Check your PRICELABS_API_KEY environment variable. Get your key from Settings → API Details in PriceLabs.";
                case 403:
                    return "Error: Access forbidden. Your API key may not have permission for this operation.";
                case 404:
                    return `Error: Resource not found. ${detail || "Verify the listing ID exists in your PriceLabs account."}`;
                case 429:
                    return "Error: Rate limit exceeded (60 req/min, 1000 req/hour). Wait before retrying.";
                default:
                    return `Error: API returned status ${status}. ${detail}`;
            }
        }
        else if (axiosErr.code === "ECONNABORTED") {
            return "Error: Request timed out (300s). The PriceLabs API may be under heavy load. Try again.";
        }
        else if (axiosErr.code === "ECONNREFUSED") {
            return "Error: Could not connect to api.pricelabs.co. Check your network connection.";
        }
    }
    return `Error: ${error instanceof Error ? error.message : String(error)}`;
}
export function truncateResponse(text, limit) {
    if (text.length <= limit)
        return text;
    return text.slice(0, limit) + "\n\n[Response truncated. Use pagination or filters to reduce results.]";
}
//# sourceMappingURL=api-client.js.map