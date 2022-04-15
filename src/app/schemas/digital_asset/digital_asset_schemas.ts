export const digitalAssetSchema = {
	$id: 'lisk/digital_asset/digitalAsset',
	type: 'object',
	required: ['owner', 'fileName', 'fileSize', 'fileHash', 'merkleRoot', 'merkleHeight', 'secret', 'transactionID', 'previousAssetReference'],
	properties: {
		owner: {
			dataType: 'bytes',
			fieldNumber: 1
		},
		fileName:{
			dataType: 'string',
			fieldNumber: 2
		},
		fileSize: {
			dataType: 'uint32',
			fieldNumber: 3
		},
		fileHash: {
			dataType: 'bytes',
			fieldNumber: 4
		},
		merkleRoot: {
			dataType: 'bytes',
			fieldNumber: 5
		},
		merkleHeight: {
			dataType: 'uint32',
			fieldNumber: 6
		},
		secret: {
			dataType: 'string',
			fieldNumber: 7
		},
		transactionID: {
			dataType: 'bytes',
			fieldNumber: 8
		},
		previousAssetReference: {
			dataType: 'bytes',
			fieldNumber: 9
		}
	},
};

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
			required: ['owner', 'fileName', 'fileSize', 'fileHash', 'merkleRoot', 'merkleHeight', 'secret', 'transactionID', 'previousAssetReference'],
			properties: {
				owner: {
					dataType: 'bytes',
					fieldNumber: 1
				},
				fileName:{
					dataType: 'string',
					fieldNumber: 2
				},
				fileSize: {
					dataType: 'uint32',
					fieldNumber: 3
				},
				fileHash: {
					dataType: 'bytes',
					fieldNumber: 4
				},
				merkleRoot: {
					dataType: 'bytes',
					fieldNumber: 5
				},
				merkleHeight: {
					dataType: 'uint32',
					fieldNumber: 6
				},
				secret: {
					dataType: 'string',
					fieldNumber: 7
				},
				transactionID: {
					dataType: 'bytes',
					fieldNumber: 8
				},
				previousAssetReference: {
					dataType: 'bytes',
					fieldNumber: 9
				}
			},
		}
	  }
	}
	
};
