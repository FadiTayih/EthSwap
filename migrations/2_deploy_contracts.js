const Token = artifacts.require("Token");
const EthSwap = artifacts.require("EthSwap");

module.exports = async function(deployer, network, accounts) {
  await deployer.deploy(Token);
  const token = await Token.deployed();

  await deployer.deploy(EthSwap, token.address);
  const ethSwap = await EthSwap.deployed();

  await token.transfer(ethSwap.address, "1000000000000000000000000");

  // ← Only seed 5 ETH, safe for any balance
  await web3.eth.sendTransaction({
    from: accounts[0],
    to: ethSwap.address,
    value: web3.utils.toWei("5", "ether"),
  });
};
