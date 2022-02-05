const { defaultAbiCoder } = require("ethers/lib/utils");

const { MultiTokenBalanceGetter } = require("./bytecode.json");

async function getBalances(provider_, tokens, account) {
  const provider = provider_;
  const inputData = defaultAbiCoder.encode(
    ["address[]", "address"],
    [tokens, account]
  );
  const bytecode = MultiTokenBalanceGetter.concat(inputData.slice(2));
  const encodedReturnData = await provider.call({ data: bytecode });
  const [blockNumber, decodedReturnData] = defaultAbiCoder.decode(
    ["uint256", "uint256[]"],
    encodedReturnData
  );

  const balances = {};

  for (let i = 0; i < tokens.length; i++) {
    balances[tokens[i]] = decodedReturnData[i];
  }

  return [blockNumber.toNumber(), balances];
}

async function getQuickswapPoolInfo(
  token,
  lpBalance,
  priceData,
  client,
  PAIR_DATA
) {
  try {
    const {
      pairs: [pair],
    } = await client.request(PAIR_DATA(token.toLowerCase()));

    const token0Price = priceData[pair.token0.symbol];
    const token1Price = priceData[pair.token1.symbol];

    const userShare = +lpBalance / pair.totalSupply / 1e18;

    const usdValueQuick =
      userShare * (token0Price * pair.reserve0 + token1Price * pair.reserve1);

    return {
      usdValue: usdValueQuick,
      reserves: {
        [pair.token0.symbol]: pair.reserve0,
        [pair.token1.symbol]: pair.reserve1,
      },
    };
  } catch (error) {
    console.log(error.message);
  }
}

module.exports = {
  getBalances,
  getQuickswapPoolInfo,
};
