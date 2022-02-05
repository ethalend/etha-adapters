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

module.exports = {
  getBalances,
};
