import fastify, { FastifyInstance } from "fastify";
import { MikroORM } from "@mikro-orm/postgresql";
import ormConfig from "./mikro-orm.config";

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
            await this.closeOrm();
        });
    }

    private registerRoutes = (): void => {
        this.server.get("/ping", async () => {
            return "pong\n";
        });
    };

    public connect = async (): Promise<void> => {
        if (this.orm) {
            return;
        }

        this.orm = await MikroORM.init(ormConfig);
    };

    public getOrm = (): MikroORM => {
        if (!this.orm) {
            throw new Error("MikroORM is not initialized. Call connect() first.");
        }

        return this.orm;
    };

    private closeOrm = async (): Promise<void> => {
        if (!this.orm) {
            return;
        }

        await this.orm.close(true);
        this.orm = undefined;
    };

    public start = async (): Promise<void> => {
        await this.connect();

        const address = await this.server.listen({ port: this.port, host: this.host });
        console.log(`server listening on ${address}`);
    };

    public close = async (): Promise<void> => {
        await this.server.close();
    };
}
