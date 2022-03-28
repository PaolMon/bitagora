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
			ownerAccount.digitalAsset.myFiles = [
				{
					fileName: 'prova_1',
					merkleRoot: Buffer.alloc(7, 'prova_1'),
					secret: 'secret'
				},
				{
					fileName: 'prova_2',
					merkleRoot: Buffer.alloc(7, 'prova_2'),
					secret: 'secret'
				},
				{
					fileName: 'prova_4',
					merkleRoot: Buffer.alloc(7, 'prova_4'),
					secret: 'secret'
				}
			]

			
			responseToAccount = testing.fixtures.createDefaultAccount<BitagoraAccountProps>([DigitalAssetModule]);
			responseToAccount.digitalAsset.pending = [
				{
					fileName: 'prova_1',
					merkleRoot: Buffer.alloc(7, 'prova_1'),
				},
				{
					fileName: 'prova_2',
					merkleRoot: Buffer.alloc(7, 'prova_2'),
				}
			]
			
			test_registered_assets = 
			{
				registeredAssets: [
					{
						owner: ownerAccount.address,
						fileName: 'prova_1',
						fileSize: 1,
						fileHash: Buffer.alloc(7, 'prova_1'),
						merkleRoot: Buffer.alloc(7, 'prova_1'),
						merkleHeight: 0,
						secret: 'secret',
						transactionID: Buffer.alloc(3,'tx1'),
						previousAssetReference: Buffer.alloc(0)
					},
					{
						owner: ownerAccount.address,
						fileName: 'prova_2',
						fileSize: 1,
						fileHash: Buffer.alloc(7, 'prova_2'),
						merkleRoot: Buffer.alloc(7, 'prova_2'),
						merkleHeight: 0,
						secret: 'secret',
						transactionID: Buffer.alloc(3,'tx2'),
						previousAssetReference: Buffer.alloc(0)
					},
					{
						owner: Buffer.alloc(5,'jonny'),
						fileName: 'prova_3',
						fileSize: 1,
						fileHash: Buffer.alloc(7, 'prova_3'),
						merkleRoot: Buffer.alloc(7, 'prova_3'),
						merkleHeight: 0,
						secret: 'secret',
						transactionID: Buffer.alloc(3,'tx3'),
						previousAssetReference: Buffer.alloc(0)
					},
					{
						owner: ownerAccount.address,
						fileName: 'prova_4',
						fileSize: 1,
						fileHash: Buffer.alloc(7, 'prova_4'),
						merkleRoot: Buffer.alloc(7, 'prova_4'),
						merkleHeight: 0,
						secret: 'secret',
						transactionID: Buffer.alloc(3,'tx4'),
						previousAssetReference: Buffer.alloc(0)
					}
				]
			}

			test_registered_chunks = 
			{
				chunks: [
					{
						merkleRoot: Buffer.alloc(7, 'prova_1'),
						owner: ownerAccount.address,
						hostedBy: [],
						requestedBy: [{
							address: responseToAccount.address,
							requestTransaction: Buffer.alloc(3, 'tx1'),
							responseTransaction: Buffer.alloc(0),
							requestType: request_type.view_only,
							status: request_status.pending
						}],
						allowedViewers: [],
					},
					{
						merkleRoot: Buffer.alloc(7, 'prova_2'),
						owner: ownerAccount.address,
						hostedBy: [],
						requestedBy: [{
							address: responseToAccount.address,
							requestTransaction: Buffer.alloc(3, 'tx2'),
							responseTransaction: Buffer.alloc(0),
							requestType: request_type.ownership,
							status: request_status.pending
						}],
						allowedViewers: [],
					},
					{
						merkleRoot: Buffer.alloc(7, 'prova_3'),
						owner: Buffer.alloc(5,'jonny'),
						hostedBy: [],
						requestedBy: [],
						allowedViewers: [],
					},
					{
						merkleRoot: Buffer.alloc(7, 'prova_4'),
						owner: ownerAccount.address,
						hostedBy: [],
						requestedBy: [],
						allowedViewers: [],
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
					merkleRoot: Buffer.alloc(7, 'prova_1'),
					response: response_type.ok,
					newSecret: 'secret_2'
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

				const c_index: number = trc.chunks.findIndex((t) => t.merkleRoot.equals(context.asset.merkleRoot));
				if (c_index < 0) {
					throw new Error("Chunk not found");
				}

				let chunk = {
					merkleRoot: Buffer.alloc(7, 'prova_1'),
					owner: ownerAccount.address,
					hostedBy: [],
					requestedBy: [{
						address: responseToAccount.address,
						requestTransaction: Buffer.alloc(3, 'tx1'),
						responseTransaction: context.transaction.id,
						requestType: request_type.view_only,
						status: request_status.accepted
					}],
					allowedViewers: [{
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
				context.asset.merkleRoot = Buffer.alloc(7, 'prova_2');
				await transactionAsset.apply(context);
				let trc = test_registered_chunks;

				const c_index: number = trc.chunks.findIndex((t) => t.merkleRoot.equals(context.asset.merkleRoot));
				if (c_index < 0) {
					throw new Error("Chunk not found");
				}

				let chunk = {
					merkleRoot: Buffer.alloc(7, 'prova_2'),
					owner: responseToAccount.address,
					hostedBy: [],
					requestedBy: [{
						address: responseToAccount.address,
						requestTransaction: Buffer.alloc(3, 'tx2'),
						responseTransaction: context.transaction.id,
						requestType: request_type.ownership,
						status: request_status.accepted
					}],
					allowedViewers: [],
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
