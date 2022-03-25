/* eslint-disable @typescript-eslint/no-empty-function */
import { Application } from 'lisk-sdk';
import { DigitalAssetModule } from "./modules/digital_asset/digital_asset_module";
import { InfosModule } from "./modules/infos/infos_module";

export const registerModules = (app: Application): void => {
    app.registerModule(DigitalAssetModule);
    app.registerModule(InfosModule);
};
