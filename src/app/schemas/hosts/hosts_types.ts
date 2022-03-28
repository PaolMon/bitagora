
export type registered_hosts = {
    hosts: host[]
}

export type host = {
    address: Buffer,
    ipAddress: string,
    port: number
}