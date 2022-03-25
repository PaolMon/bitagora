export type digitalAsset = {
	owner:Buffer,
	file_name:string,
	file_size:number,
	file_hash:Buffer,
	merkle_root:Buffer,
	merkle_height:number,
	secret:string,
	transaction_id: Buffer,
	previous_asset_reference: Buffer
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