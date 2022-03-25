import { BaseAsset, ApplyAssetContext, ValidateAssetContext } from 'lisk-sdk';
import { digitalAsset } from '../../../schemas/digital_asset/digital_asset_types';
import { getAssetByMerkleRoot, setNewAsset } from '../utils/assets';
import { chunk } from '../../../schemas/chunks/chunk_types';
import { getChunkByMerkleRoot, setNewChunk } from '../utils/chunks';
import { BitagoraAccountProps } from '../../../schemas/account';


export type claim = {
	old_merkle_root: Buffer,
	new_merkle_root: Buffer,
	new_merkle_height: number,
	new_hosts: Buffer[],
	new_secret: string
}

export class ClaimAsset extends BaseAsset {
	public name = 'claim';
  	public id = 3;

  	// Define schema for asset
	public schema = {
		$id: 'digitalAsset/claim-asset',
		title: 'ClaimAsset transaction asset for digitalAsset module',
		type: 'object',
		required: ['old_merkle_root','new_merkle_root', 'new_merkle_height', 'new_hosts'], 
		properties: {
			old_merkle_root:{
				dataType: 'bytes',
				fieldNumber: 1
			},
			new_merkle_root:{
				dataType: 'bytes',
				fieldNumber: 2
			},
			new_merkle_height: {
				dataType: 'uint32',
				fieldNumber: 3
			},
			new_hosts: {
				type: 'array',
				fieldNumber: 4,
				items: {
					dataType: 'bytes'
				}
			},
			new_secret: {
				dataType: 'string',
				fieldNumber: 5
			}
		},
	};

	public validate({ asset }: ValidateAssetContext<claim>): void {
		// Validate your asset
		if (asset.new_merkle_height === 0 && asset.new_hosts.length < 3) {
			throw new Error("If file has been splitted into chunks, it must be sent to at least 3 hosts");
		}
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	public async apply({ asset, transaction, stateStore }: ApplyAssetContext<claim>): Promise<void> {
		
		const senderAddress: Buffer = transaction.senderAddress;
		const old_chunk: chunk = await getChunkByMerkleRoot(stateStore, asset.old_merkle_root);

		if (old_chunk.owner.compare(senderAddress) != 0) {
			throw new Error("You are not allowed to claim this asset");
		}

		const digital_asset: digitalAsset = await getAssetByMerkleRoot(stateStore, asset.old_merkle_root);

		digital_asset.owner = senderAddress;
		digital_asset.merkle_root = asset.new_merkle_root;
		digital_asset.merkle_height = asset.new_merkle_height;
		digital_asset.previous_asset_reference = asset.old_merkle_root;
		digital_asset.transaction_id = transaction.id;
		digital_asset.secret = asset.new_secret;
	
		const chunk: chunk = {
			owner: senderAddress,
			merkle_root: asset.new_merkle_root,
			hosted_by: [],
			requested_by: [],
			allowed_viewers: []
		} 
		
		const senderAccount = await stateStore.account.get<BitagoraAccountProps>(senderAddress);
		
		senderAccount.digitalAsset.my_files.push({file_name: digital_asset.file_name, merkle_root: digital_asset.merkle_root, secret: asset.new_secret})

		await setNewChunk(stateStore, chunk);

		await setNewAsset(stateStore, digital_asset);

		await stateStore.account.set(senderAccount.address, senderAccount).catch();

	}
}
