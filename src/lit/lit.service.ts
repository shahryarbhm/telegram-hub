import { Injectable } from '@nestjs/common';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { LitNetwork } from '@lit-protocol/constants';
// Removed unused import of 'ethers'

@Injectable()
export class LitService {
    private litNodeClient: LitNodeClient;

    constructor() {
        this.litNodeClient = new LitNodeClient({
            litNetwork: LitNetwork.DatilTest, // or the network you're using
            debug: true,
        });
    }

    async connect() {
        try {
            await this.litNodeClient.connect();
            console.log("✅ Connected to Lit network");
        } catch (error) {
            console.error("Error connecting to Lit network", error);
            throw new Error("Failed to connect to Lit network");
        }
    }

    async encryptData(data: string, pkpPublicKey: string): Promise<any> {
        try {
            await this.connect(); // Ensure we are connected to Lit Node

            const encryptedData = await this.litNodeClient.encrypt({
                accessControlConditions: [
                    {
                        contractAddress: '',
                        standardContractType: '',
                        chain: 'ethereum',
                        method: '',
                        parameters: [':userAddress'],
                        returnValueTest: {
                            comparator: '=',
                            value: pkpPublicKey,
                        },
                    },
                ],
                dataToEncrypt: Buffer.from(data),
            });
            console.log("✅ Data encrypted successfully");
            return encryptedData;
        } catch (error) {
            console.error("Error encrypting data", error);
            throw new Error("Failed to encrypt data");
        }
    }

    async decryptData(encryptedData: string, pkpPublicKey: string): Promise<string> {
        try {
            await this.connect(); // Ensure we are connected to Lit Node

            // Decrypt data
            const decryptedData = await this.litNodeClient.decrypt({
                ciphertext: pkpPublicKey,
                dataToEncryptHash: encryptedData,
                chain: 'ethereum',
            });

            console.log("✅ Data decrypted successfully");
            return decryptedData.toString();
        } catch (error) {
            console.error("Error decrypting data", error);
            throw new Error("Failed to decrypt data");
        }
    }
}
