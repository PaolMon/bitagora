import { BaseAsset, ApplyAssetContext, ValidateAssetContext } from 'lisk-sdk';
import { BitagoraAccountProps } from '../../../schemas/account';
import { viewer, chunk } from '../../../schemas/chunks/chunk_types';
import { digitalAsset, request_status, request_type, response_type } from '../../../schemas/digital_asset/digital_asset_types';
import { getAssetByMerkleRoot } from '../utils/assets';
import { getChunkByMerkleRoot, updateChunk } from '../utils/chunks';

export type response = {
	address: Buffer,
	merkleRoot: Buffer,
	response: string,
	newSecret: string
}

export class ResponseAsset extends BaseAsset {
	public name = 'response';
	public id = 2;

	// Define schema for asset
	public schema = {
		$id: 'digitalAsset/response-asset',
		title: 'ResponseAsset transaction asset for digitalAsset module',
		type: 'object',
		required: ['address','merkleRoot', 'response', 'newSecret'], 
		properties: {
			address:{
				dataType: 'bytes',
				fieldNumber: 1
			},
			merkleRoot:{
				dataType: 'bytes',
				fieldNumber: 2
			},
			response: {
				dataType: 'string',
				fieldNumber: 3
			},
			newSecret: {
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

		const digital_asset: digitalAsset = await getAssetByMerkleRoot(stateStore, asset.merkleRoot);

		if (digital_asset.owner.compare(senderAddress) != 0) {
			throw new Error("You are not allowed to share or transfer this asset");
		}

		let chunk: chunk = await getChunkByMerkleRoot(stateStore, asset.merkleRoot);
		
		const index: number = chunk.requestedBy.findIndex((t) => (t.address.equals(asset.address) && t.status !== request_status.rejected));
		if (index < 0) {
			throw new Error("The address you are trying to send response never asked this asset");
		}
		const senderAccount = await stateStore.account.get<BitagoraAccountProps>(senderAddress);
		const index_r: number = senderAccount.digitalAsset.myFiles.findIndex((t) => t.merkleRoot.equals(asset.merkleRoot));
		if (index_r<0) {
			throw new Error("This file isn't in your file's list")
		}

		const responseToAccount = await stateStore.account.get<BitagoraAccountProps>(asset.address);
		const index_a: number = responseToAccount.digitalAsset.pending.findIndex((t) => t.merkleRoot.equals(asset.merkleRoot));
		if (index_a<0) {
			throw new Error("This address was not expecting responses for this asset")
		}
		
		let req = responseToAccount.digitalAsset.pending.splice(index_a);

		if(asset.response === response_type.ok) {
			chunk.requestedBy[index].status = request_status.accepted;

			if(chunk.requestedBy[index].requestType === request_type.view_only) {
				const new_viewer: viewer = {
					address:asset.address,
					secret: asset.newSecret
				}

				const index_v: number = chunk.allowedViewers.findIndex((t) => t.address.equals(asset.address));
				if (index_v<0) {
					chunk.allowedViewers.push(new_viewer)
				} else {
					chunk.allowedViewers[index_v] = new_viewer
				}

				responseToAccount.digitalAsset.allowed.push({
					fileName: req[0].fileName,
					merkleRoot: asset.merkleRoot,
					secret: asset.newSecret
				})
			} else if(chunk.requestedBy[index].requestType === request_type.ownership){
				chunk.owner = responseToAccount.address;
				senderAccount.digitalAsset.myFiles.splice(index_r);
			}
		} else if(asset.response === response_type.ko) {
			chunk.requestedBy[index].status = request_status.rejected;
		}

		chunk.requestedBy[index].responseTransaction = transaction.id;

		await updateChunk(stateStore, chunk);

		await stateStore.account.set(responseToAccount.address, responseToAccount).catch();
	}
}
