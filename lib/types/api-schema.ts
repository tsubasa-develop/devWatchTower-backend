
export interface paths {
    "/contents": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: {
                    type?: components["parameters"]["QueryType"];
                    q?: components["parameters"]["QueryQ"];
                    limit?: components["parameters"]["QueryLimit"];
                    offset?: components["parameters"]["QueryOffset"];
                    sort?: components["parameters"]["QuerySort"];
                    order?: components["parameters"]["QueryOrder"];
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["ContentListResponse"];
                    };
                };
                400: components["responses"]["BadRequest"];
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/contents/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: components["parameters"]["PathId"];
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Content"];
                    };
                };
                404: components["responses"]["NotFound"];
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        Content: {
            id: string;
            type: string;
            title: string;
            summary?: string | null;
            body?: string | null;
            metadata: string;
            published_at: string;
            created_at: string;
            updated_at: string;
        };
        ContentListItem: {
            id: string;
            type: string;
            title: string;
            summary?: string | null;
            metadata: string;
            published_at: string;
            created_at: string;
            updated_at: string;
        };
        ContentListResponse: {
            items: components["schemas"]["ContentListItem"][];
            limit: number;
            offset: number;
            total: number;
        };
        Error: {
            code: string;
            message: string;
            details?: {
                [key: string]: unknown;
            } | null;
        };
    };
    responses: {
        BadRequest: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Error"];
            };
        };
        NotFound: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["Error"];
            };
        };
    };
    parameters: {
        PathId: string;
        QueryType: string;
        QueryQ: string;
        QueryLimit: number;
        QueryOffset: number;
        QuerySort: "created_at" | "updated_at" | "published_at" | "title";
        QueryOrder: "asc" | "desc";
    };
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export type operations = Record<string, never>;
