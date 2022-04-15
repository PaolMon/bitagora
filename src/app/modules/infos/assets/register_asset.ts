import { BaseAsset, ApplyAssetContext, ValidateAssetContext } from 'lisk-sdk';
import { host } from '../../../schemas/hosts/hosts_types';
import { getAllHosts, getHostIndex, setNewHost } from '../utils/hosts';

import { BitagoraAccountProps } from '../../../schemas/account';

export type register = {
	ipAddress: string,
	port: number
}

const MAX_NEIGHBORS = 4;

export class RegisterAsset extends BaseAsset {
	public name = 'register';
  	public id = 0;

  // Define schema for asset
	public schema = {
    	$id: 'infos/register-asset',
		title: 'RegisterAsset transaction asset for infos module',
		type: 'object',
		required: ['ipAddress', 'port'],
		properties: {
			ipAddress: {
				dataType: 'string',
				fieldNumber: 1
			},
			port: {
				dataType: 'uint32',
				fieldNumber: 2
			}
		},
  	};

	public validate({ asset }: ValidateAssetContext<register>): void {
		const splitted: string[] = asset.ipAddress.split('.');
		if(splitted.length !== 4) {
			throw new Error('Not a valid IP Address.');
		}
		for (const octet of splitted) {
			if (Number(octet).toString() === 'NaN' || Number(octet).toString(2).length > 8) {
				throw new Error('Not a valid IP Address.');
			}
		}
		if (asset.port > 65535) { //da verificare numero massimo di porta
			throw new Error('Not a valid Port number.');
		}
	}

	// eslint-disable-next-line @typescript-eslint/require-await
  	public async apply({ asset, transaction, stateStore }: ApplyAssetContext<register>): Promise<void> {
		const senderAddress:Buffer = transaction.senderAddress;

		await setNewHost(stateStore, {
			address: senderAddress,
			ipAddress: asset.ipAddress,
			port: asset.port
		});


		const list: host[] = await getAllHosts(stateStore);

		const h_index = await getHostIndex(list, senderAddress)
		
		let begin = h_index - MAX_NEIGHBORS/2;
		let end = h_index + MAX_NEIGHBORS/2

		if( begin < 0) {
			begin = 0
			end = MAX_NEIGHBORS + 1
		}
		if( end >= list.length) {
			begin = list.length - 1 - MAX_NEIGHBORS
			end = list.length - 1
		}

		let my_neighbors: host[] = [...list.slice(begin,h_index), ...list.slice(h_index+1, end+1)];

		let senderAccount = await stateStore.account.get<BitagoraAccountProps>(senderAddress);

		senderAccount.infos.myNeighbors = my_neighbors;

		await stateStore.account.set(senderAddress, senderAccount).catch();
	}
}
