import { MikroORM } from "@mikro-orm/postgresql";
import fastify, { FastifyInstance } from "fastify";
import { getOrm } from "./models/dataSource";

export default class Application {
    private readonly server: FastifyInstance;
    private orm?: MikroORM;
    private readonly port: number;
    private readonly host: string;

    public constructor() {
        this.server = fastify();
        this.port = Number(process.env.PORT ?? 8080);
        this.host = process.env.HOST ?? "0.0.0.0";

        this.registerRoutes();
        this.server.addHook("onClose", async () => {
            await this.close();
        });
    }

    private registerRoutes = (): void => {
        this.server.get("/ping", async () => {
            return "pong\n";
        });
    };

    public start = async (): Promise<void> => {
        this.orm = await getOrm();

        const address = await this.server.listen({ port: this.port, host: this.host });
        console.log(`server listening on ${address}`);
    };

    public close = async (): Promise<void> => {
        if (this.orm && await this.orm.isConnected()) {
            await this.orm.close();
            this.orm = undefined;
        }

        await this.server.close();
    };
}
