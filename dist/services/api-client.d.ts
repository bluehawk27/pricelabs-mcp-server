export declare function getApiKey(): string;
export declare function makeApiRequest<T>(endpoint: string, method?: "GET" | "POST" | "PUT" | "DELETE", data?: unknown, params?: Record<string, string | number | boolean | undefined>): Promise<T>;
export declare function handleApiError(error: unknown): string;
export declare function truncateResponse(text: string, limit: number): string;
//# sourceMappingURL=api-client.d.ts.map