import React, { Component } from "react";
import "./App.css";
import Web3 from "web3";
import Navbar from "./NavBar";
import EthSwap from "../abis/EthSwap.json";
import Token from "../abis/Token.json";
import Main from "./Main";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      account: "",
      token: null,
      ethBalance: "0",
      ethSwap: null,
      tokenBalance: "0",
      loading: true,
    };
    this.pollingInterval = null;
  }

  async componentDidMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
    this.pollingInterval = setInterval(async () => {
      await this.refreshBalances();
    }, 2000);
  }

  componentWillUnmount() {
    if (this.pollingInterval) clearInterval(this.pollingInterval);
  }

  loadWeb3 = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying MetaMask!",
      );
    }
  };

  // Helper to safely convert BigNumber or plain value to string
  toBalanceString = (value, web3) => {
    if (value && value._hex) {
      return web3.utils.hexToNumberString(value._hex);
    }
    return value.toString();
  };

  loadBlockchainData = async () => {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];
    const networkId = await web3.eth.net.getId();

    const tokenData = Token.networks[networkId];
    if (!tokenData) {
      window.alert("Token contract not deployed to dedicated network");
      return;
    }

    const ethSwapData = EthSwap.networks[networkId];
    if (!ethSwapData) {
      window.alert("EthSwap contract not deployed to dedicated network");
      return;
    }

    const token = new web3.eth.Contract(Token.abi, tokenData.address);
    const ethSwap = new web3.eth.Contract(EthSwap.abi, ethSwapData.address);

    const ethBalance = await web3.eth.getBalance(account);
    const tokenBalance = await token.methods.balanceOf(account).call();
    const tokenBalanceStr = this.toBalanceString(tokenBalance, web3);

    console.log("Initial tokenBalance:", tokenBalanceStr);

    this.setState({
      account,
      ethBalance,
      token,
      tokenBalance: tokenBalanceStr,
      ethSwap,
      loading: false,
    });
  };

  refreshBalances = async () => {
    if (!this.state.token || !this.state.account) return;

    const web3 = window.web3;
    const account = this.state.account;

    try {
      const ethBalance = await web3.eth.getBalance(account);
      const tokenBalance = await this.state.token.methods
        .balanceOf(account)
        .call();
      const tokenBalanceStr = this.toBalanceString(tokenBalance, web3);

      console.log("Refreshed tokenBalance:", tokenBalanceStr);

      this.setState({
        ethBalance,
        tokenBalance: tokenBalanceStr,
      });
    } catch (err) {
      console.error("Error refreshing balances:", err);
    }
  };

  buyTokens = async (etherAmount) => {
    try {
      await this.state.ethSwap.methods.buyTokens().send({
        from: this.state.account,
        value: etherAmount,
      });
      console.log("Buy complete, refreshing...");
      await this.refreshBalances();
    } catch (err) {
      console.error("Buy failed:", err);
    }
  };

  sellTokens = async (tokenAmount) => {
    try {
      const account = this.state.account;
      const ethSwapAddress = this.state.ethSwap.options.address;
      const tokenAddress = this.state.token.options.address;

      console.log("=== SELL START ===");
      console.log("Account:", account);
      console.log("Token address:", tokenAddress);
      console.log("EthSwap address:", ethSwapAddress);
      console.log("Token amount:", tokenAmount);

      // Check balance before
      const balBefore = await this.state.token.methods
        .balanceOf(account)
        .call();
      console.log("Balance before:", balBefore.toString());

      // Check EthSwap ETH balance
      const ethSwapEthBal = await window.web3.eth.getBalance(ethSwapAddress);
      console.log("EthSwap ETH balance:", ethSwapEthBal.toString());

      // Approve
      console.log("Sending approve transaction...");
      const approveTx = await this.state.token.methods
        .approve(ethSwapAddress, tokenAmount)
        .send({ from: account });
      console.log("Approve tx hash:", approveTx.transactionHash);
      console.log("Approve status:", approveTx.status);

      // Check allowance after approve
      const allowance = await this.state.token.methods
        .allowance(account, ethSwapAddress)
        .call();
      console.log("Allowance after approve:", allowance.toString());

      // Sell
      console.log("Sending sell transaction...");
      const sellTx = await this.state.ethSwap.methods
        .sellTokens(tokenAmount)
        .send({ from: account });
      console.log("Sell tx hash:", sellTx.transactionHash);
      console.log("Sell status:", sellTx.status);

      // Check balance after
      const balAfter = await this.state.token.methods.balanceOf(account).call();
      console.log("Balance after:", balAfter.toString());
      console.log("=== SELL COMPLETE ===");

      await this.refreshBalances();
    } catch (err) {
      console.error("=== SELL FAILED ===");
      console.error("Error message:", err.message);
      console.error("Full error:", err);
    }
  };
  render() {
    let content;

    if (this.state.loading) {
      content = (
        <p id="loader" className="text-center">
          Loading....
        </p>
      );
    } else {
      content = (
        <Main
          ethBalance={this.state.ethBalance}
          tokenBalance={this.state.tokenBalance}
          buyTokens={this.buyTokens}
          sellTokens={this.sellTokens}
        />
      );
    }

    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row justify-content-center">
            <div className="col-auto">{content}</div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
