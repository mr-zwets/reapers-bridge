import { TestNetWallet, Wallet, TokenMintRequest } from "mainnet-js";
import { bigIntToVmNumber, binToHex, hexToBin } from '@bitauth/libauth';
import 'dotenv/config'

const tokenId = process.env.TOKENID;
const network =  process.env.NETWORK;
const derivationPathAddress = process.env.DERIVATIONPATH;
const seedphrase = process.env.SEEDPHRASE;

// mainnet-js generates m/44'/0'/0'/0/0 by default so have to switch it
const walletClass = network == "mainnet" ? Wallet : TestNetWallet;
const wallet = await walletClass.fromSeed(seedphrase, derivationPathAddress);
const walletAddress = wallet.getDepositAddress();
const balance = await wallet.getBalance();
console.log(`wallet address: ${walletAddress}`);
console.log(`Bch amount in walletAddress is ${balance.bch}bch or ${balance.sat}sats`);


async function bridgeNFTs(listNftNumbers, destinationAddress, sbchTxid){
  if(balance.sat < 1000) throw new Error("Not enough BCH to make the transaction!");

  // list outputs for bridging tx
  const outputs = [];

  listNftNumbers.forEach(nftNumber => {
    const vmNumber = bigIntToVmNumber(BigInt(nftNumber));
    const nftCommitment = binToHex(vmNumber);
    const mintNftOutput = new TokenMintRequest({
      cashaddr: destinationAddress,
      commitment: nftCommitment,
      capability: NFTCapability.none,
      value: 1000,
    })
    outputs.push(mintNftOutput);
  })

  const sbchTxidBin = hexToBin(sbchTxid);
  const opReturn = Buffer.from(sbchTxidBin);
  outputs.push(opReturn);

  const { txId } = await wallet.send(outputs);
  console.log(txId)
}
