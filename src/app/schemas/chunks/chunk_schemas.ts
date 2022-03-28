export const registeredChunksSchema = {
	$id: 'lisk/chunks/registeredChunks',
	type: "object",
	required: ["chunks"],
	properties: {
        chunks: {
		type: "array",
		fieldNumber: 1,
		items: {
			type: 'object',
			required: ['owner', 'merkleRoot', 'hostedBy', 'allowedViewers'],
			properties: {
				owner: {
					dataType: 'bytes',
					fieldNumber: 1
				},
				merkleRoot: {
					dataType: 'bytes',
					fieldNumber: 2
				},
				hostedBy: {
					type: 'array',
					fieldNumber: 3,
					items: {
						dataType: 'bytes'
					}
				},
				requestedBy: {
					type: 'array',
					fieldNumber: 4,
					items: {
						type: 'object',
						properties: {
							address: {
								dataType: 'bytes',
								fieldNumber: 1
							},
							requestTransaction: {
								dataType: 'bytes',
								fieldNumber: 2
							},
							responseTransaction: {
								dataType: 'bytes',
								fieldNumber: 3
							},
							requestType: {
								dataType: 'string',
								fieldNumber: 4
							},
							status: {
								dataType: 'string',
								fieldNumber: 5
							}
						}
					}
				},
				allowedViewers: {
					type: 'array',
					fieldNumber: 5,
					items: {
						type: 'object',
						properties: {
							address: {
								dataType: 'bytes',
								fieldNumber: 1
							},
							secret: {
								dataType: 'string',
								fieldNumber: 2
							},
						}
					}
				}
			},
		}
	  }
	}
}