export const SCHEMA_REGISTRY = {
    common: {
        errorResponse: "schema:common:errorResponse",
        authHeader: "schema:common:authHeader",
    },
    auth: {
        credentialsBody: "schema:auth:credentialsBody",
        user: "schema:auth:user",
        authResponse: "schema:auth:authResponse",
        meResponse: "schema:auth:meResponse",
    },
} as const;
