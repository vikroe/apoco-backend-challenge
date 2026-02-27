export const SCHEMA_REGISTRY = {
    common: {
        errorResponse: 'schema:common:errorResponse',
        authHeader: 'schema:common:authHeader',
    },
    auth: {
        credentialsBody: 'schema:auth:credentialsBody',
        user: 'schema:auth:user',
        authResponse: 'schema:auth:authResponse',
        meResponse: 'schema:auth:meResponse',
    },
    pokemon: {
        getByIdParams: 'schema:pokemon:getByIdParams',
        response: 'schema:pokemon:response',
        dimension: 'schema:pokemon:dimension',
        evolutionRequirements: 'schema:pokemon:evolutionRequirements',
        evolution: 'schema:pokemon:evolution',
        attack: 'schema:pokemon:attack',
        attacks: 'schema:pokemon:attacks',
    },
} as const;
