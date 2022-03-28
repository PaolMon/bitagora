export interface BitagoraAccountProps {
    infos: {
        myNeighbors: {
            address: Buffer,
            ipAddress: string,
            port: number
        }[],
        hostedFiles: {
            owner: Buffer,
            merkleRoot: Buffer
        }[],
    },
    digitalAsset: {
        pending: {
            fileName: string,
            merkleRoot: Buffer
        }[],
        allowed: {
            fileName: string,
            merkleRoot: Buffer,
            secret: string
        }[],
        myFiles: {
            fileName: string,
            merkleRoot: Buffer,
            secret:string
        }[],
    }
}

export const infosSchema = {
    type: 'object',
    properties: {
        myNeighbors: {
            fieldNumber: 1,
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    address: {
                        dataType:'bytes',
                        fieldNumber: 1
                    },
                    ipAddress: {
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
        hostedFiles: {
            fieldNumber: 2,
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    owner: {
                        dataType:'bytes',
                        fieldNumber: 1
                    },
                    merkleRoot: {
                        dataType:'bytes',
                        fieldNumber: 2
                    }
                }
            }
        }
    },
    default: {
        myNeighbors: [],
        hostedFiles: []
    }
}

export const digitalAssetAccountSchema = {
    type: 'object',
    properties: {
        myFiles: {
            fieldNumber: 1,
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    merkleRoot: {
                        dataType:'bytes',
                        fieldNumber: 1
                    },
                    fileName: {
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
            fieldNumber: 2,
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    merkleRoot: {
                        dataType:'bytes',
                        fieldNumber: 1
                    },
                    fileName: {
                        dataType:'string',
                        fieldNumber: 2
                    }
                }
            }
        },
        allowed: {
            fieldNumber: 3,
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    merkleRoot: {
                        dataType:'bytes',
                        fieldNumber: 1
                    },
                    fileName: {
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
        myFiles: [],
        pending: [],
        allowed: []
    }
}
