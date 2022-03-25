import { response, ResponseAsset } from '../../../../../src/app/modules/digital_asset/assets/response_asset';
import { Account } from '@liskhq/lisk-chain';
import { ApplyAssetContext, codec, ReducerHandler, StateStore, testing } from 'lisk-sdk';
import { DigitalAssetModule } from '../../../../../src/app/modules/digital_asset/digital_asset_module';
import { BitagoraAccountProps } from '../../../../../src/app/schemas/account';
import { registeredAssets, request_status, request_type, response_type } from '../../../../../src/app/schemas/digital_asset/digital_asset_types';
import { registeredAssetsSchema } from '../../../../../src/app/schemas/digital_asset/digital_asset_schemas';
import { registered_chunks } from '../../../../../src/app/schemas/chunks/chunk_types';
import { registeredChunksSchema } from '../../../../../src/app/schemas/chunks/chunk_schemas';
import { CHAIN_STATE_CHUNKS } from '../../../../../src/app/modules/digital_asset/utils/chunks';

describe('ResponseAsset', () => {
  let transactionAsset: ResponseAsset;

	beforeEach(() => {
		transactionAsset = new ResponseAsset();
	});

	describe('constructor', () => {
		it('should have valid id', () => {
			expect(transactionAsset.id).toEqual(2);
		});

		it('should have valid name', () => {
			expect(transactionAsset.name).toEqual('response');
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
		let reducerHandler: ReducerHandler;
		let ownerAccount: Account<BitagoraAccountProps>;
		let responseToAccount: Account<BitagoraAccountProps>;
		let context: ApplyAssetContext<response>;
		let test_registered_assets: registeredAssets;
		let test_registered_chunks: registered_chunks;

		beforeEach(() => {
			ownerAccount = testing.fixtures.createDefaultAccount<BitagoraAccountProps>([DigitalAssetModule]);
			ownerAccount.digitalAsset.my_files = [
				{
					file_name: 'prova_1',
					merkle_root: Buffer.alloc(7, 'prova_1'),
					secret: 'secret'
				},
				{
					file_name: 'prova_2',
					merkle_root: Buffer.alloc(7, 'prova_2'),
					secret: 'secret'
				},
				{
					file_name: 'prova_4',
					merkle_root: Buffer.alloc(7, 'prova_4'),
					secret: 'secret'
				}
			]

			
			responseToAccount = testing.fixtures.createDefaultAccount<BitagoraAccountProps>([DigitalAssetModule]);
			responseToAccount.digitalAsset.pending = [
				{
					file_name: 'prova_1',
					merkle_root: Buffer.alloc(7, 'prova_1'),
				},
				{
					file_name: 'prova_2',
					merkle_root: Buffer.alloc(7, 'prova_2'),
				}
			]
			
			test_registered_assets = 
			{
				registeredAssets: [
					{
						owner: ownerAccount.address,
						file_name: 'prova_1',
						file_size: 1,
						file_hash: Buffer.alloc(7, 'prova_1'),
						merkle_root: Buffer.alloc(7, 'prova_1'),
						merkle_height: 0,
						secret: 'secret',
						transaction_id: Buffer.alloc(3,'tx1'),
						previous_asset_reference: Buffer.alloc(0)
					},
					{
						owner: ownerAccount.address,
						file_name: 'prova_2',
						file_size: 1,
						file_hash: Buffer.alloc(7, 'prova_2'),
						merkle_root: Buffer.alloc(7, 'prova_2'),
						merkle_height: 0,
						secret: 'secret',
						transaction_id: Buffer.alloc(3,'tx2'),
						previous_asset_reference: Buffer.alloc(0)
					},
					{
						owner: Buffer.alloc(5,'jonny'),
						file_name: 'prova_3',
						file_size: 1,
						file_hash: Buffer.alloc(7, 'prova_3'),
						merkle_root: Buffer.alloc(7, 'prova_3'),
						merkle_height: 0,
						secret: 'secret',
						transaction_id: Buffer.alloc(3,'tx3'),
						previous_asset_reference: Buffer.alloc(0)
					},
					{
						owner: ownerAccount.address,
						file_name: 'prova_4',
						file_size: 1,
						file_hash: Buffer.alloc(7, 'prova_4'),
						merkle_root: Buffer.alloc(7, 'prova_4'),
						merkle_height: 0,
						secret: 'secret',
						transaction_id: Buffer.alloc(3,'tx4'),
						previous_asset_reference: Buffer.alloc(0)
					}
				]
			}

			test_registered_chunks = 
			{
				chunks: [
					{
						merkle_root: Buffer.alloc(7, 'prova_1'),
						owner: ownerAccount.address,
						hosted_by: [],
						requested_by: [{
							address: responseToAccount.address,
							request_transaction: Buffer.alloc(3, 'tx1'),
							response_transaction: Buffer.alloc(0),
							request_type: request_type.view_only,
							status: request_status.pending
						}],
						allowed_viewers: [],
					},
					{
						merkle_root: Buffer.alloc(7, 'prova_2'),
						owner: ownerAccount.address,
						hosted_by: [],
						requested_by: [{
							address: responseToAccount.address,
							request_transaction: Buffer.alloc(3, 'tx2'),
							response_transaction: Buffer.alloc(0),
							request_type: request_type.ownership,
							status: request_status.pending
						}],
						allowed_viewers: [],
					},
					{
						merkle_root: Buffer.alloc(7, 'prova_3'),
						owner: Buffer.alloc(5,'jonny'),
						hosted_by: [],
						requested_by: [],
						allowed_viewers: [],
					},
					{
						merkle_root: Buffer.alloc(7, 'prova_4'),
						owner: ownerAccount.address,
						hosted_by: [],
						requested_by: [],
						allowed_viewers: [],
					}
				]
			}
		
			stateStore = new testing.mocks.StateStoreMock({
				accounts:  [ownerAccount, responseToAccount],
				chain: {
					"digitalAsset:registeredAssets": codec.encode(registeredAssetsSchema, test_registered_assets),
					"digitalAsset:registeredChunks": codec.encode(registeredChunksSchema, test_registered_chunks)
				}
			});

			reducerHandler = testing.mocks.reducerHandlerMock;

			context = testing.createApplyAssetContext<response>({
				stateStore,
				reducerHandler,
				asset: {
					address: responseToAccount.address,
					merkle_root: Buffer.alloc(7, 'prova_1'),
					response: response_type.ok,
					new_secret: 'secret_2'
				},
				transaction: { senderAddress: ownerAccount.address, nonce: BigInt(1) } as any,
			});
	
			jest.spyOn(stateStore.chain, 'get');
			jest.spyOn(stateStore.chain, 'set');
		});

    	describe('valid cases', () => {
			it('should update the state store - case view only and response OK',async () => {
				await transactionAsset.apply(context);
				let trc = test_registered_chunks;

				const c_index: number = trc.chunks.findIndex((t) => t.merkle_root.equals(context.asset.merkle_root));
				if (c_index < 0) {
					throw new Error("Chunk not found");
				}

				let chunk = {
					merkle_root: Buffer.alloc(7, 'prova_1'),
					owner: ownerAccount.address,
					hosted_by: [],
					requested_by: [{
						address: responseToAccount.address,
						request_transaction: Buffer.alloc(3, 'tx1'),
						response_transaction: context.transaction.id,
						request_type: request_type.view_only,
						status: request_status.accepted
					}],
					allowed_viewers: [{
						address:responseToAccount.address,
						secret: 'secret_2'
					}],
				}

				trc.chunks[c_index] = chunk

				expect(stateStore.chain.set).toHaveBeenCalledWith(
					CHAIN_STATE_CHUNKS,
					codec.encode(registeredChunksSchema, trc)
				);

			});
			it('should update the state store - case ownership and response OK',async () => {
				context.asset.merkle_root = Buffer.alloc(7, 'prova_2');
				await transactionAsset.apply(context);
				let trc = test_registered_chunks;

				const c_index: number = trc.chunks.findIndex((t) => t.merkle_root.equals(context.asset.merkle_root));
				if (c_index < 0) {
					throw new Error("Chunk not found");
				}

				let chunk = {
					merkle_root: Buffer.alloc(7, 'prova_2'),
					owner: responseToAccount.address,
					hosted_by: [],
					requested_by: [{
						address: responseToAccount.address,
						request_transaction: Buffer.alloc(3, 'tx2'),
						response_transaction: context.transaction.id,
						request_type: request_type.ownership,
						status: request_status.accepted
					}],
					allowed_viewers: [],
				}

				trc.chunks[c_index] = chunk

				expect(stateStore.chain.set).toHaveBeenCalledWith(
					CHAIN_STATE_CHUNKS,
					codec.encode(registeredChunksSchema, trc)
				);

			});
    	});

    	describe('invalid cases', () => {
      		it.todo('should throw error');
    	});
	});
});
