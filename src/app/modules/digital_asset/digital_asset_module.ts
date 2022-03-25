/*
 * LiskHQ/lisk-commander
 * Copyright © 2021 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 *
 */

/* eslint-disable class-methods-use-this */

import {
    AfterBlockApplyContext,


    AfterGenesisBlockApplyContext, BaseModule,


    BeforeBlockApplyContext, TransactionApplyContext
} from 'lisk-sdk';
import { digitalAssetAccountSchema } from '../../schemas/account';
import { digitalAsset } from '../../schemas/digital_asset/digital_asset_types';
import { ClaimAsset } from "./assets/claim_asset";
import { CreateAsset } from "./assets/create_asset";
import { RequestAsset } from "./assets/request_asset";
import { ResponseAsset } from "./assets/response_asset";
import { _getAllJSONAssets, _getAssetByMerkleRoot, _getAssetHistoryByMerkleRoot } from './utils/assets';

export class DigitalAssetModule extends BaseModule {
    public actions = {
        // Example below
        // getBalance: async (params) => this._dataAccess.account.get(params.address).token.balance,
        // getBlockByID: async (params) => this._dataAccess.blocks.get(params.id),
        // Example below
        // getBalance: async (params) => this._dataAccess.account.get(params.address).token.balance,
        // getBlockByID: async (params) => this._dataAccess.blocks.get(params.id),
        getAllAssets: async () => _getAllJSONAssets(this._dataAccess),
        getAssetHistory:async (params: Record<string, unknown>) => {
            const { merkle_root } = params;
            if (!Buffer.isBuffer(merkle_root)) {
                throw new Error('Merkle Root must be a buffer');
            }
            _getAssetHistoryByMerkleRoot(this._dataAccess, merkle_root);
        },
        getAssetInfo:async (params:Record<string, unknown>): Promise<digitalAsset> => {
            const { merkle_root } = params;
            if (!Buffer.isBuffer(merkle_root)) {
                throw new Error('Merkle Root must be a buffer');
            }
            const asset = await _getAssetByMerkleRoot(this._dataAccess, merkle_root);
            return asset;
        },
        getAssetOwner: async(params: Record<string, unknown>): Promise<Buffer> => {
            const { merkle_root } = params;
            if (!Buffer.isBuffer(merkle_root)) {
                throw new Error('Merkle Root must be a buffer');
            }
            const asset:digitalAsset = await _getAssetByMerkleRoot(this._dataAccess, merkle_root);
            return asset.owner;
        }
    };
    public reducers = {
        // Example below
        // getBalance: async (
		// 	params: Record<string, unknown>,
		// 	stateStore: StateStore,
		// ): Promise<bigint> => {
		// 	const { address } = params;
		// 	if (!Buffer.isBuffer(address)) {
		// 		throw new Error('Address must be a buffer');
		// 	}
		// 	const account = await stateStore.account.getOrDefault<TokenAccount>(address);
		// 	return account.token.balance;
		// },
    };
    public name = 'digitalAsset';
    public accountSchema = digitalAssetAccountSchema;
    public transactionAssets = [new CreateAsset(), new RequestAsset(), new ResponseAsset(), new ClaimAsset()];
    public events = [
        // Example below
        // 'digitalAsset:newBlock',
    ];
    public id = 1001;

    // public constructor(genesisConfig: GenesisConfig) {
    //     super(genesisConfig);
    // }

    // Lifecycle hooks
    public async beforeBlockApply(_input: BeforeBlockApplyContext) {
        // Get any data from stateStore using block info, below is an example getting a generator
        // const generatorAddress = getAddressFromPublicKey(_input.block.header.generatorPublicKey);
		// const generator = await _input.stateStore.account.get<TokenAccount>(generatorAddress);
    }

    public async afterBlockApply(_input: AfterBlockApplyContext) {
        // Get any data from stateStore using block info, below is an example getting a generator
        // const generatorAddress = getAddressFromPublicKey(_input.block.header.generatorPublicKey);
		// const generator = await _input.stateStore.account.get<TokenAccount>(generatorAddress);
    }

    public async beforeTransactionApply(_input: TransactionApplyContext) {
        // Get any data from stateStore using transaction info, below is an example
        // const sender = await _input.stateStore.account.getOrDefault<TokenAccount>(_input.transaction.senderAddress);
    }

    public async afterTransactionApply(_input: TransactionApplyContext) {
        // Get any data from stateStore using transaction info, below is an example
        // const sender = await _input.stateStore.account.getOrDefault<TokenAccount>(_input.transaction.senderAddress);
    }

    public async afterGenesisBlockApply(_input: AfterGenesisBlockApplyContext) {
        // Get any data from genesis block, for example get all genesis accounts
        // const genesisAccoounts = genesisBlock.header.asset.accounts;
    }
}
