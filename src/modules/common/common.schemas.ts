import { SCHEMA_REGISTRY } from "../schemaRegistry";

export const COMMON_SCHEMA_DEFINITION = [{
    $id: SCHEMA_REGISTRY.common.errorResponse,
    type: "object",
    additionalProperties: true,
    required: ["message"],
    properties: {
        message: { type: "string" },
    },
}];