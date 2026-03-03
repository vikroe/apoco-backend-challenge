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
        listQuerystring: 'schema:pokemon:listQuerystring',
        getByIdParams: 'schema:pokemon:getByIdParams',
        getByNameParams: 'schema:pokemon:getByNameParams',
        response: 'schema:pokemon:response',
        typesResponse: 'schema:pokemon:typesResponse',
        dimension: 'schema:pokemon:dimension',
        evolutionRequirements: 'schema:pokemon:evolutionRequirements',
        evolution: 'schema:pokemon:evolution',
        attack: 'schema:pokemon:attack',
        attacks: 'schema:pokemon:attacks',
    },
    user: {
        setFavoritePokemon: 'schema:user:setFavoritePokemon',
    },
} as const;
