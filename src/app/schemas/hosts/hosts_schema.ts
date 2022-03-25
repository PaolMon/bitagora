export const registeredHostsSchema = {
	$id: 'lisk/infos/registeredHosts',
	type: "object",
	required: ["hosts"],
	properties: {
        hosts: {
		type: "array",
		fieldNumber: 1,
		items: {
			type: 'object',
			required: ['address', 'ip_address', 'port'],
			properties: {
				address: {
					dataType: 'bytes',
					fieldNumber: 1
				},
				ip_address:{
					dataType: 'string',
					fieldNumber: 2
				},
				port: {
					dataType: 'uint32',
					fieldNumber: 3
				}
			},
		}
	  }
	}
	
};