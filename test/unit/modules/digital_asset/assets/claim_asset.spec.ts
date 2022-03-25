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
			old_ownerAccount.digitalAsset.my_files = [
				{
					file_name: 'prova_4',
					merkle_root: Buffer.alloc(7, 'prova_4'),
					secret: 'secret'
				}
			]

			
			senderAccount = testing.fixtures.createDefaultAccount<BitagoraAccountProps>([DigitalAssetModule]);
			senderAccount.digitalAsset.allowed = [
				{
					file_name: 'prova_1',
					merkle_root: Buffer.alloc(7, 'prova_1'),
					secret: 'secret'
				}
			]
			
			test_registered_assets = 
			{
				registeredAssets: [
					{
						owner: old_ownerAccount.address,
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
						file_hash: Buffer.alloc(7, 'prova_3'),
						merkle_root: Buffer.alloc(7, 'prova_3'),
						merkle_height: 0,
						secret: 'secret',
						transaction_id: Buffer.alloc(3,'tx3'),
						previous_asset_reference: Buffer.alloc(0)
					},
					{
						owner: old_ownerAccount.address,
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
						owner: old_ownerAccount.address,
						hosted_by: [],
						requested_by: [{
							address: senderAccount.address,
							request_transaction: Buffer.alloc(3, 'tx1'),
							response_transaction: Buffer.alloc(3, 'tx0'),
							request_type: request_type.view_only,
							status: request_status.accepted
						}],
						allowed_viewers: [{
							address:senderAccount.address,
							secret: 'secret_2'
						}],
					},
					{
						merkle_root: Buffer.alloc(7, 'prova_2'),
						owner: senderAccount.address,
						hosted_by: [],
						requested_by: [{
							address: senderAccount.address,
							request_transaction: Buffer.alloc(3, 'tx2'),
							response_transaction: Buffer.alloc(3, 'tx0'),
							request_type: request_type.ownership,
							status: request_status.accepted
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
						owner: old_ownerAccount.address,
						hosted_by: [],
						requested_by: [],
						allowed_viewers: [],
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
					old_merkle_root: Buffer.alloc(7, 'prova_2'),
					new_merkle_root: Buffer.alloc(11, 'new_prova_2'),
					new_merkle_height: 3,
					new_hosts: [],
					new_secret: 'new_secret'
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
						file_name: 'prova_2',
						file_size: 1,
						file_hash: Buffer.alloc(7, 'prova_2'),
						merkle_root: Buffer.alloc(11, 'new_prova_2'),
						merkle_height: 3,
						secret: 'new_secret',
						transaction_id: context.transaction.id,
						previous_asset_reference: Buffer.alloc(7, 'prova_2')
				  };
				  const new_chunk: chunk = {
					merkle_root: Buffer.alloc(11, 'new_prova_2'),
					owner: senderAccount.address,
					hosted_by: [],
					requested_by: [],
					allowed_viewers: [],
				  };
				  let _tra = test_registered_assets;
				  let _trc = test_registered_chunks;
				  _tra.registeredAssets.push(new_digital_asset);
				  _tra.registeredAssets.sort((a, b) => a.merkle_root.compare(b.merkle_root));
				  _trc.chunks.push(new_chunk);
				  _trc.chunks = _trc.chunks.sort((a, b) => a.merkle_root.compare(b.merkle_root));

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
