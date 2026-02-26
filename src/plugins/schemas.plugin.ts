import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import {
    AUTH_SCHEMAS,
} from "../modules/auth/auth.schemas";
import { COMMON_SCHEMA_DEFINITION } from "../modules/common/common.schemas";

interface SchemaWithId {
    $id: string;
}

const schemaDefinitions = [
    ...COMMON_SCHEMA_DEFINITION,
    ...AUTH_SCHEMAS
] as const;

const schemasPlugin: FastifyPluginAsync = async (server) => {
    for (const schema of schemaDefinitions) {
        const schemaWithId = schema as SchemaWithId;
        if (!server.getSchema(schemaWithId.$id)) {
            server.addSchema(schema);
        }
    }
};

export default fp(schemasPlugin);
