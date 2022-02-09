const { getBalances, getBalancesCR } = require("./utils/util");
const ethers = require("ethers");
const { GraphQLClient } = require("graphql-request");
const { walletQueryFirst, walletQuerySecond } = require("./utils/queries");

const ethaProtocol = new GraphQLClient(
  "https://api.thegraph.com/subgraphs/name/ethalend/etha-v1"
);

async function main() {
  const provider = ethers.getDefaultProvider("https://polygon-rpc.com"); // Polygon RPC for mainnet
  const { smartWallets: smartWalletsFirst } = await ethaProtocol.request(
    walletQueryFirst
  );
  const { smartWallets: smartWalletsSecond } = await ethaProtocol.request(
    walletQuerySecond
  );

  const smartWallets = [...smartWalletsFirst, ...smartWalletsSecond];

  const supportedATokens = [
    {
      address: "0x27F8D03b3a2196956ED754baDc28D73be8830A6e",
      name: "aDAI",
      decimals: 18,
    }, // aDAI
    {
      address: "0x1a13F4Ca1d028320A707D99520AbFefca3998b7F",
      name: "aUSDC",
      decimals: 6,
    }, // aUSDC
    {
      address: "0x60D55F02A771d515e077c9C2403a1ef324885CeC",
      name: "aUSDT",
      decimals: 6,
    }, // aUSDT
    {
      address: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6",
      name: "aWBTC",
      decimals: 8,
    }, // aWBTC
    {
      address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
      name: "aWETH",
      decimals: 18,
    }, // aWETH
    {
      address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
      name: "aWMATIC",
      decimals: 18,
    }, // aWMATIC
    // crWMATIC
  ];

  const supportedCRTokens = [
    {
      address: "0x4eCEDdF62277eD78623f9A94995c680f8fd6C00e",
      name: "crDAI",
      decimals: 18,
    }, // crDAI
    {
      address: "0x73CF8c5D14Aa0EbC89f18272A568319F5BAB6cBD",
      name: "crUSDC",
      decimals: 6,
    }, // crUSDC
    {
      address: "0xf976C9bc0E16B250E0B1523CffAa9E4c07Bc5C8a",
      name: "crUSDT",
      decimals: 6,
    }, // crUSDT
    {
      address: "0x5Dc3A30d8c5937f1529C3c93507C16d86A17072A",
      name: "crWBTC",
      decimals: 8,
    }, // crWBTC
    {
      address: "0x7ef18d0a9C3Fb1A716FF6c3ED0Edf52a2427F716",
      name: "crWETH",
      decimals: 18,
    }, // crWETH
    {
      address: "0x3FaE5e5722C51cdb5B0afD8c7082e8a6AF336Ee8",
      name: "crWMATIC",
      decimals: 18,
    },
  ];

  const totalBalances = {
    "0x27F8D03b3a2196956ED754baDc28D73be8830A6e": 0, // aDAI
    "0x1a13F4Ca1d028320A707D99520AbFefca3998b7F": 0, // aUSDC
    "0x60D55F02A771d515e077c9C2403a1ef324885CeC": 0, // aUSDT
    "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6": 0, // aWBTC
    "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619": 0, // aWETH
    "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270": 0, // aWMATIC
    "0x4eCEDdF62277eD78623f9A94995c680f8fd6C00e": 0, // crDAI
    "0x73CF8c5D14Aa0EbC89f18272A568319F5BAB6cBD": 0, // crUSDC
    "0xf976C9bc0E16B250E0B1523CffAa9E4c07Bc5C8a": 0, // crUSDT
    "0x5Dc3A30d8c5937f1529C3c93507C16d86A17072A": 0, // crWBTC
    "0x7ef18d0a9C3Fb1A716FF6c3ED0Edf52a2427F716": 0, // crWETH
    "0x3FaE5e5722C51cdb5B0afD8c7082e8a6AF336Ee8": 0, // crWMATIC
  };

  console.log(smartWallets.length);
  console.time("fetchBalances");

  for (const wallet of smartWallets) {
    const [, balancesA] = await getBalances(
      provider,
      supportedATokens.map((i) => i.address),
      wallet.address
    );

    for (const { address, decimals } of supportedATokens) {
      totalBalances[address] =
        totalBalances[address] + Number(balancesA[address]) / 10 ** decimals;
    }

    const [, balancesCR] = await getBalancesCR(
      provider,
      supportedCRTokens.map((i) => i.address),
      wallet.address
    );

    for (const { address, decimals } of supportedCRTokens) {
      totalBalances[address] =
        totalBalances[address] +
        Number(balancesCR[address]) / 1e18 / 10 ** decimals;
    }
  }

  for (const { address, name } of supportedATokens) {
    console.log(`${name}: `, String(totalBalances[address]));
  }

  for (const { address, name } of supportedCRTokens) {
    console.log(`${name}: `, String(totalBalances[address]));
  }

  console.timeEnd("fetchBalances");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
