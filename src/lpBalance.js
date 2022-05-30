const ethers = require("ethers");
const { GraphQLClient } = require("graphql-request");
const { PAIR_DATA } = require("./utils/queries");
const { getQuickswapPoolInfo, formatCurrency } = require("./utils/util");

const quickClient = new GraphQLClient(
  "https://api.thegraph.com/subgraphs/name/sameepsi/quickswap06"
);

async function main() {

  const lpAddress = "0x096C5CCb33cFc5732Bcd1f3195C13dBeFC4c82f4";
  const totalUnderlying = "0.0295999717";

  const { usdValue } = await getQuickswapPoolInfo(
    lpAddress,
    ethers.utils.parseEther(totalUnderlying),
    quickClient,
    PAIR_DATA
  );

  _value = Number(usdValue);

  console.log(`USD value is: $ ${formatCurrency(_value, 2)}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
