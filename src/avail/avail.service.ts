import { Injectable, OnModuleInit } from '@nestjs/common';
import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { cryptoWaitReady } from '@polkadot/util-crypto';

type ChainInfo = {
  chain: string;
  lastHeader: any; // Replace `any` with a specific type if you know it
};

@Injectable()
export class AvailService implements OnModuleInit {
  private api: ApiPromise;

  constructor() { }

  async onModuleInit() {
    await cryptoWaitReady(); // Ensure WASM crypto is ready
    console.log('WASM Crypto ready');

    const provider = new WsProvider(process.env.AVAIL_WS_URL);
    this.api = await ApiPromise.create({ provider });
    console.log('Avail API ready');
  }

  async getChainInfo(): Promise<ChainInfo> { // Explicitly specify return type
    const chain = await this.api.rpc.system.chain();
    const lastHeader = await this.api.rpc.chain.getHeader();
    return {
      chain: chain.toString(),
      lastHeader: lastHeader.toHuman(), // lastHeader might have a more specific type
    };
  }

  public async submitData(data: string): Promise<string> {
    const keyring = new Keyring({ type: 'sr25519' });
    const account = keyring.addFromUri('//Alice'); // Use proper seed or account

    const unsignedTx = this.api.tx.system.remark(data); // Example transaction to submit data
    const hash = await unsignedTx.signAndSend(account);

    return hash.toHex(); // Return the transaction hash
  }

  async queryData(queryId: string): Promise<any> {
    // Example of querying data based on storage item (you should adjust based on Avail specifics)
    const result = await this.api.query.dataAvailabilityModule.dataStorage(queryId); // Adjust for your chain's storage module
    return result.toHuman(); // Return human-readable format
  }
  public async retrieveData(transactionHash: string): Promise<string> {
    try {
      const blockHash = await this.api.rpc.chain.getBlockHash(transactionHash);
      const signedBlock = await this.api.rpc.chain.getBlock(blockHash);

      // Extract the remark or data from the transaction
      const extrinsics = signedBlock.block.extrinsics;
      let data = 'No data found in this transaction.';

      extrinsics.forEach((extrinsic) => {
        if (extrinsic.method.method === 'remark') {
          data = extrinsic.method.args[0].toString(); // This contains the data (remark)
        }
      });

      return data;
    } catch (error) {
      console.error('Failed to retrieve data:', error);
      throw new Error('Data retrieval failed');
    }
  }
}
