import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { AI_SCHEMAS } from '../modules/ai/ai.schemas';
import { AUTH_SCHEMAS } from '../modules/auth/auth.schemas';
import { COMMON_SCHEMA_DEFINITION } from '../modules/common/common.schemas';
import { POKEMON_SCHEMAS } from '../modules/pokemon/pokemon.schemas';
import { USER_SCHEMAS } from '../modules/user/user.schema';

interface SchemaWithId {
    $id: string;
}

const schemaDefinitions = [
    ...COMMON_SCHEMA_DEFINITION,
    ...AI_SCHEMAS,
    ...AUTH_SCHEMAS,
    ...POKEMON_SCHEMAS,
    ...USER_SCHEMAS,
] as const;

const schemasPlugin: FastifyPluginAsync = async server => {
    for (const schema of schemaDefinitions) {
        const schemaWithId = schema as SchemaWithId;
        if (!server.getSchema(schemaWithId.$id)) {
            server.addSchema(schema);
        }
    }
};

export default fp(schemasPlugin);
