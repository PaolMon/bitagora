import { BaseAsset, ApplyAssetContext, ValidateAssetContext } from 'lisk-sdk';
import { BitagoraAccountProps } from '../../../schemas/account';
import { request_object } from '../../../schemas/chunks/chunk_types';
import { digitalAsset, request_status, request_type } from '../../../schemas/digital_asset/digital_asset_types';
import { getAssetByMerkleRoot } from '../utils/assets';
import { getChunkByMerkleRoot, updateChunk } from '../utils/chunks';

export type request = {
	merkle_root: Buffer,
	mode: string
}

export class RequestAsset extends BaseAsset {
	public name = 'request';
	public id = 1;

	// Define schema for asset
		public schema = {
			$id: 'digitalAsset/request-asset',
			title: 'RequestAsset transaction asset for digitalAsset module',
			type: 'object',
			required: ['merkle_root', 'type_of'],
			properties: {
				merkle_root:{
					dataType: 'bytes',
					fieldNumber: 1
				},
				mode: {
					dataType: 'string',
					fieldNumber: 2
				}
			}
	};

	public validate({ asset }: ValidateAssetContext<request>): void {
		// Validate your asset
		if(asset.mode !== request_type.ownership && asset.mode !== request_type.view_only) {
			throw new Error('Not a valid Request Type.')
		}
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	public async apply({ asset, transaction, stateStore }: ApplyAssetContext<request>): Promise<void> {
		
		const senderAddress = transaction.senderAddress;
		
		let chunk = await getChunkByMerkleRoot(stateStore, asset.merkle_root);

		if (senderAddress.compare(chunk.owner) === 0){
			throw new Error("Requester is already the owner of the Asset");
		}
		
		const index: number = chunk.requested_by.findIndex((t) => (t.address.equals(senderAddress) && t.status !== request_status.rejected));
		if (index >= 0) {
			throw new Error("this address has already requested this asset");
		}

		let senderAccount = await stateStore.account.get<BitagoraAccountProps>(senderAddress);
		const index_a: number = senderAccount.digitalAsset.pending.findIndex((t) => t.merkle_root.equals(asset.merkle_root));
		if (index_a >= 0) {
			throw new Error("this Account has already requested this asset");
		}

		const ro: request_object = {
			address: senderAddress,
			request_transaction: transaction.id,
			response_transaction: Buffer.alloc(0),
			request_type: asset.mode,
			status: request_status.pending
		};
		chunk.requested_by.push(ro);

		const da: digitalAsset = await getAssetByMerkleRoot(stateStore, asset.merkle_root);
		senderAccount.digitalAsset.pending.push({
			file_name: da.file_name,
			merkle_root: asset.merkle_root
		});

		await updateChunk(stateStore, chunk);

		await stateStore.account.set(senderAccount.address, senderAccount).catch();
	}
}
