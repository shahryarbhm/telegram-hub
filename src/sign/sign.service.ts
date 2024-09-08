import { Injectable } from '@nestjs/common';
import {
    SignProtocolClient,
    SpMode,
    EvmChains,
    delegateSignAttestation,
    delegateSignRevokeAttestation,
    delegateSignSchema,
} from '@ethsign/sp-sdk';
import { privateKeyToAccount } from 'viem/accounts';

@Injectable()
export class SignService {
    private client: SignProtocolClient;

    constructor() {
        // Private key and chain configuration
        const privateKey: any = process.env.SIGN_PRIVATE_KEY || '0xabc'; // Example private key
        this.client = new SignProtocolClient(SpMode.OnChain, {
            chain: EvmChains.polygonMumbai,
            account: privateKeyToAccount(privateKey),
        });
    }

    // Create schema
    async createSchema(schemaName: string, schemaData: any[]) {
        return this.client.createSchema({
            name: schemaName,
            data: schemaData,
        });
    }

    // Create attestation
    async createAttestation(schemaId: string, attestationData: any, indexingValue: string) {
        return this.client.createAttestation({
            schemaId,
            data: attestationData,
            indexingValue,
        });
    }

    // Revoke attestation
    async revokeAttestation(attestationId: string, reason: string) {
        return this.client.revokeAttestation(attestationId, { reason });
    }

    // Delegated operations
    async delegateCreateSchema(delegationPrivateKey: any, schemaData: any) {
        const info = await delegateSignSchema(schemaData, {
            chain: EvmChains.polygonMumbai,
            delegationAccount: privateKeyToAccount(delegationPrivateKey),
        });
        return this.client.createSchema(info.schema, { delegationSignature: info.delegationSignature } as any);
    }

    async delegateCreateAttestation(delegationPrivateKey: any, attestationData: any, schemaId: string, indexingValue: string) {
        const info = await delegateSignAttestation(
            {
                schemaId,
                data: attestationData,
                indexingValue,
            },
            {
                chain: EvmChains.polygonMumbai,
                delegationAccount: privateKeyToAccount(delegationPrivateKey),
            }
        );
        return this.client.createAttestation(info.attestation, { delegationSignature: info.delegationSignature });
    }

    async delegateRevokeAttestation(delegationPrivateKey: any, attestationId: string, reason: string) {
        const info = await delegateSignRevokeAttestation(attestationId, {
            chain: EvmChains.polygonMumbai,
            reason,
            delegationAccount: privateKeyToAccount(delegationPrivateKey),
        });
        return this.client.revokeAttestation(info.attestationId, {
            reason: info.reason,
            delegationSignature: info.delegationSignature,
        });
    }
}
