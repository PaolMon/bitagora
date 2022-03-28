import { ApplyAssetContext, codec, StateStore, testing } from 'lisk-sdk';
import { Account } from '@liskhq/lisk-chain';
import { register, RegisterAsset } from '../../../../../src/app/modules/infos/assets/register_asset';
import { InfosModule } from '../../../../../src/app/modules/infos/infos_module';
import { BitagoraAccountProps } from '../../../../../src/app/schemas/account';
import { registered_hosts } from '../../../../../src/app/schemas/hosts/hosts_types';
import { CHAIN_STATE_HOSTS_ADDR } from '../../../../../src/app/modules/infos/utils/hosts';
import { registeredHostsSchema } from '../../../../../src/app/schemas/hosts/hosts_schema';

describe('RegisterAsset', () => {
  let transactionAsset: RegisterAsset;

	beforeEach(() => {
		transactionAsset = new RegisterAsset();
	});

	describe('constructor', () => {
		it('should have valid id', () => {
			expect(transactionAsset.id).toEqual(0);
		});

		it('should have valid name', () => {
			expect(transactionAsset.name).toEqual('register');
		});

		it('should have valid schema', () => {
			expect(transactionAsset.schema).toMatchSnapshot();
		});
	});

	describe('validate', () => {
		describe('schema validation', () => {
			it.todo('should throw errors for invalid schema');
			it.todo('should be ok for valid schema');
		});
	});

	describe('apply', () => {
		let stateStore: StateStore;
		let account: Account<BitagoraAccountProps>;
		let context: ApplyAssetContext<register>;
		let test_registered_hosts: registered_hosts;
		
		beforeEach(() => {
			account = testing.fixtures.createDefaultAccount<BitagoraAccountProps>([InfosModule]);
			
			test_registered_hosts = {
				hosts: [
					{
						address: Buffer.alloc(9,'address_1'),
						ipAddress: '192.168.1.10',
						port: 9999
					},
					{
						address: Buffer.alloc(9,'address_2'),
						ipAddress: '192.168.1.20',
						port: 8888
					},
					{
						address: Buffer.alloc(9,'address_3'),
						ipAddress: '192.168.1.30',
						port: 7777
					},
					{
						address: Buffer.alloc(9,'address_4'),
						ipAddress: '192.168.1.40',
						port: 6666
					},
					// {
					// 	address: Buffer.alloc(9,'address_5'),
					// 	ipAddress: '192.168.1.50',
					// 	port: 5555
					// }
				]
			}
			stateStore = new testing.mocks.StateStoreMock({
				accounts: [account],
				chain: {
					"infos:registeredHosts": codec.encode(registeredHostsSchema, test_registered_hosts),
				}
			});
			
			const register_object: register = {
				ipAddress: '127.0.0.1',
				port: 10000
			}
	
			context = testing.createApplyAssetContext<register>({
				stateStore,
				asset: register_object,
				transaction: { senderAddress: account.address, nonce: BigInt(1) } as any,
			});
	
			jest.spyOn(stateStore.chain, 'get');
			jest.spyOn(stateStore.chain, 'set');
		});
		describe('valid cases', () => {
			it('should update state store',async () => {
				await transactionAsset.apply(context);
				let list = test_registered_hosts.hosts;
				list.push({
					address: context.transaction.senderAddress,
					ipAddress: '127.0.0.1',
					port: 10000
				});
				const registeredHosts: registered_hosts = {hosts: list.sort((a, b) => a.address.compare(b.address))};
				expect(stateStore.chain.set).toHaveBeenCalledWith(
					CHAIN_STATE_HOSTS_ADDR, 
					codec.encode(registeredHostsSchema, registeredHosts)
				)
			});
			it('should update account infos',async () => {
				await transactionAsset.apply(context);
				const senderAccount = await stateStore.account.get<BitagoraAccountProps>(context.transaction.senderAddress)
				expect(senderAccount.infos.myNeighbors).toEqual(test_registered_hosts.hosts)
			});
		});

		describe('invalid cases', () => {
			it.todo('should throw error');
		});
	});
});
