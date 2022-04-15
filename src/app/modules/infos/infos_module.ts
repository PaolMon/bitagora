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


    BeforeBlockApplyContext, StateStore, TransactionApplyContext
} from 'lisk-sdk';
import { BitagoraAccountProps, infosSchema } from '../../schemas/account';
import { RegisterAsset } from "./assets/register_asset";

export class InfosModule extends BaseModule {
    public actions = {
        // Example below
        // getBalance: async (params) => this._dataAccess.account.get(params.address).token.balance,
        // getBlockByID: async (params) => this._dataAccess.blocks.get(params.id),
        getAccountInfos:async (params:Record<string, unknown>) => {
            let { address } = params;
            if (!Buffer.isBuffer(address) && typeof address === 'string') {
                address = Buffer.from(address, 'hex')
            } 
            const account = await this._dataAccess.getAccountByAddress<BitagoraAccountProps>(address as Buffer);
            return account.infos;
        },
        getAccount:async (params:Record<string, unknown>) => {
            let { address } = params;
            if (!Buffer.isBuffer(address) && typeof address === 'string') {
                address = Buffer.from(address, 'hex')
            } 
            const account = await this._dataAccess.getAccountByAddress<BitagoraAccountProps>(address as Buffer);
            return JSON.stringify(account);
        },
    };
    public reducers = {
        // Example below
        hostChunk: async (
			params: Record<string, unknown>,
			stateStore: StateStore,
		): Promise<void> => {
			const { senderAddress, owner, merkleRoot } = params;
			if (!Buffer.isBuffer(senderAddress)) {
				throw new Error('senderAddress must be a buffer');
			}
			if (!Buffer.isBuffer(owner)) {
				throw new Error('owner must be a buffer');
			}
			if (!Buffer.isBuffer(merkleRoot)) {
				throw new Error('merkle_root must be a buffer');
			}
			const account = await stateStore.account.get<BitagoraAccountProps>(senderAddress);
            account.infos.hostedFiles.push({
                owner: owner,
                merkleRoot: merkleRoot
            })

            await stateStore.account.set(senderAddress, account)
		},
    };
    public name = 'infos';
    public accountSchema = infosSchema;
    public transactionAssets = [new RegisterAsset()];
    public events = [
        // Example below
        // 'infos:newBlock',
        'newHost',
    ];
    public id = 1002;

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
        if (_input.transaction.moduleID === this.id && _input.transaction.assetID === 0) {
            this._channel.publish('infos:newHost', {address: _input.transaction.senderAddress})
        }
    }

    public async afterGenesisBlockApply(_input: AfterGenesisBlockApplyContext) {
        // Get any data from genesis block, for example get all genesis accounts
        // const genesisAccoounts = genesisBlock.header.asset.accounts;
    }
}
