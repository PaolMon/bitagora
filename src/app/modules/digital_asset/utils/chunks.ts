import {  BaseModuleDataAccess, StateStore } from "lisk-sdk";
import { codec } from "lisk-sdk";
import { registeredChunksSchema } from "../../../schemas/chunks/chunk_schemas";
import { chunk, registered_chunks } from "../../../schemas/chunks/chunk_types";

export const CHAIN_STATE_CHUNKS = "digitalAsset:registeredChunks";

export const setNewChunk= async (stateStore: StateStore, asset: chunk) => {

    const chunks:chunk[] = await getAllChunks(stateStore);

    chunks.push(asset);

    const registeredChunks: registered_chunks = {chunks: chunks.sort((a, b) => a.merkleRoot.compare(b.merkleRoot))};

    await stateStore.chain.set(
        CHAIN_STATE_CHUNKS,
        codec.encode(registeredChunksSchema, registeredChunks)
    );
}

export const updateChunk =async (stateStore:StateStore, asset:chunk) => {
    const chunks:chunk[] = await getAllChunks(stateStore);

    const c_index: number = chunks.findIndex((t) => t.merkleRoot.equals(asset.merkleRoot));
    
    if (c_index < 0) {
        throw new Error("Asset not found");
    }

    chunks[c_index] = asset;

    const registeredChunks: registered_chunks = {chunks: chunks}

    await stateStore.chain.set(
        CHAIN_STATE_CHUNKS,
        codec.encode(registeredChunksSchema, registeredChunks)
    );
}

export const getChunkByMerkleRoot = async (stateStore: StateStore, merkleRoot: Buffer) => {
    const chunks:chunk[] = await getAllChunks(stateStore);

    const c_index: number = chunks.findIndex((t) => t.merkleRoot.equals(merkleRoot));

    if (c_index < 0) {
        throw new Error("Asset not found");
    }

    return chunks[c_index];    
}

export const checkChunkExistenceByMerkleRoot = async (stateStore: StateStore, merkleRoot: Buffer): Promise<boolean> => {
    const chunks:chunk[] = await getAllChunks(stateStore);

    const c_index: number = chunks.findIndex((t) => t.merkleRoot.equals(merkleRoot));

    if (c_index < 0) {
        return false;
    }

    return true;    
}

export const getAllChunks = async (stateStore: StateStore) => {
    const registeredChunksBuffer = await stateStore.chain.get(
        CHAIN_STATE_CHUNKS
    );

    if (!registeredChunksBuffer) {
        return [];
    }

    const registeredChunks = codec.decode<registered_chunks>(
        registeredChunksSchema,
        registeredChunksBuffer
    );

    return registeredChunks.chunks;
}

export const _getAllJSONChunks =async (dataAccess: BaseModuleDataAccess) => {
    const registeredChunksBuffer = await dataAccess.getChainState(
        CHAIN_STATE_CHUNKS
    );
    
    if (!registeredChunksBuffer) {
        return [];
    }
    
    const registeredChunks = codec.decode<registered_chunks>(
        registeredChunksSchema,
        registeredChunksBuffer
    );
    
      return codec.toJSON(registeredChunksSchema, registeredChunks);
}

