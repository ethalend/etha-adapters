const ethers = require("ethers");
const { GraphQLClient } = require("graphql-request");
const { quickVaultsData } = require("./utils/queries");
const ethaProtocol = new GraphQLClient(
  "https://api.thegraph.com/subgraphs/name/ethalend/etha-v1"
);

// ABIS
const stakingAdapterAbi = require("./abis/stakingAdapter.json");

// CONTRACTS
const STAKING_ADAPTER = "0x702CaC1a256B8d1ec13e9b39B55E560d69d813D1"

async function main() {
  const provider = ethers.getDefaultProvider("https://polygon-rpc.com"); // Polygon RPC for mainnet
  const adapter = new ethers.Contract(STAKING_ADAPTER, stakingAdapterAbi, provider);

  const { globalDatas } = await ethaProtocol.request(quickVaultsData);

  const lps = globalDatas.map(t => t.address);

  const stakingInfo = await adapter.getStakingInfo(lps);

  let i=0;

  for (const { stakingContract, totalSupply, rewardsRate, periodFinish, quickBalance } of stakingInfo) {
    console.log("\nLP TOKEN",lps[i])
    console.log("Staking Contract",stakingContract)
    console.log("Total LPs invested",+totalSupply*1e-18)
    console.log("reward per second", +rewardsRate*1e-18)
    console.log("periodFinish", new Date(+periodFinish*1000))
    console.log("dQuick contract bal", +quickBalance*1e-18)

    if(Math.floor(Date.now()/1000) > +periodFinish) console.log("REWARDS ENDED!!!!!")

    i++;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
