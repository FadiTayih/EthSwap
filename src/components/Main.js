import React, { Component } from "react";

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: "buy",
      inputAmount: "",
      outputAmount: "",
    };
  }

  switchTab = (tab) => {
    console.log("Switching to tab:", tab);
    this.setState({ activeTab: tab, inputAmount: "", outputAmount: "" });
  };

  handleInputChange = (e) => {
    const value = e.target.value;
    this.setState({ inputAmount: value });

    if (this.state.activeTab === "buy") {
      const output = value ? (parseFloat(value) * 100).toFixed(4) : "";
      this.setState({ outputAmount: output });
    } else {
      const output = value ? (parseFloat(value) / 100).toFixed(6) : "";
      this.setState({ outputAmount: output });
    }
  };

  handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const { activeTab, inputAmount } = this.state;

    console.log("=== SUBMIT ===", activeTab, inputAmount);

    if (!inputAmount || parseFloat(inputAmount) <= 0) {
      console.log("Invalid input amount");
      return;
    }

    if (activeTab === "buy") {
      const etherAmount = window.web3.utils.toWei(
        inputAmount.toString(),
        "ether",
      );
      console.log("Buying with etherAmount:", etherAmount);
      this.props.buyTokens(etherAmount);
    } else {
      const tokenAmount = window.web3.utils.toWei(
        inputAmount.toString(),
        "ether",
      );
      console.log("Selling tokenAmount:", tokenAmount);
      this.props.sellTokens(tokenAmount);
    }
  };

  formatBalance = (balance, decimals = 4) => {
    if (!balance) return "0.0000";
    const val = parseFloat(window.web3.utils.fromWei(balance, "ether"));
    return val.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  render() {
    const { activeTab, inputAmount, outputAmount } = this.state;
    const { ethBalance, tokenBalance } = this.props;

    const isBuy = activeTab === "buy";

    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;800&display=swap');

          :root {
            --bg: #f0f4ff;
            --surface: #ffffff;
            --surface2: #f8faff;
            --border: #dde3f5;
            --accent: #2563eb;
            --accent2: #7c3aed;
            --accent-glow: rgba(37, 99, 235, 0.12);
            --text: #0f172a;
            --text-muted: #64748b;
            --green: #059669;
            --red: #e11d48;
            --card-shadow: 0 0 0 1px var(--border), 0 20px 60px rgba(99,120,255,0.1);
          }

          * { box-sizing: border-box; margin: 0; padding: 0; }

          body {
            background: var(--bg);
            color: var(--text);
            font-family: 'Syne', sans-serif;
          }

          .swap-wrapper {
            min-height: calc(100vh - 56px);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px 16px;
            background:
              radial-gradient(ellipse 60% 40% at 70% 20%, rgba(124,58,237,0.07) 0%, transparent 60%),
              radial-gradient(ellipse 50% 50% at 20% 80%, rgba(37,99,235,0.07) 0%, transparent 60%),
              var(--bg);
          }

          .swap-header {
            text-align: center;
            margin-bottom: 36px;
          }

          .swap-header h1 {
            font-size: 2.4rem;
            font-weight: 800;
            letter-spacing: -0.03em;
            background: linear-gradient(135deg, #1e3a8a 30%, #7c3aed);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            line-height: 1.1;
          }

          .swap-header p {
            color: var(--text-muted);
            font-family: 'Space Mono', monospace;
            font-size: 0.75rem;
            margin-top: 6px;
            letter-spacing: 0.08em;
          }

          /* Balance Cards */
          .balance-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            width: 100%;
            max-width: 460px;
            margin-bottom: 16px;
          }

          .balance-card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 14px 16px;
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .balance-icon {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1rem;
            flex-shrink: 0;
          }

          .balance-icon.eth {
            background: rgba(37, 99, 235, 0.1);
            border: 1px solid rgba(37, 99, 235, 0.25);
            color: #2563eb;
          }

          .balance-icon.dapp {
            background: rgba(124, 58, 237, 0.1);
            border: 1px solid rgba(124, 58, 237, 0.25);
            color: #7c3aed;
          }

          .balance-info label {
            display: block;
            font-size: 0.65rem;
            font-family: 'Space Mono', monospace;
            color: var(--text-muted);
            letter-spacing: 0.1em;
            text-transform: uppercase;
          }

          .balance-info span {
            font-size: 0.9rem;
            font-weight: 600;
            color: var(--text);
            font-family: 'Space Mono', monospace;
          }

          /* Swap Card */
          .swap-card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 20px;
            padding: 24px;
            width: 100%;
            max-width: 460px;
            box-shadow: var(--card-shadow);
            position: relative;
            overflow: hidden;
          }

          .swap-card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, var(--accent), transparent);
            opacity: 0.3;
          }

          /* Tab switcher */
          .tab-switcher {
            display: grid;
            grid-template-columns: 1fr 1fr;
            background: var(--surface2);
            border-radius: 10px;
            padding: 4px;
            margin-bottom: 22px;
            border: 1px solid var(--border);
          }

          .tab-btn {
            padding: 9px;
            border: none;
            border-radius: 7px;
            background: transparent;
            color: var(--text-muted);
            font-family: 'Syne', sans-serif;
            font-size: 0.85rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            letter-spacing: 0.02em;
          }

          .tab-btn.active {
            background: var(--surface);
            color: var(--text);
            box-shadow: 0 1px 4px rgba(0,0,0,0.4);
            border: 1px solid var(--border);
          }

          .tab-btn.active.buy-active {
            color: var(--green);
          }

          .tab-btn.active.sell-active {
            color: var(--red);
          }

          /* Input groups */
          .token-input-group {
            background: var(--surface2);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 14px 16px;
            margin-bottom: 8px;
            transition: border-color 0.2s;
          }

          .token-input-group:focus-within {
            border-color: var(--accent);
            box-shadow: 0 0 0 3px var(--accent-glow);
          }

          .input-label-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
          }

          .input-label {
            font-size: 0.7rem;
            font-family: 'Space Mono', monospace;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.1em;
          }

          .input-max {
            font-size: 0.65rem;
            font-family: 'Space Mono', monospace;
            color: var(--accent);
            cursor: pointer;
            border: 1px solid rgba(37,99,235,0.25);
            background: rgba(37,99,235,0.07);
            padding: 2px 7px;
            border-radius: 4px;
            transition: all 0.15s;
          }

          .input-max:hover {
            background: rgba(37,99,235,0.15);
          }

          .input-row {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .token-input {
            flex: 1;
            background: transparent;
            border: none;
            outline: none;
            color: var(--text);
            font-family: 'Space Mono', monospace;
            font-size: 1.3rem;
            font-weight: 700;
            width: 100%;
          }

          .token-input::placeholder {
            color: var(--text-muted);
            font-weight: 400;
          }

          .token-badge {
            display: flex;
            align-items: center;
            gap: 6px;
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 20px;
            padding: 5px 10px 5px 5px;
            white-space: nowrap;
          }

          .token-dot {
            width: 22px;
            height: 22px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.7rem;
          }

          .token-dot.eth-dot {
            background: linear-gradient(135deg, #2563eb, #60a5fa);
            color: #fff;
          }

          .token-dot.dapp-dot {
            background: linear-gradient(135deg, #7c3aed, #a78bfa);
            color: #fff;
          }

          .token-symbol {
            font-size: 0.8rem;
            font-weight: 700;
            color: var(--text);
            font-family: 'Space Mono', monospace;
          }

          /* Arrow divider */
          .swap-arrow {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 20px;
            margin: 4px 0;
            color: var(--text-muted);
            font-size: 1rem;
          }

          /* Rate info */
          .rate-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 16px 0 20px;
            padding: 10px 14px;
            background: var(--surface2);
            border-radius: 8px;
            border: 1px solid var(--border);
          }

          .rate-info span {
            font-family: 'Space Mono', monospace;
            font-size: 0.72rem;
            color: var(--text-muted);
          }

          .rate-info .rate-value {
            color: var(--accent);
          }

          /* Submit button */
          .swap-btn {
            width: 100%;
            padding: 14px;
            border: none;
            border-radius: 12px;
            font-family: 'Syne', sans-serif;
            font-size: 1rem;
            font-weight: 800;
            cursor: pointer;
            letter-spacing: 0.04em;
            transition: all 0.2s;
            position: relative;
            overflow: hidden;
          }

          .swap-btn.buy-btn {
            background: linear-gradient(135deg, #059669, #10b981);
            color: #fff;
            box-shadow: 0 4px 20px rgba(16,185,129,0.3);
          }

          .swap-btn.buy-btn:hover {
            box-shadow: 0 6px 28px rgba(16,185,129,0.45);
            transform: translateY(-1px);
          }

          .swap-btn.sell-btn {
            background: linear-gradient(135deg, #be123c, #f43f5e);
            color: #fff;
            box-shadow: 0 4px 20px rgba(244,63,94,0.3);
          }

          .swap-btn.sell-btn:hover {
            box-shadow: 0 6px 28px rgba(244,63,94,0.45);
            transform: translateY(-1px);
          }

          .swap-btn:active {
            transform: translateY(0);
          }

          .swap-btn:disabled {
            opacity: 0.4;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
          }

          /* Footer note */
          .swap-footer {
            margin-top: 16px;
            text-align: center;
            font-family: 'Space Mono', monospace;
            font-size: 0.65rem;
            color: var(--text-muted);
            letter-spacing: 0.06em;
          }

          /* Animations */
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(16px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          .balance-row { animation: fadeUp 0.4s ease both; }
          .swap-card   { animation: fadeUp 0.4s ease 0.1s both; }
        `}</style>

        <div className="swap-wrapper">
          <div className="swap-header">
            <h1>EthSwap</h1>
            <p>DECENTRALIZED TOKEN EXCHANGE · RATE 1 ETH = 100 DAPP</p>
          </div>

          {/* Balance Cards */}
          <div className="balance-row">
            <div className="balance-card">
              <div className="balance-icon eth">Ξ</div>
              <div className="balance-info">
                <label>ETH Balance</label>
                <span>{this.formatBalance(ethBalance)} ETH</span>
              </div>
            </div>
            <div className="balance-card">
              <div className="balance-icon dapp">◈</div>
              <div className="balance-info">
                <label>DAPP Balance</label>
                <span>{this.formatBalance(tokenBalance)} DAPP</span>
              </div>
            </div>
          </div>

          {/* Swap Card */}
          <div className="swap-card">
            {/* Tab Switcher - outside form to prevent submit interference */}
            <div className="tab-switcher">
              <button
                type="button"
                className={`tab-btn ${isBuy ? "active buy-active" : ""}`}
                onClick={() => this.switchTab("buy")}
              >
                ↓ Buy DAPP
              </button>
              <button
                type="button"
                className={`tab-btn ${!isBuy ? "active sell-active" : ""}`}
                onClick={() => this.switchTab("sell")}
              >
                ↑ Sell DAPP
              </button>
            </div>

            <form onSubmit={this.handleSubmit}>
              {/* Input token */}
              <div className="token-input-group">
                <div className="input-label-row">
                  <span className="input-label">You Pay</span>
                  <button
                    type="button"
                    className="input-max"
                    onClick={() => {
                      const max = isBuy
                        ? window.web3.utils.fromWei(ethBalance || "0", "ether")
                        : window.web3.utils.fromWei(
                            tokenBalance || "0",
                            "ether",
                          );
                      this.setState({ inputAmount: max }, () =>
                        this.handleInputChange({ target: { value: max } }),
                      );
                    }}
                  >
                    MAX
                  </button>
                </div>
                <div className="input-row">
                  <input
                    type="number"
                    className="token-input"
                    placeholder="0.0"
                    min="0"
                    step="any"
                    value={inputAmount}
                    onChange={this.handleInputChange}
                  />
                  <div className="token-badge">
                    {isBuy ? (
                      <>
                        <div className="token-dot eth-dot">Ξ</div>
                        <span className="token-symbol">ETH</span>
                      </>
                    ) : (
                      <>
                        <div className="token-dot dapp-dot">◈</div>
                        <span className="token-symbol">DAPP</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="swap-arrow">⇅</div>

              {/* Output token */}
              <div className="token-input-group">
                <div className="input-label-row">
                  <span className="input-label">You Receive</span>
                </div>
                <div className="input-row">
                  <input
                    type="number"
                    className="token-input"
                    placeholder="0.0"
                    value={outputAmount}
                    readOnly
                  />
                  <div className="token-badge">
                    {isBuy ? (
                      <>
                        <div className="token-dot dapp-dot">◈</div>
                        <span className="token-symbol">DAPP</span>
                      </>
                    ) : (
                      <>
                        <div className="token-dot eth-dot">Ξ</div>
                        <span className="token-symbol">ETH</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Rate */}
              <div className="rate-info">
                <span>Exchange Rate</span>
                <span className="rate-value">
                  {isBuy ? "1 ETH = 100 DAPP" : "100 DAPP = 1 ETH"}
                </span>
              </div>

              {/* Submit */}
              <button
                type="button"
                className={`swap-btn ${isBuy ? "buy-btn" : "sell-btn"}`}
                disabled={!inputAmount || parseFloat(inputAmount) <= 0}
                onClick={this.handleSubmit}
              >
                {isBuy ? "Buy DAPP Tokens" : "Sell DAPP Tokens"}
              </button>
            </form>
          </div>

          <p className="swap-footer">
            Transactions are irreversible · Smart contract powered
          </p>
        </div>
      </>
    );
  }
}

export default Main;
