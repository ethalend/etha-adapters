const { getBalances } = require("./utils/tokens");
const ethers = require("ethers");
const { GraphQLClient } = require("graphql-request");
const { default: axios } = require("axios");
const { walletQuery } = require("./utils/queries");

const ethaProtocol = new GraphQLClient(
  "https://api.thegraph.com/subgraphs/name/ethalend/etha-v1"
);

async function getAmountUSD(id, amount) {
  const coinGeckoApi = `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`;
  const { data } = await axios.get(coinGeckoApi);

  return amount * data[id].usd;
}

async function main() {
  const provider = ethers.getDefaultProvider("https://polygon-rpc.com"); // Polygon RPC for mainnet
  const { smartWallets } = await ethaProtocol.request(walletQuery);

  const supportedTokens = [
    {
      address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
      decimals: 18,
      id: "matic-network",
    },
    {
      address: "0x831753DD7087CaC61aB5644b308642cc1c33Dc13",
      decimals: 18,
      id: "quick",
    },
    {
      address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
      decimals: 18,
      id: "dai",
    },
    {
      address: "0xa3Fa99A148fA48D14Ed51d610c367C61876997F1",
      decimals: 18,
      id: "dai",
    },
    {
      address: "0x59E9261255644c411AfDd00bD89162d09D862e38",
      decimals: 18,
      id: "etha-lend",
    },
    {
      address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      decimals: 6,
      id: "usd-coin",
    },
    {
      address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
      decimals: 6,
      id: "tether",
    },
    {
      address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
      decimals: 18,
      id: "ethereum",
    },
    {
      address: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
      decimals: 8,
      id: "bitcoin",
    },
    {
      address: "0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39",
      decimals: 18,
      id: "chainlink",
    },
    {
      address: "0x172370d5Cd63279eFa6d502DAB29171933a610AF",
      decimals: 18,
      id: "curve-dao-token",
    },
    {
      address: "0xb33EaAd8d922B1083446DC23f610c2567fB5180f",
      decimals: 18,
      id: "uniswap",
    },
    {
      address: "0x580A84C73811E1839F75d86d75d88cCa0c241fF4",
      decimals: 18,
      id: "qi-dao",
    },
    {
      address: "0x385Eeac5cB85A38A9a07A70c73e0a3271CfB54A7",
      decimals: 18,
      id: "aavegotchi",
    },
    {
      id: "the-sandbox",
      decimals: 18,
      address: "0xBbba073C31bF03b8ACf7c28EF0738DeCF3695683",
    },
    {
      id: "aave",
      decimals: 18,
      address: "0xD6DF932A45C0f255f85145f286eA0b292B21C90B",
    },
  ];

  const totalBalances = {
    "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270": 0,
    "0x831753DD7087CaC61aB5644b308642cc1c33Dc13": 0,
    "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063": 0,
    "0xa3Fa99A148fA48D14Ed51d610c367C61876997F1": 0,
    "0x59E9261255644c411AfDd00bD89162d09D862e38": 0,
    "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174": 0,
    "0xc2132D05D31c914a87C6611C10748AEb04B58e8F": 0,
    "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619": 0,
    "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6": 0,
    "0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39": 0,
    "0x172370d5Cd63279eFa6d502DAB29171933a610AF": 0,
    "0xb33EaAd8d922B1083446DC23f610c2567fB5180f": 0,
    "0x580A84C73811E1839F75d86d75d88cCa0c241fF4": 0,
    "0x385Eeac5cB85A38A9a07A70c73e0a3271CfB54A7": 0,
    "0xBbba073C31bF03b8ACf7c28EF0738DeCF3695683": 0,
    "0xD6DF932A45C0f255f85145f286eA0b292B21C90B": 0,
  };

  console.log(smartWallets.length);
  console.time("fetchBalances");
  for (const wallet of smartWallets) {
    const [, balances] = await getBalances(
      provider,
      supportedTokens.map((i) => i.address),
      wallet.address
    );

    for (const { address, decimals } of supportedTokens) {
      totalBalances[address] =
        totalBalances[address] + Number(balances[address]) / 10 ** decimals;
    }
  }

  for (const { address, id, decimals } of supportedTokens) {
    const amountUSD = await getAmountUSD(id, totalBalances[address], decimals);
    totalBalances[address] = amountUSD;
  }

  for (const { address } of supportedTokens) {
    console.log(`${address}: $`, String(totalBalances[address]));
  }
  console.timeEnd("fetchBalances");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
