export type registered_chunks = {
    chunks: chunk[]
}

export type chunk = {
    merkleRoot: Buffer,
    owner: Buffer,
    hostedBy: Buffer[],
	requestedBy: request_object[],
    allowedViewers: viewer[],
}

export type viewer = {
	address: Buffer,
	secret: string
}


export type request_object = {
	address: Buffer,
    requestTransaction: Buffer,
    responseTransaction: Buffer,
	requestType: string,
	status: string
}