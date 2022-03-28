/* eslint-disable @typescript-eslint/no-empty-function */
import { Application } from 'lisk-sdk';
import { DashboardPlugin } from "@liskhq/lisk-framework-dashboard-plugin";
import { FaucetPlugin } from  '@liskhq/lisk-framework-faucet-plugin';


export const registerPlugins = (app: Application): void => {
    app.registerPlugin(DashboardPlugin);
    app.registerPlugin(FaucetPlugin);
};
