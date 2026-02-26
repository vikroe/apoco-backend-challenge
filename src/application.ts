import { MikroORM } from '@mikro-orm/postgresql';
import fastify, { FastifyInstance } from 'fastify';
import { getOrm } from './models/dataSource';
import { registerAuthTools } from './modules/auth/auth.tools';
import schemasPlugin from './plugins/schemas.plugin';
import routesRegistry from './modules/routesRegistry';

export default class Application {
    private readonly server: FastifyInstance;
    private orm?: MikroORM;
    private readonly port: number;
    private readonly host: string;

    public constructor() {
        this.server = fastify();
        this.port = Number(process.env.API_PORT ?? 8080);
        this.host = process.env.API_HOST ?? 'localhost';

        registerAuthTools(this.server);
        this.server.register(schemasPlugin);
        this.server.register(routesRegistry);
        this.server.addHook('onClose', async () => {
            await this.closeOrm();
        });
    }

    public start = async (): Promise<void> => {
        this.orm = await getOrm();

        const address = await this.server.listen({
            port: this.port,
            host: this.host,
        });
        console.log(`server listening on ${address}`);
    };

    public close = async (): Promise<void> => {
        await this.server.close();
    };

    private closeOrm = async (): Promise<void> => {
        if (this.orm && (await this.orm.isConnected())) {
            await this.orm.close();
            this.orm = undefined;
        }
    };
}
