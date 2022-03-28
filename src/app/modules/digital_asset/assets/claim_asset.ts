import { BaseAsset, ApplyAssetContext, ValidateAssetContext } from 'lisk-sdk';
import { digitalAsset } from '../../../schemas/digital_asset/digital_asset_types';
import { getAssetByMerkleRoot, setNewAsset } from '../utils/assets';
import { chunk } from '../../../schemas/chunks/chunk_types';
import { getChunkByMerkleRoot, setNewChunk } from '../utils/chunks';
import { BitagoraAccountProps } from '../../../schemas/account';


export type claim = {
	oldMerkleRoot: Buffer,
	newMerkleRoot: Buffer,
	newMerkleHeight: number,
	newHosts: Buffer[],
	newSecret: string
}

export class ClaimAsset extends BaseAsset {
	public name = 'claim';
  	public id = 3;

  	// Define schema for asset
	public schema = {
		$id: 'digitalAsset/claim-asset',
		title: 'ClaimAsset transaction asset for digitalAsset module',
		type: 'object',
		required: ['oldMerkleRoot','newMerkleRoot', 'newMerkleHeight', 'newHosts'], 
		properties: {
			oldMerkleRoot:{
				dataType: 'bytes',
				fieldNumber: 1
			},
			newMerkleRoot:{
				dataType: 'bytes',
				fieldNumber: 2
			},
			newMerkleHeight: {
				dataType: 'uint32',
				fieldNumber: 3
			},
			newHosts: {
				type: 'array',
				fieldNumber: 4,
				items: {
					dataType: 'bytes'
				}
			},
			newSecret: {
				dataType: 'string',
				fieldNumber: 5
			}
		},
	};

	public validate({ asset }: ValidateAssetContext<claim>): void {
		// Validate your asset
		if (asset.newMerkleHeight === 0 && asset.newHosts.length < 3) {
			throw new Error("If file has been splitted into chunks, it must be sent to at least 3 hosts");
		}
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	public async apply({ asset, transaction, stateStore }: ApplyAssetContext<claim>): Promise<void> {
		
		const senderAddress: Buffer = transaction.senderAddress;
		const old_chunk: chunk = await getChunkByMerkleRoot(stateStore, asset.oldMerkleRoot);

		if (old_chunk.owner.compare(senderAddress) != 0) {
			throw new Error("You are not allowed to claim this asset");
		}

		const digital_asset: digitalAsset = await getAssetByMerkleRoot(stateStore, asset.oldMerkleRoot);

		digital_asset.owner = senderAddress;
		digital_asset.merkleRoot = asset.newMerkleRoot;
		digital_asset.merkleHeight = asset.newMerkleHeight;
		digital_asset.previousAssetReference = asset.oldMerkleRoot;
		digital_asset.transactionID = transaction.id;
		digital_asset.secret = asset.newSecret;
	
		const chunk: chunk = {
			owner: senderAddress,
			merkleRoot: asset.newMerkleRoot,
			hostedBy: [],
			requestedBy: [],
			allowedViewers: []
		} 
		
		const senderAccount = await stateStore.account.get<BitagoraAccountProps>(senderAddress);
		
		senderAccount.digitalAsset.myFiles.push({fileName: digital_asset.fileName, merkleRoot: digital_asset.merkleRoot, secret: asset.newSecret})

		await setNewChunk(stateStore, chunk);

		await setNewAsset(stateStore, digital_asset);

		await stateStore.account.set(senderAccount.address, senderAccount).catch();

	}
}
