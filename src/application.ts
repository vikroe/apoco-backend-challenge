import { MikroORM } from "@mikro-orm/postgresql";
import ormConfig from "./orm.config";

export default class Application {
    public orm: MikroORM
    
    public connect = async (): Promise<void> => {
        try {
            this.orm = await MikroORM.init(ormConfig);
        } catch (e) {
            console.error(e);
        }
    }
}