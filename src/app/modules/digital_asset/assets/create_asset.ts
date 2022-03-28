import { BaseAsset, ApplyAssetContext, ValidateAssetContext } from 'lisk-sdk';
import { BitagoraAccountProps } from '../../../schemas/account';
import { chunk } from '../../../schemas/chunks/chunk_types';
import { digitalAsset } from '../../../schemas/digital_asset/digital_asset_types';
import { setNewAsset } from '../utils/assets';
import { checkChunkExistenceByMerkleRoot, setNewChunk } from '../utils/chunks';

export type create = {
	fileName:string,
	fileSize:number,
	fileHash:Buffer,
	merkleRoot:Buffer,
	merkleHeight:number,
	secret:string
}

export type my_file = {
	fileName: string, 
	merkleRoot: Buffer
}

export class CreateAsset extends BaseAsset {
	public name = 'create';
  	public id = 0;

  	// Define schema for asset
	public schema = {
    	$id: 'digitalAsset/create-asset',
		title: 'CreateAsset transaction asset for digitalAsset module',
		type: 'object',
		required: ['fileName', 'fileSize', 'fileHash', 'merkleRoot', 'merkleHeight', 'secret'],
		properties: {
			fileName:{
				dataType: 'string',
				fieldNumber: 1,
				maxLength: 64
			},
			fileSize: {
				dataType: 'uint32',
				fieldNumber: 2
			},
			fileHash: {
				dataType: 'bytes',
				fieldNumber: 3
			},
			merkleRoot: {
				dataType: 'bytes',
				fieldNumber: 4
			},
			merkleHeight: {
				dataType: 'uint32',
				fieldNumber: 5
			},
			secret: {
				dataType: 'string',
				fieldNumber: 6
			},
		},
  	};

	public validate({ asset }: ValidateAssetContext<create>): void {
		if (asset.fileName.length > 40) {
			throw new Error('file name longer than 40 char.')
		}
	}

	// eslint-disable-next-line @typescript-eslint/require-await
  	public async apply({ asset, transaction, stateStore }: ApplyAssetContext<create>): Promise<void> {
	  	const new_digital_asset: digitalAsset = {
			owner: transaction.senderAddress,
			fileName: asset.fileName,
			fileSize: asset.fileSize,
			fileHash: asset.fileHash,
			merkleRoot: asset.merkleRoot,
			merkleHeight: asset.merkleHeight,
			secret: asset.secret,
			transactionID: transaction.id,
			previousAssetReference: Buffer.alloc(0)
		}
		
		const senderAddress = transaction.senderAddress;
		const senderAccount = await stateStore.account.get<BitagoraAccountProps>(senderAddress);
		
		senderAccount.digitalAsset.myFiles.push({fileName: new_digital_asset.fileName, merkleRoot: new_digital_asset.merkleRoot, secret: asset.secret})

		if(await checkChunkExistenceByMerkleRoot(stateStore, asset.merkleRoot)){
			throw new Error('this merkle root already exists in the stateStore')
		}
		
		const chunk: chunk = {
			owner: senderAddress,
			merkleRoot: asset.merkleRoot,
			hostedBy: [],
			requestedBy: [],
			allowedViewers: []
		} 

		await setNewChunk(stateStore, chunk);

		await setNewAsset(stateStore, new_digital_asset);

		await stateStore.account.set(senderAccount.address, senderAccount).catch();
		
	}
}