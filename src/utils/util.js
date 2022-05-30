const { defaultAbiCoder } = require("ethers/lib/utils");
const axios = require("axios")

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

const getEthPrice = async () => {
  try {
    const { data } = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price',
      {
        params: {
          ids: 'ethereum',
          vs_currencies: 'usd',
        },
      }
    );
    return +data['ethereum'].usd;
  } catch (error) {
    console.log('Error Fetching Eth Price');
    console.log(error.message);
    return 0;
  }
};

async function getQuickswapPoolInfo(
  token,
  lpBalance,
  client,
  PAIR_DATA
) {
  try {

    const ETH_PRICE = await getEthPrice();
    const {
      pairs: [pair],
    } = await client.request(PAIR_DATA(token.toLowerCase()));

    const token0Price = +pair.token0.derivedETH*ETH_PRICE;
    const token1Price = +pair.token1.derivedETH*ETH_PRICE;

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

const formatCurrency = (value, minimumFractionDigits = 2) => {
	const formatter = new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits,
	});

	return formatter.format(value);
};

module.exports = {
  getBalances,
  getQuickswapPoolInfo,
  formatCurrency
};
