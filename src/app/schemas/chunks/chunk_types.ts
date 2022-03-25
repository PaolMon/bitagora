export type registered_chunks = {
    chunks: chunk[]
}

export type chunk = {
    merkle_root: Buffer,
    owner: Buffer,
    hosted_by: Buffer[],
	requested_by: request_object[],
    allowed_viewers: viewer[],
}

export type viewer = {
	address: Buffer,
	secret: string
}


export type request_object = {
	address: Buffer,
    request_transaction: Buffer,
    response_transaction: Buffer,
	request_type: string,
	status: string
}