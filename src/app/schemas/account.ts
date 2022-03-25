export interface BitagoraAccountProps {
    infos: {
        my_neighbors: {
            address: Buffer,
            ip_address: string,
            port: number
        }[],
        hosted_files: {
            owner: Buffer,
            merkle_root: Buffer
        }[],
    },
    digitalAsset: {
        pending: {
            file_name: string,
            merkle_root: Buffer
        }[],
        allowed: {
            file_name: string,
            merkle_root: Buffer,
            secret: string
        }[],
        my_files: {
            file_name: string,
            merkle_root: Buffer,
            secret:string
        }[],
    }
}

export const infosSchema = {
    type: 'object',
    properties: {
        my_neighbors: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    address: {
                        dataType:'bytes',
                        fieldNumber: 1
                    },
                    ip_address: {
                        dataType:'string',
                        fieldNumber: 2
                    },
                    port: {
                        dataType:'uint32',
                        fieldNumber: 3
                    }
                }
            }
        },
        hosted_files: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    owner: {
                        dataType:'bytes',
                        fieldNumber: 1
                    },
                    merkle_root: {
                        dataType:'bytes',
                        fieldNumber: 2
                    }
                }
            }
        }
    },
    default: {
        my_neighbors: [],
        hosted_files: []
    }
}

export const digitalAssetAccountSchema = {
    type: 'object',
    properties: {
        my_files: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    merkle_root: {
                        dataType:'bytes',
                        fieldNumber: 1
                    },
                    file_name: {
                        dataType:'string',
                        fieldNumber: 2
                    },
                    secret: {
                        dataType:'string',
                        fieldNumber: 3
                    }
                }
            }
        },
        pending: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    merkle_root: {
                        dataType:'bytes',
                        fieldNumber: 1
                    },
                    file_name: {
                        dataType:'string',
                        fieldNumber: 2
                    }
                }
            }
        },
        allowed: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    merkle_root: {
                        dataType:'bytes',
                        fieldNumber: 1
                    },
                    file_name: {
                        dataType:'string',
                        fieldNumber: 2
                    },
                    secret: {
                        dataType:'string',
                        fieldNumber: 3
                    }
                }
            }
        }
    },
    default: {
        my_files: [],
        pending: [],
        allowed: []
    }
}
