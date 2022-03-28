export type digitalAsset = {
	owner:Buffer,
	fileName:string,
	fileSize:number,
	fileHash:Buffer,
	merkleRoot:Buffer,
	merkleHeight:number,
	secret:string,
	transactionID: Buffer,
	previousAssetReference: Buffer
}

export type registeredAssets = {
	registeredAssets: digitalAsset[]
}

export enum request_type {
	view_only = "VIEW",
	ownership = "OWN"
}

export enum request_status {
	pending = "PENDING",
	accepted = "ACCEPTED",
	rejected = "REJECTED"
}

export enum response_type {
	ok = "OK",
	ko = "KO"
}