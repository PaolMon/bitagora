import { Application, PartialApplicationConfig, utils } from 'lisk-sdk';
import { registerModules } from './modules';
import { registerPlugins } from './plugins';

export const getApplication = (
	genesisBlock: Record<string, unknown>,
	config: PartialApplicationConfig,
): Application => {

	// PATCH genesis block for Hello module
	const updatedGenesisBlock = utils.objects.mergeDeep({}, genesisBlock);
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
	updatedGenesisBlock.header.asset.accounts = updatedGenesisBlock.header.asset.accounts.map((a: any) =>
		utils.objects.mergeDeep({}, a, {
			digitalAsset: {
				pending: [],
				allowed: [],
				myFiles: [],
			},
			infos: {
				myNeighbors: [],
				hostedFiles: []
			}
        }),
	);
	const app = Application.defaultApplication(updatedGenesisBlock, config);

	registerModules(app);
	registerPlugins(app);

	return app;
};
