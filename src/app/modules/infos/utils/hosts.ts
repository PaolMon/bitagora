import {  codec, StateStore } from "lisk-sdk";
import { registeredHostsSchema } from "../../../schemas/hosts/hosts_schema";
import { host, registered_hosts } from "../../../schemas/hosts/hosts_types";

export const CHAIN_STATE_HOSTS_ADDR = "infos:registeredHosts";

export const getHostIndex =async (list:host[], address: Buffer): Promise<number> => {

    const index: number = list.findIndex((t) => t.address.equals(address));

    if (index < 0) {
        throw new Error("Host not found");
    }

    return index;
}

export const setNewHost= async (stateStore: StateStore, host: host) => {

    const list:host[] = await getAllHosts(stateStore);

    list.push(host);

    const registeredHosts: registered_hosts = {hosts: list.sort((a, b) => a.address.compare(b.address))};

    await stateStore.chain.set(
        CHAIN_STATE_HOSTS_ADDR,
        codec.encode(registeredHostsSchema, registeredHosts)
    );
}

export const getAllHosts = async (stateStore: StateStore) => {
    const registeredHostsBuffer = await stateStore.chain.get(
        CHAIN_STATE_HOSTS_ADDR
    );

    if (!registeredHostsBuffer) {
        return [];
    }

    const registeredHosts = codec.decode<registered_hosts>(
        registeredHostsSchema,
        registeredHostsBuffer
    );

    return registeredHosts.hosts;
}