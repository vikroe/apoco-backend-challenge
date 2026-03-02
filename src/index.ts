import buildApplication from './application';
import { initOrm } from './models/dataSource';

const start = async (): Promise<void> => {
    await initOrm();

    const application = buildApplication();
    const address = await application.listen({
        port: Number(process.env.API_PORT ?? 8080),
        host: process.env.API_HOST ?? 'localhost',
    });

    console.log(`server listening on ${address}`);
};

start().catch(err => {
    console.error(err);
    process.exit(1);
});
