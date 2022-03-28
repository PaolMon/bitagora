import { claim, ClaimAsset } from '../../../../../src/app/modules/digital_asset/assets/claim_asset';
import { Account } from '@liskhq/lisk-chain';
import { ApplyAssetContext, codec, ReducerHandler, StateStore, testing } from 'lisk-sdk';
import { DigitalAssetModule } from '../../../../../src/app/modules/digital_asset/digital_asset_module';
import { BitagoraAccountProps } from '../../../../../src/app/schemas/account';
import { digitalAsset, registeredAssets, request_status, request_type } from '../../../../../src/app/schemas/digital_asset/digital_asset_types';
import { registeredAssetsSchema } from '../../../../../src/app/schemas/digital_asset/digital_asset_schemas';
import { chunk, registered_chunks } from '../../../../../src/app/schemas/chunks/chunk_types';
import { registeredChunksSchema } from '../../../../../src/app/schemas/chunks/chunk_schemas';
import { CHAIN_STATE_CHUNKS } from '../../../../../src/app/modules/digital_asset/utils/chunks';
import { CHAIN_STATE_DIGITAL_ASSETS } from '../../../../../src/app/modules/digital_asset/utils/assets';

describe('ClaimAsset', () => {
  let transactionAsset: ClaimAsset;

	beforeEach(() => {
		transactionAsset = new ClaimAsset();
	});

	describe('constructor', () => {
		it('should have valid id', () => {
			expect(transactionAsset.id).toEqual(3);
		});

		it('should have valid name', () => {
			expect(transactionAsset.name).toEqual('claim');
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
		let old_ownerAccount: Account<BitagoraAccountProps>;
		let senderAccount: Account<BitagoraAccountProps>;
		let context: ApplyAssetContext<claim>;
		let test_registered_assets: registeredAssets;
		let test_registered_chunks: registered_chunks;

		beforeEach(() => {
			old_ownerAccount = testing.fixtures.createDefaultAccount<BitagoraAccountProps>([DigitalAssetModule]);
			old_ownerAccount.digitalAsset.myFiles = [
				{
					fileName: 'prova_4',
					merkleRoot: Buffer.alloc(7, 'prova_4'),
					secret: 'secret'
				}
			]

			
			senderAccount = testing.fixtures.createDefaultAccount<BitagoraAccountProps>([DigitalAssetModule]);
			senderAccount.digitalAsset.allowed = [
				{
					fileName: 'prova_1',
					merkleRoot: Buffer.alloc(7, 'prova_1'),
					secret: 'secret'
				}
			]
			
			test_registered_assets = 
			{
				registeredAssets: [
					{
						owner: old_ownerAccount.address,
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
						owner: Buffer.alloc(5,'jonny'),
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
						owner: old_ownerAccount.address,
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
						owner: old_ownerAccount.address,
						hostedBy: [],
						requestedBy: [{
							address: senderAccount.address,
							requestTransaction: Buffer.alloc(3, 'tx1'),
							responseTransaction: Buffer.alloc(3, 'tx0'),
							requestType: request_type.view_only,
							status: request_status.accepted
						}],
						allowedViewers: [{
							address:senderAccount.address,
							secret: 'secret_2'
						}],
					},
					{
						merkleRoot: Buffer.alloc(7, 'prova_2'),
						owner: senderAccount.address,
						hostedBy: [],
						requestedBy: [{
							address: senderAccount.address,
							requestTransaction: Buffer.alloc(3, 'tx2'),
							responseTransaction: Buffer.alloc(3, 'tx0'),
							requestType: request_type.ownership,
							status: request_status.accepted
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
						owner: old_ownerAccount.address,
						hostedBy: [],
						requestedBy: [],
						allowedViewers: [],
					}
				]
			}
		
			stateStore = new testing.mocks.StateStoreMock({
				accounts:  [old_ownerAccount, senderAccount],
				chain: {
					"digitalAsset:registeredAssets": codec.encode(registeredAssetsSchema, test_registered_assets),
					"digitalAsset:registeredChunks": codec.encode(registeredChunksSchema, test_registered_chunks)
				}
			});

			reducerHandler = testing.mocks.reducerHandlerMock;

			context = testing.createApplyAssetContext<claim>({
				stateStore,
				reducerHandler,
				asset: {
					oldMerkleRoot: Buffer.alloc(7, 'prova_2'),
					newMerkleRoot: Buffer.alloc(11, 'new_prova_2'),
					newMerkleHeight: 3,
					newHosts: [],
					newSecret: 'new_secret'
				},
				transaction: { senderAddress: senderAccount.address, nonce: BigInt(1) } as any,
			});
	
			jest.spyOn(stateStore.chain, 'get');
			jest.spyOn(stateStore.chain, 'set');
		});

    	describe('valid cases', () => {
      		it('should update the state store',async () => {
				  await transactionAsset.apply(context);
				  const new_digital_asset: digitalAsset = {
						owner: senderAccount.address,
						fileName: 'prova_2',
						fileSize: 1,
						fileHash: Buffer.alloc(7, 'prova_2'),
						merkleRoot: Buffer.alloc(11, 'new_prova_2'),
						merkleHeight: 3,
						secret: 'new_secret',
						transactionID: context.transaction.id,
						previousAssetReference: Buffer.alloc(7, 'prova_2')
				  };
				  const new_chunk: chunk = {
					merkleRoot: Buffer.alloc(11, 'new_prova_2'),
					owner: senderAccount.address,
					hostedBy: [],
					requestedBy: [],
					allowedViewers: [],
				  };
				  let _tra = test_registered_assets;
				  let _trc = test_registered_chunks;
				  _tra.registeredAssets.push(new_digital_asset);
				  _tra.registeredAssets.sort((a, b) => a.merkleRoot.compare(b.merkleRoot));
				  _trc.chunks.push(new_chunk);
				  _trc.chunks = _trc.chunks.sort((a, b) => a.merkleRoot.compare(b.merkleRoot));

				  expect(stateStore.chain.set).toHaveBeenCalledWith(
					  CHAIN_STATE_CHUNKS,
					  codec.encode(
						  	registeredChunksSchema,
							  _trc
						)
				  );

				  expect(stateStore.chain.set).toHaveBeenCalledWith(
					CHAIN_STATE_DIGITAL_ASSETS,
					codec.encode(
							registeredAssetsSchema,
							_tra
					  )
				)

			  });
    	});

    	describe('invalid cases', () => {
      		it.todo('should throw error');
    	});
	});
});
