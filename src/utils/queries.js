const { gql } = require("graphql-tag");

const globalData = gql`
  query {
    globalDatas(first: 100) {
      symbol
      address
      type
      totalUnderlying
      totalVolumeUSD
    }
  }
`;

const walletQuery = gql`
  query {
    smartWallets(first: 1000) {
      owner
      address
    }
  }
`;

const PAIR_DATA = (pair) => {
  return gql`
    query  {
      pairs(where:{id:"${pair}"}) {
          id
          token0{id symbol derivedETH}
          token1{id symbol, derivedETH}
          reserve0
          reserve1
          totalSupply
          token0Price
          token1Price
      }
    }
  `;
};

module.exports = {
  globalData,
  PAIR_DATA,
  walletQuery,
};
