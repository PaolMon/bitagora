// export const digitalAssetSchema = {
// 	$id: 'lisk/digital_asset/digitalAsset',
// 	type: 'object',
// 	required: ['owner', 'file_name', 'file_size', 'file_hash', 'merkle_root', 'merkle_height', 'secret', 'transaction_id', 'previous_asset_reference', 'requested_by'],
// 	properties: {
// 		owner: {
// 			dataType: 'bytes',
// 			fieldNumber: 1
// 		},
// 		file_name:{
// 			dataType: 'string',
// 			fieldNumber: 2
// 		},
// 		file_size: {
// 			dataType: 'uint32',
// 			fieldNumber: 3
// 		},
// 		file_hash: {
// 			dataType: 'bytes',
// 			fieldNumber: 4
// 		},
// 		merkle_root: {
// 			dataType: 'bytes',
// 			fieldNumber: 5
// 		},
// 		merkle_height: {
// 			dataType: 'uint32',
// 			fieldNumber: 6
// 		},
// 		secret: {
// 			dataType: 'string',
// 			fieldNumber: 7
// 		},
// 		transaction_id: {
// 			dataType: 'bytes',
// 			fieldNumber: 8
// 		},
// 		previous_asset_reference: {
// 			dataType: 'bytes',
// 			fieldNumber: 9
// 		}
// 	}
// };

export const registeredAssetsSchema = {
	$id: 'lisk/digital_asset/registeredAssets',
	type: "object",
	required: ["registeredAssets"],
	properties: {
	  registeredAssets: {
		type: "array",
		fieldNumber: 1,
		items: {
			type: 'object',
			required: ['owner', 'file_name', 'file_size', 'file_hash', 'merkle_root', 'merkle_height', 'secret', 'transaction_id', 'previous_asset_reference'],
			properties: {
				owner: {
					dataType: 'bytes',
					fieldNumber: 1
				},
				file_name:{
					dataType: 'string',
					fieldNumber: 2
				},
				file_size: {
					dataType: 'uint32',
					fieldNumber: 3
				},
				file_hash: {
					dataType: 'bytes',
					fieldNumber: 4
				},
				merkle_root: {
					dataType: 'bytes',
					fieldNumber: 5
				},
				merkle_height: {
					dataType: 'uint32',
					fieldNumber: 6
				},
				secret: {
					dataType: 'string',
					fieldNumber: 7
				},
				transaction_id: {
					dataType: 'bytes',
					fieldNumber: 8
				},
				previous_asset_reference: {
					dataType: 'bytes',
					fieldNumber: 9
				}
			},
		}
	  }
	}
	
};
