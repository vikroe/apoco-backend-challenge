import fastify from "fastify";

const server = fastify();
const port = Number(process.env.PORT ?? 8080);
const host = process.env.HOST ?? "0.0.0.0";

server.get('/ping', async (request, reply) => {
    return 'pong\n';
});

const start = async () => {
    try {
        const address = await server.listen({ port, host });
        console.log(`server listening on ${address}`);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

start();
