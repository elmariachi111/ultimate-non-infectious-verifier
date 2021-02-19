//@ts-ignore
import ganache from 'ganache-cli';
import Web3 from 'web3';

const MNEMONIC = 'myth like bonus scare over problem client lizard pioneer submit female collect';

const provider = ganache.provider({
    mnemonic: MNEMONIC,
    total_accounts: 10,
    default_balance_ether: 100
});
const web3 = new Web3(provider);

export default web3;
