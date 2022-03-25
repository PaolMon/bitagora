import { BaseAsset, ApplyAssetContext, ValidateAssetContext } from 'lisk-sdk';
import { BitagoraAccountProps } from '../../../schemas/account';
import { chunk } from '../../../schemas/chunks/chunk_types';
import { digitalAsset } from '../../../schemas/digital_asset/digital_asset_types';
import { setNewAsset } from '../utils/assets';
import { checkChunkExistenceByMerkleRoot, setNewChunk } from '../utils/chunks';

export type create = {
	file_name:string,
	file_size:number,
	file_hash:Buffer,
	merkle_root:Buffer,
	merkle_height:number,
	secret:string
}

export type my_file = {
	file_name: string, 
	merkle_root: Buffer
}

export class CreateAsset extends BaseAsset {
	public name = 'create';
  	public id = 0;

  	// Define schema for asset
	public schema = {
    $id: 'digitalAsset/create-asset',
		title: 'CreateAsset transaction asset for digitalAsset module',
		type: 'object',
		required: ['file_name', 'file_size', 'file_hash', 'merkle_root', 'merkle_height', 'secret'],
		properties: {
			file_name:{
				dataType: 'string',
				fieldNumber: 1,
				maxLength: 64
			},
			file_size: {
				dataType: 'uint32',
				fieldNumber: 2
			},
			file_hash: {
				dataType: 'string',
				fieldNumber: 3
			},
			merkle_root: {
				dataType: 'string',
				fieldNumber: 4
			},
			merkle_height: {
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
		if (asset.file_name.length > 40) {
			throw new Error('file name longer than 40 char.')
		}
	}

	// eslint-disable-next-line @typescript-eslint/require-await
  	public async apply({ asset, transaction, stateStore }: ApplyAssetContext<create>): Promise<void> {
	  	const new_digital_asset: digitalAsset = {
			owner: transaction.senderAddress,
			file_name: asset.file_name,
			file_size: asset.file_size,
			file_hash: asset.file_hash,
			merkle_root: asset.merkle_root,
			merkle_height: asset.merkle_height,
			secret: asset.secret,
			transaction_id: transaction.id,
			previous_asset_reference: Buffer.alloc(0)
		}
		
		const senderAddress = transaction.senderAddress;
		const senderAccount = await stateStore.account.get<BitagoraAccountProps>(senderAddress);
		
		senderAccount.digitalAsset.my_files.push({file_name: new_digital_asset.file_name, merkle_root: new_digital_asset.merkle_root, secret: asset.secret})

		if(await checkChunkExistenceByMerkleRoot(stateStore, asset.merkle_root)){
			throw new Error('this merkle root already exists in the stateStore')
		}
		
		const chunk: chunk = {
			owner: senderAddress,
			merkle_root: asset.merkle_root,
			hosted_by: [],
			requested_by: [],
			allowed_viewers: []
		} 

		await setNewChunk(stateStore, chunk);

		await setNewAsset(stateStore, new_digital_asset);

		await stateStore.account.set(senderAccount.address, senderAccount).catch();
		
	}
}