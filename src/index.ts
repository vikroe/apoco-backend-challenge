import Application from './application';

const application = new Application();

application.start().catch(err => {
    console.error(err);
    process.exit(1);
});
