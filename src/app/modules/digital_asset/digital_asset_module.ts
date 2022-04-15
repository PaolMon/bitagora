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


    BeforeBlockApplyContext, codec, TransactionApplyContext
} from 'lisk-sdk';
import { BitagoraAccountProps, digitalAssetAccountSchema } from '../../schemas/account';
import { digitalAssetSchema } from '../../schemas/digital_asset/digital_asset_schemas';
import { digitalAsset } from '../../schemas/digital_asset/digital_asset_types';
import { ClaimAsset } from "./assets/claim_asset";
import { CreateAsset } from "./assets/create_asset";
import { RequestAsset } from "./assets/request_asset";
import { ResponseAsset } from "./assets/response_asset";
import { _getAllJSONAssets, _getAssetByMerkleRoot, _getAssetHistoryByMerkleRoot } from './utils/assets';
import { _getAllJSONChunks } from './utils/chunks';

export class DigitalAssetModule extends BaseModule {
    public actions = {
        // Example below
        // getBalance: async (params) => this._dataAccess.account.get(params.address).token.balance,
        // getBlockByID: async (params) => this._dataAccess.blocks.get(params.id),
        // Example below
        // getBalance: async (params) => this._dataAccess.account.get(params.address).token.balance,
        // getBlockByID: async (params) => this._dataAccess.blocks.get(params.id),
        getAllAssets: async () => _getAllJSONAssets(this._dataAccess),
        getAllChunks: async () => _getAllJSONChunks(this._dataAccess),
        getAssetHistory:async (params: Record<string, unknown>) => {
            let { merkleRoot } = params;
            if (!Buffer.isBuffer(merkleRoot) && typeof merkleRoot === 'string') {
                merkleRoot = Buffer.from(merkleRoot, 'hex')
            } 
            return _getAssetHistoryByMerkleRoot(this._dataAccess, merkleRoot as Buffer);
        },

        getAsset:async (params:Record<string, unknown>): Promise<object> => {
            let { merkleRoot } = params;
            if (!Buffer.isBuffer(merkleRoot) && typeof merkleRoot === 'string') {
                merkleRoot = Buffer.from(merkleRoot, 'hex')
            } 
            const asset = await _getAssetByMerkleRoot(this._dataAccess, merkleRoot as Buffer);
            //return JSON.stringify(asset);
            return codec.toJSON(digitalAssetSchema, asset)
        },

        getAssetOwner: async(params: Record<string, unknown>): Promise<string> => {
            let { merkleRoot } = params;
            if (!Buffer.isBuffer(merkleRoot) && typeof merkleRoot === 'string') {
                merkleRoot = Buffer.from(merkleRoot, 'hex')
            } 
            const asset:digitalAsset = await _getAssetByMerkleRoot(this._dataAccess, merkleRoot as Buffer);
            return asset.owner.toString('hex');
        },

        getAccountAssets:async (params:Record<string, unknown>) => {
            let { address } = params;
            if (!Buffer.isBuffer(address) && typeof address === 'string') {
                address = Buffer.from(address, 'hex')
            } 
            const account = await this._dataAccess.getAccountByAddress<BitagoraAccountProps>(address as Buffer);
            return account.digitalAsset;
        },
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
