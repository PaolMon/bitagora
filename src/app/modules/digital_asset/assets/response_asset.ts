import { BaseAsset, ApplyAssetContext, ValidateAssetContext } from 'lisk-sdk';
import { BitagoraAccountProps } from '../../../schemas/account';
import { viewer, chunk } from '../../../schemas/chunks/chunk_types';
import { digitalAsset, request_status, request_type, response_type } from '../../../schemas/digital_asset/digital_asset_types';
import { getAssetByMerkleRoot } from '../utils/assets';
import { getChunkByMerkleRoot, updateChunk } from '../utils/chunks';

export type response = {
	address: Buffer,
	merkle_root: Buffer,
	response: string,
	new_secret: string
}

export class ResponseAsset extends BaseAsset {
	public name = 'response';
	public id = 2;

	// Define schema for asset
	public schema = {
		$id: 'digitalAsset/response-asset',
		title: 'ResponseAsset transaction asset for digitalAsset module',
		type: 'object',
		required: ['address','merkle_root', 'response', 'new_secret'], 
		properties: {
			address:{
				dataType: 'bytes',
				fieldNumber: 1
			},
			merkle_root:{
				dataType: 'bytes',
				fieldNumber: 2
			},
			response: {
				dataType: 'string',
				fieldNumber: 3
			},
			new_secret: {
				dataType: 'string',
				fieldNumber: 4
			}
		}
	};

	public validate({ asset }: ValidateAssetContext<response>): void {
		// Validate your asset
		if(asset.response !== response_type.ok && asset.response !== response_type.ko) {
			throw new Error('Not a valid Response Type.')
		}
	}

		// eslint-disable-next-line @typescript-eslint/require-await
	public async apply({ asset, transaction, stateStore }: ApplyAssetContext<response>): Promise<void> {

		const senderAddress: Buffer = transaction.senderAddress;

		const digital_asset: digitalAsset = await getAssetByMerkleRoot(stateStore, asset.merkle_root);

		if (digital_asset.owner.compare(senderAddress) != 0) {
			throw new Error("You are not allowed to share or transfer this asset");
		}

		let chunk: chunk = await getChunkByMerkleRoot(stateStore, asset.merkle_root);
		
		const index: number = chunk.requested_by.findIndex((t) => (t.address.equals(asset.address) && t.status !== request_status.rejected));
		if (index < 0) {
			throw new Error("The address you are trying to send response never asked this asset");
		}
		const senderAccount = await stateStore.account.get<BitagoraAccountProps>(senderAddress);
		const index_r: number = senderAccount.digitalAsset.my_files.findIndex((t) => t.merkle_root.equals(asset.merkle_root));
		if (index_r<0) {
			throw new Error("This file isn't in your file's list")
		}

		const responseToAccount = await stateStore.account.get<BitagoraAccountProps>(asset.address);
		const index_a: number = responseToAccount.digitalAsset.pending.findIndex((t) => t.merkle_root.equals(asset.merkle_root));
		if (index_a<0) {
			throw new Error("This address was not expecting responses for this asset")
		}
		
		let req = responseToAccount.digitalAsset.pending.splice(index_a);

		if(asset.response === response_type.ok) {
			chunk.requested_by[index].status = request_status.accepted;

			if(chunk.requested_by[index].request_type === request_type.view_only) {
				const new_viewer: viewer = {
					address:asset.address,
					secret: asset.new_secret
				}

				const index_v: number = chunk.allowed_viewers.findIndex((t) => t.address.equals(asset.address));
				if (index_v<0) {
					chunk.allowed_viewers.push(new_viewer)
				} else {
					chunk.allowed_viewers[index_v] = new_viewer
				}

				responseToAccount.digitalAsset.allowed.push({
					file_name: req[0].file_name,
					merkle_root: asset.merkle_root,
					secret: asset.new_secret
				})
			} else if(chunk.requested_by[index].request_type === request_type.ownership){
				chunk.owner = responseToAccount.address;
				senderAccount.digitalAsset.my_files.splice(index_r);
			}
		} else if(asset.response === response_type.ko) {
			chunk.requested_by[index].status = request_status.rejected;
		}

		chunk.requested_by[index].response_transaction = transaction.id;

		await updateChunk(stateStore, chunk);

		await stateStore.account.set(responseToAccount.address, responseToAccount).catch();
	}
}
