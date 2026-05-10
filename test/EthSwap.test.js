const Token = artifacts.require("Token");
const EthSwap = artifacts.require("EthSwap");

require("chai")
  .use(require("chai-as-promised"))
  .should();

function tokens(n) {
  return web3.utils.toWei(n, "ether");
}

contract("EthSwap", ([deployer, investor]) => {
  let token, ethSwap;

  before(async () => {
    token = await Token.new();
    ethSwap = await EthSwap.new(token.address);

    // Transfer tokens to EthSwap
    await token.transfer(ethSwap.address, tokens("1000000"));

    // Seed EthSwap with 10 ETH (not 50, tests don't need that much)
    await web3.eth.sendTransaction({
      from: deployer,
      to: ethSwap.address,
      value: tokens("10"),
    });
  });

  describe("EthSwap deployment", async () => {
    it("contract has name", async () => {
      const name = await ethSwap.name();
      assert.equal(name, "EthSwap Exchange");
    });
  });

  describe("Token deployment", async () => {
    it("contract has name", async () => {
      const name = await token.name();
      assert.equal(name, "DApp Token");
    });

    it("contract has token", async () => {
      let balance = await token.balanceOf(ethSwap.address);
      assert.equal(balance.toString(), tokens("1000000"));
    });
  });

  describe("buyToken()", async () => {
    let result;
    before(async () => {
      result = await ethSwap.buyTokens({
        from: investor,
        value: tokens("1"),
      });
    });

    it("Allows users to instantly purchase tokens from ethswap for a fixed price", async () => {
      let investorBalance = await token.balanceOf(investor);
      assert.equal(investorBalance.toString(), tokens("100"));

      let ethSwapTokenBalance = await token.balanceOf(ethSwap.address);
      assert.equal(ethSwapTokenBalance.toString(), tokens("999900"));

      let ethSwapEthBalance = await web3.eth.getBalance(ethSwap.address);
      assert.equal(ethSwapEthBalance.toString(), tokens("11")); // 10 seeded + 1 from buy

      const event = result.logs[0].args;
      assert.equal(event.account, investor);
      assert.equal(event.token, token.address);
      assert.equal(event.amount.toString(), tokens("100").toString());
      assert.equal(event.rate.toString(), "100");
    });
  });

  describe("sellToken()", async () => {
    let result;
    before(async () => {
      await token.approve(ethSwap.address, tokens("100"), { from: investor });
      result = await ethSwap.sellTokens(tokens("100"), { from: investor });
    });

    it("Allows users to instantly sell tokens to ethswap for a fixed price", async () => {
      let investorBalance = await token.balanceOf(investor);
      assert.equal(investorBalance.toString(), tokens("0"));

      let ethSwapTokenBalance = await token.balanceOf(ethSwap.address);
      assert.equal(ethSwapTokenBalance.toString(), tokens("1000000"));

      let ethSwapEthBalance = await web3.eth.getBalance(ethSwap.address);
      assert.equal(ethSwapEthBalance.toString(), tokens("10")); // back to 10 after sell

      const event = result.logs[0].args;
      assert.equal(event.account, investor);
      assert.equal(event.token, token.address);
      assert.equal(event.amount.toString(), tokens("100").toString());
      assert.equal(event.rate.toString(), "100");

      await ethSwap.sellTokens(tokens("500"), { from: investor }).should.be
        .rejected;
    });
  });
});
