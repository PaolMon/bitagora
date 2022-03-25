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
			required: ['owner', 'merkle_root', 'hosted_by', 'allowed_viewers'],
			properties: {
				owner: {
					dataType: 'bytes',
					fieldNumber: 1
				},
				merkle_root: {
					dataType: 'bytes',
					fieldNumber: 2
				},
				hosted_by: {
					type: 'array',
					fieldNumber: 3,
					items: {
						dataType: 'bytes'
					}
				},
				requested_by: {
					type: 'array',
					fieldNumber: 4,
					items: {
						type: 'object',
						properties: {
							address: {
								dataType: 'bytes',
								fieldNumber: 1
							},
							request_transaction: {
								dataType: 'bytes',
								fieldNumber: 2
							},
							response_transaction: {
								dataType: 'bytes',
								fieldNumber: 3
							},
							request_type: {
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
				allowed_viewers: {
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