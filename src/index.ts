import buildApplication from './application';
import { initOrm } from './models/dataSource';
import {
    SWAGGER_SPEC_PATH,
    SWAGGER_UI_PATH,
} from './modules/swagger/swagger.tools';

const start = async (): Promise<void> => {
    await initOrm();

    const application = buildApplication();
    const address = await application.listen({
        port: Number(process.env.API_PORT ?? 8080),
        host: process.env.API_HOST ?? 'localhost',
    });
    const apiUrl = new URL('/api/v1', address).toString();
    const swaggerUiUrl = new URL(SWAGGER_UI_PATH, address).toString();
    const swaggerSpecUrl = new URL(SWAGGER_SPEC_PATH, address).toString();

    console.log(`server listening on ${address}`);
    console.log(`api endpoint: ${apiUrl}`);
    console.log(`swagger ui: ${swaggerUiUrl}`);
    console.log(`openapi spec: ${swaggerSpecUrl}`);
};

start().catch(err => {
    console.error(err);
    process.exit(1);
});
