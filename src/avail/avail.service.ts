import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { initialize, getKeyringFromSeed } from 'avail-js-sdk'; // Import Avail SDK
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { LitService } from 'src/lit/lit.service'; // Adjust the path as needed

@Injectable()
export class AvailService implements OnModuleInit {
  private api: any;
  private litService: LitService;

  constructor(
    @Inject('AVAIL_SEED_PHRASE') private readonly seedPhrase: string,
    litService: LitService) {
    this.litService = litService;
  }

  async onModuleInit() {
    await cryptoWaitReady(); // Ensure WASM crypto is ready
    console.log('WASM Crypto ready');

    this.api = await initialize(process.env.AVAIL_WS_URL); // Initialize Avail API with the SDK
    console.log('Avail API ready');
  }

  async getChainInfo(): Promise<any> {
    const chain = await this.api.rpc.system.chain();
    const lastHeader = await this.api.rpc.chain.getHeader();
    return {
      chain: chain.toString(),
      lastHeader: lastHeader.toHuman(),
    };
  }

  public async submitEncryptedData(encryptedData: string, pkpPublicKey: string): Promise<string> {
    try {
      // Encrypt the data using LitService
      // Retrieve the account keyring from the seed
      const account = getKeyringFromSeed(this.seedPhrase);

      // Transaction call to submit encrypted data
      const txResult = await new Promise<any>((res) => {
        this.api.tx.dataAvailability.submitData(encryptedData).signAndSend(account, { nonce: -1 }, (result: any) => {
          console.log(`Tx status: ${result.status}`);
          if (result.isFinalized || result.isError) {
            res(result);
          }
        });
      });

      // Handle transaction rejection
      if (txResult.isError) {
        console.log('Transaction was not executed');
        throw new Error('Transaction failed');
      }

      const blockHash = txResult.status.asFinalized;
      console.log(`Transaction finalized. Block Hash: ${blockHash}`);

      return blockHash.toString();
    } catch (error) {
      console.error('Failed to submit encrypted data:', error);
      throw new Error('Data submission failed');
    }
  }

  public async retrieveData(transactionHash: string, pkpPrivateKey: string): Promise<string> {
    try {
      const blockHash = await this.api.rpc.chain.getBlockHash(transactionHash);
      const signedBlock = await this.api.rpc.chain.getBlock(blockHash);

      // Extract the data from the transaction
      const extrinsics = signedBlock.block.extrinsics;
      let encryptedData = '';

      extrinsics.forEach((extrinsic) => {
        if (extrinsic.method.method === 'submitData') {
          encryptedData = extrinsic.method.args[0].toString(); // Extract the encrypted data
        }
      });

      if (!encryptedData) {
        throw new Error('No data found in this transaction.');
      }

      return encryptedData;
      // Decrypt the data using LitService
      const decryptedData = await this.litService.decryptData(encryptedData, pkpPrivateKey);

      return decryptedData;
    } catch (error) {
      console.error('Failed to retrieve and decrypt data:', error);
      throw new Error('Data retrieval or decryption failed');
    }
  }

  async queryData(queryId: string): Promise<any> {
    // Query data from the chain (adjust based on Avail's modules)
    const result = await this.api.query.dataAvailabilityModule.dataStorage(queryId);
    return result.toHuman();
  }
}
