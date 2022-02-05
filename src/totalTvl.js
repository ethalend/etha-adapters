const ethers = require("ethers");
const { GraphQLClient } = require("graphql-request");
const { abi: curvePoolAbi } = require("./abis/curvePool.json");
const { default: axios } = require("axios");
const { PAIR_DATA, globalData } = require("./utils/queries");

const ethaProtocol = new GraphQLClient(
  "https://api.thegraph.com/subgraphs/name/ethalend/etha-v1"
);

const quickClient = new GraphQLClient(
  "https://api.thegraph.com/subgraphs/name/sameepsi/quickswap06"
);

const CURVE_POOL = "0x445FE580eF8d70FF569aB36e80c647af338db351";

const getQuickswapPoolInfo = async (token, lpBalance, priceData) => {
  try {
    const {
      pairs: [pair],
    } = await quickClient.request(PAIR_DATA(token.toLowerCase()));

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
    error.message;
  }
};

async function main() {
  const provider = ethers.getDefaultProvider("https://polygon-rpc.com"); // Polygon RPC for mainnet
  const { globalDatas } = await ethaProtocol.request(globalData);
  const { data } = await axios.get("https://ethalend.com/api/strategy/prices");
  globalDatas;
  data.data;

  let _tvl = 0;

  console.time("FetchingTVL");
  for (let i = 0; i < globalDatas.length; i++) {
    let { symbol, address, type, totalUnderlying } = globalDatas[i];

    let _value = 0;

    if (type === "eVault") {
      if (symbol === "UNI-V2") {
        const { usdValue } = await getQuickswapPoolInfo(
          address,
          ethers.utils.parseEther(totalUnderlying),
          data.data
        );

        _value = Number(usdValue);
      } else {
        const curvePool = new ethers.Contract(
          CURVE_POOL,
          curvePoolAbi,
          provider
        );
        const lpPrice = await curvePool.get_virtual_price();

        _value =
          Number(totalUnderlying) *
          Number(ethers.utils.formatUnits(lpPrice, 18));
      }
    }

    if (type === "lending") {
      _value =
        Number(totalUnderlying) *
        Number(data.data[symbol === "MATIC" ? "WMATIC" : symbol]);
    }

    if (type === "staking") {
      if (symbol === "UNI-V2") {
        const {
          pairs: [pair],
        } = await quickClient.request(PAIR_DATA(address.toLowerCase()));

        const token0Price = data.data[pair.token0.symbol];
        const token1Price = data.data[pair.token1.symbol];

        const share = Number(totalUnderlying) / Number(pair.totalSupply);

        _value =
          share *
          (token0Price * Number(pair.reserve0) +
            token1Price * Number(pair.reserve1));
      }

      if (symbol === "am3CRV") {
        const curvePool = new ethers.Contract(
          CURVE_POOL,
          curvePoolAbi,
          provider
        );

        const lpPrice = await curvePool.get_virtual_price();

        _value =
          Number(totalUnderlying) *
          Number(ethers.utils.formatUnits(lpPrice, 18));
      }

      if (symbol === "ETHA") {
        _value = Number(totalUnderlying) * data.data["ETHA"];
      }
    }

    _tvl += _value;
  }
  console.log(`The total TVL is: $ ${_tvl.toFixed(2)}`);
  console.timeEnd("FetchingTVL");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
