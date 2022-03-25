
export type registered_hosts = {
    hosts: host[]
}

export type host = {
    address: Buffer,
    ip_address: string,
    port: number
}