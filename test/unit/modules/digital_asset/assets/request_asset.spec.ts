import { Account } from '@liskhq/lisk-chain';
import { ApplyAssetContext, codec, ReducerHandler, StateStore, testing } from 'lisk-sdk';
import { request, RequestAsset } from '../../../../../src/app/modules/digital_asset/assets/request_asset';
import { DigitalAssetModule } from '../../../../../src/app/modules/digital_asset/digital_asset_module';
import { BitagoraAccountProps } from '../../../../../src/app/schemas/account';
import { registeredAssets, request_status, request_type } from '../../../../../src/app/schemas/digital_asset/digital_asset_types';
import { registeredAssetsSchema } from '../../../../../src/app/schemas/digital_asset/digital_asset_schemas';
import { registered_chunks, request_object } from '../../../../../src/app/schemas/chunks/chunk_types';
import { registeredChunksSchema } from '../../../../../src/app/schemas/chunks/chunk_schemas';
import { CHAIN_STATE_CHUNKS } from '../../../../../src/app/modules/digital_asset/utils/chunks';

describe('RequestAsset', () => {
  let transactionAsset: RequestAsset;

	beforeEach(() => {
		transactionAsset = new RequestAsset();
	});

	describe('constructor', () => {
		it('should have valid id', () => {
			expect(transactionAsset.id).toEqual(1);
		});

		it('should have valid name', () => {
			expect(transactionAsset.name).toEqual('request');
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
		let account: Account<BitagoraAccountProps>;
		let context: ApplyAssetContext<request>;
		let test_registered_assets: registeredAssets;
		let test_registered_chunks: registered_chunks;

		beforeEach(() => {
			account = testing.fixtures.createDefaultAccount<BitagoraAccountProps>([DigitalAssetModule]);
			//account.my_files = account.pending = account.hosted_files = account.my_neighbors = [];
			
			test_registered_assets = 
			{
				registeredAssets: [
					{
						owner: Buffer.alloc(5,'jonny'),
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
						owner: Buffer.alloc(5,'jonny'),
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
						file_hash: Buffer.alloc(7, 'prova_2'),
						merkle_root: Buffer.alloc(7, 'prova_2'),
						merkle_height: 0,
						secret: 'secret',
						transaction_id: Buffer.alloc(3,'tx3'),
						previous_asset_reference: Buffer.alloc(0)
					},
					{
						owner: account.address,
						file_name: 'prova_4',
						file_size: 1,
						file_hash: Buffer.alloc(7, 'prova_2'),
						merkle_root: Buffer.alloc(7, 'prova_2'),
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
						owner: Buffer.alloc(5,'jonny'),
						hosted_by: [],
						requested_by: [{
							address: Buffer.alloc(5, 'mario'),
							request_transaction: Buffer.alloc(3, 'tx1'),
							response_transaction: Buffer.alloc(0),
							request_type: request_type.view_only,
							status: request_status.pending
						}],
						allowed_viewers: [],
					},
					{
						merkle_root: Buffer.alloc(7, 'prova_2'),
						owner: Buffer.alloc(5,'jonny'),
						hosted_by: [],
						requested_by: [{
							address: account.address,
							request_transaction: Buffer.alloc(3, 'tx2'),
							response_transaction: Buffer.alloc(0),
							request_type: request_type.view_only,
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
						owner: account.address,
						hosted_by: [],
						requested_by: [],
						allowed_viewers: [],
					}
				]
			}
		
			stateStore = new testing.mocks.StateStoreMock({
				accounts: [account],
				chain: {
					"digitalAsset:registeredAssets": codec.encode(registeredAssetsSchema, test_registered_assets),
					"digitalAsset:registeredChunks": codec.encode(registeredChunksSchema, test_registered_chunks)
				}
			});

			reducerHandler = testing.mocks.reducerHandlerMock;

			context = testing.createApplyAssetContext<request>({
				stateStore,
				reducerHandler,
				asset: {
					merkle_root: Buffer.alloc(7, 'prova_1'),
					mode: request_type.view_only
				},
				transaction: { senderAddress: account.address, nonce: BigInt(1) } as any,
			});
	
			jest.spyOn(stateStore.chain, 'get');
			jest.spyOn(stateStore.chain, 'set');
		});

    	describe('valid cases', () => {
      		it('should update the state store',async () => {
				await transactionAsset.apply(context);
				let trc = test_registered_chunks;

				const c_index: number = trc.chunks.findIndex((t) => t.merkle_root.equals(context.asset.merkle_root));
				if (c_index < 0) {
					throw new Error("Chunk not found");
				}
				let chunk = test_registered_chunks.chunks[c_index]
				const ro: request_object = {
					address: context.transaction.senderAddress,
					request_transaction: context.transaction.id,
					response_transaction: Buffer.alloc(0),
					request_type: context.asset.mode,
					status: request_status.pending
				};
				chunk.requested_by.push(ro);
				trc.chunks[c_index] = chunk
				expect(stateStore.chain.set).toHaveBeenCalledWith(
					CHAIN_STATE_CHUNKS,
					codec.encode(registeredChunksSchema, trc)
				);

			});
      		it('should update sender account',async () => {
				await transactionAsset.apply(context);
				const senderAccount = await stateStore.account.get<BitagoraAccountProps>(context.transaction.senderAddress);
				expect(senderAccount.digitalAsset.pending).toContainEqual({
						file_name: 'prova_1', 
						merkle_root: context.asset.merkle_root
				})
			});
    	});

    	describe('invalid cases', () => {
      		it.todo('should throw error');
    	});
	});
});
