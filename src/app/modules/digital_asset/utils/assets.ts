import { BaseModuleDataAccess, StateStore } from "lisk-sdk";
import { codec } from "lisk-sdk";
import { digitalAsset, registeredAssets } from "../../../schemas/digital_asset/digital_asset_types";
import { registeredAssetsSchema } from "../../../schemas/digital_asset/digital_asset_schemas";

export const CHAIN_STATE_DIGITAL_ASSETS = "digitalAsset:registeredAssets";


export const setNewAsset= async (stateStore: StateStore, asset: digitalAsset) => {

    const DAs:digitalAsset[] = await getAllAssets(stateStore);

    DAs.push(asset);

    const registeredAssets: registeredAssets = {registeredAssets: DAs.sort((a, b) => a.merkleRoot.compare(b.merkleRoot))};

    await stateStore.chain.set(
        CHAIN_STATE_DIGITAL_ASSETS,
        codec.encode(registeredAssetsSchema, registeredAssets)
    );
}

export const getAllAssets = async (stateStore: StateStore) => {
    const registeredAssetsBuffer = await stateStore.chain.get(
        CHAIN_STATE_DIGITAL_ASSETS
    );

    if (!registeredAssetsBuffer) {
        return [];
    }

    const registeredAssets = codec.decode<registeredAssets>(
        registeredAssetsSchema,
        registeredAssetsBuffer
    );

    return registeredAssets.registeredAssets;
}

export const getAssetByMerkleRoot = async (stateStore: StateStore, merkleRoot: Buffer) => {
    const DAs:digitalAsset[] = await getAllAssets(stateStore);

    const DA_index: number = DAs.findIndex((t) => t.merkleRoot.equals(merkleRoot));

    if (DA_index < 0) {
        throw new Error("Asset not found");
    }

    return DAs[DA_index];
}

/*
    THE FOLLOWING FUNCTIONS USE DATA ACCESS INSTEAD OF STATE STORE TO READ DATA
*/


export const _getAssetByMerkleRoot = async (dataAccess: BaseModuleDataAccess, merkleRoot: Buffer): Promise<digitalAsset> => {
    const registeredAssetsBuffer = await dataAccess.getChainState(
        CHAIN_STATE_DIGITAL_ASSETS
    );
    
    if (!registeredAssetsBuffer) {
        throw new Error('No Assets Found in stateStore');
    }
    
    const registeredAssets = codec.decode<registeredAssets>(
        registeredAssetsSchema,
        registeredAssetsBuffer
    );
    const DAs = registeredAssets.registeredAssets;

    const DA_index: number = DAs.findIndex((t) => t.merkleRoot.equals(merkleRoot));

    if (DA_index < 0) {
        throw new Error("Asset not found");
    }

    return DAs[DA_index];
}

export const _getAllJSONAssets =async (dataAccess: BaseModuleDataAccess) => {
    const registeredAssetsBuffer = await dataAccess.getChainState(
        CHAIN_STATE_DIGITAL_ASSETS
    );
    
    if (!registeredAssetsBuffer) {
        return [];
    }
    
    const registeredAssets = codec.decode<registeredAssets>(
        registeredAssetsSchema,
        registeredAssetsBuffer
    );
    
      return codec.toJSON(registeredAssetsSchema, registeredAssets);
}

export const _getAssetHistoryByMerkleRoot = async (dataAccess: BaseModuleDataAccess, merkleRoot: Buffer) => {

    const registeredAssetsBuffer = await dataAccess.getChainState(
        CHAIN_STATE_DIGITAL_ASSETS
    );
    
    if (!registeredAssetsBuffer) {
        return [];
    }
    
    const registeredAssets = codec.decode<registeredAssets>(
        registeredAssetsSchema,
        registeredAssetsBuffer
    );
    const DAs = registeredAssets.registeredAssets;

    let related_assets: digitalAsset[] = []
    let index = -1;
    let asset: digitalAsset;

    while(!merkleRoot.equals(Buffer.alloc(0))) {
        
        index = DAs.findIndex((t) => t.merkleRoot.equals(merkleRoot));

        if (index < 0) {
            throw new Error("Asset not found");
        }

        asset = DAs[index];
        related_assets.push(asset);

        merkleRoot = asset.previousAssetReference;
    }

    return codec.toJSON(registeredAssetsSchema, {registeredAssets: related_assets});
    //return related_assets;
}