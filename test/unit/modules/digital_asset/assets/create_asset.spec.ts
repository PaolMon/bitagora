import { Account } from '@liskhq/lisk-chain';
import { ApplyAssetContext, codec, StateStore, testing } from 'lisk-sdk';
import { CHAIN_STATE_DIGITAL_ASSETS } from '../../../../../src/app/modules/digital_asset/utils/assets';
import { create, CreateAsset } from '../../../../../src/app/modules/digital_asset/assets/create_asset';
import { DigitalAssetModule } from '../../../../../src/app/modules/digital_asset/digital_asset_module';
import { BitagoraAccountProps } from '../../../../../src/app/schemas/account';
import { digitalAsset } from '../../../../../src/app/schemas/digital_asset/digital_asset_types';
import { registeredAssetsSchema } from '../../../../../src/app/schemas/digital_asset/digital_asset_schemas';

describe('CreateAsset', () => {
  let transactionAsset: CreateAsset;

	beforeEach(() => {
		transactionAsset = new CreateAsset();
	});

	describe('constructor', () => {
		it('should have valid id', () => {
			expect(transactionAsset.id).toEqual(0);
		});

		it('should have valid name', () => {
			expect(transactionAsset.name).toEqual('create');
		});

		it('should have valid schema', () => {
			expect(transactionAsset.schema).toMatchSnapshot();
		});
	});

	describe('validate', () => {
		describe('schema validation', () => {
			it.todo('should throw errors for invalid schema');
			it('should be ok for valid schema', () => {
				const create_object: create = {
					fileName: 'prova.txt',
					fileSize: 3,
					fileHash: Buffer.alloc(5),
					merkleRoot: Buffer.alloc(6),
					merkleHeight: 0,
					secret: 'prova'
				};
				const context = testing.createValidateAssetContext({
					asset: create_object,
					transaction: { senderAddress: Buffer.alloc(0) } as any,
				});

				expect(() => transactionAsset.validate(context)).not.toThrow();
			});
    	});
	});

	describe('apply', () => {
		let stateStore: StateStore;
		let account: Account<BitagoraAccountProps>;
		let context: ApplyAssetContext<create>;

		beforeEach(() => {
			account = testing.fixtures.createDefaultAccount<BitagoraAccountProps>([DigitalAssetModule]);
	
			stateStore = new testing.mocks.StateStoreMock({
				accounts: [account]
			});

			const create_object: create = {
				fileName: 'prova.txt',
				fileSize: 3,
				fileHash: Buffer.alloc(4, 'hash'),
				merkleRoot: Buffer.alloc(10, 'merkleroot'),
				merkleHeight: 0,
				secret: 'prova'
			}
	
			context = testing.createApplyAssetContext<create>({
				stateStore,
				asset: create_object,
				transaction: { senderAddress: account.address, nonce: BigInt(1) } as any,
			});
	
			jest.spyOn(stateStore.chain, 'get');
			jest.spyOn(stateStore.chain, 'set');
		});


    	describe('valid cases', () => {
      		it('should update the state store',async () => {
				await transactionAsset.apply(context);
				const new_digital_asset: digitalAsset = {
					owner: context.transaction.senderAddress,
					fileName: 'prova.txt',
					fileSize: 3,
					fileHash: Buffer.alloc(4, 'hash'),
					merkleRoot: Buffer.alloc(10, 'merkleroot'),
					merkleHeight: 0,
					secret: 'prova',
					transactionID: context.transaction.id,
					previousAssetReference: Buffer.alloc(0)
				}
				const DAs: digitalAsset[] = []
				DAs.push(new_digital_asset)		
				expect(stateStore.chain.set).toHaveBeenCalledWith(
					CHAIN_STATE_DIGITAL_ASSETS,
					codec.encode(registeredAssetsSchema, {registeredAssets:DAs})
				);
			});
			it('should update sender account',async () => {
				await transactionAsset.apply(context);
				const senderAccount = await stateStore.account.get<BitagoraAccountProps>(context.transaction.senderAddress)	
				expect(senderAccount.digitalAsset.myFiles).toContainEqual({
						fileName: context.asset.fileName, 
						merkleRoot: context.asset.merkleRoot, 
						secret: context.asset.secret
				})
		  	});
    	});

    	describe('invalid cases', () => {
      		it.todo('should throw error');
    	});
	});
});
