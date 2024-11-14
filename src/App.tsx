import './style/index.scss';
import React, { useState, useEffect } from 'react';
import { TokenSelector } from './component/TokenSelector';
import axios from 'axios';

const Main: React.FC = () => {
  const [isTokenSelectorOpen, setIsTokenSelectorOpen] = useState(false);
  const [balances, setBalances] = useState<{ [key: string]: number }>({});
  const [prices, setPrices] = useState<{ [key: string]: string }>({});
  const [payAmount, setPayAmount] = useState(0);
  const [receiveAmount, setReceiveAmount] = useState(0);
  const [payToken, setPayToken] = useState('CTC');
  const [receiveToken, setReceiveToken] = useState('USDC');
  const [isSwapEnabled, setIsSwapEnabled] = useState(false);
  const [tokenTypeToSelect, setTokenTypeToSelect] = useState<'pay' | 'receive'>('pay');

  const toggleTokenSelectorOpen = (type: 'pay' | 'receive') => {
    setTokenTypeToSelect(type);
    setIsTokenSelectorOpen(true);
  };

  //잔액 가져오기
  useEffect(() => {
    axios.get('https://inhousedashboard-test-app.azurewebsites.net/api/Interview/get-balance')
      .then((response) => {
        setBalances(response.data);
      })
      .catch((error) => console.error('Error fetching balances:', error));
  }, []);

  //통화 값 가져오기
  useEffect(() => {
    axios.get('https://inhousedashboard-test-app.azurewebsites.net/api/Interview/get-price')
      .then((response) => {
        setPrices(response.data);
      })
      .catch((error) => console.error('Error fetching prices:', error));
  }, []);

  // 금액에 따른 값 계산 식
  useEffect(() => {
    if (payAmount > 0 && payToken && receiveToken && prices[payToken] && prices[receiveToken]) {
      const payValue = payAmount * parseFloat(prices[payToken] || '0');
      const receive = payValue / parseFloat(prices[receiveToken] || '0');
      setReceiveAmount(receive);
      setIsSwapEnabled(payAmount <= (balances[payToken] || 0));
    }
  }, [payAmount, payToken, receiveToken, prices, balances]);

  const handlePayAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) {
      setPayAmount(0);
    } else {
      setPayAmount(numValue);
    }
  };

  const handleSwap = () => {
    if (isSwapEnabled) {
      axios.post('https://inhousedashboard-test-app.azurewebsites.net/api/Interview/post-swap', {
        from: payToken,
        to: receiveToken,
        amount: payAmount,
      })
        .then((response) => {
          console.log('Swap successful:', response);
          alert(response.data.message);
        })
        .catch((error) => {
          console.error('Error performing swap:', error);
          alert(error);
        });
    }
  };

  const handleSwapTokens = () => {
    setPayToken(receiveToken);
    setReceiveToken(payToken);
  };

  const handleTokenSelect = (token: string) => {
    if (tokenTypeToSelect === 'pay') {
      setPayToken(token);
    } else {
      setReceiveToken(token);
    }
    setIsTokenSelectorOpen(false);
  };

  return (
    <>
      <div>
        <section className="page swap-page">
          <div className="box-content">
            <div className="heading">
              <h2>Swap</h2>
            </div>

            <div className="swap-dashboard">
              <div className="swap-item active">
                <div className="title">
                  <h3>You pay</h3>
                </div>
                <div className="amount-input">
                  <div className="input">
                    <input
                      type="number"
                      value={payAmount === 0 ? '' : payAmount}
                      onChange={handlePayAmountChange}
                      placeholder="0"
                    />
                  </div>
                  <button type="button" className="currency-label" onClick={() => toggleTokenSelectorOpen('pay')}>
                    <div className="token CTC" data-token-size="28"></div>
                    <strong className="name">{payToken}</strong>
                  </button>
                </div>

                <div className="amount item-flex">
                  <div className="lt"></div>
                  <div className="rt">
                    <div className="balance">
                      <span>Balance: {balances[payToken] || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              <button type="button" className="mark" onClick={handleSwapTokens}>
                <i className="blind">swap</i>
              </button>

              <div className="swap-item">
                <div className="title">
                  <h3>You receive</h3>
                </div>

                <div className="amount-input">
                  <div className="input">
                    <input
                      type="number"
                      value={receiveAmount}
                      readOnly
                      placeholder="0"
                    />
                  </div>
                  <button type="button" className="currency-label select" onClick={() => toggleTokenSelectorOpen('receive')}>
                    {receiveToken}
                  </button>
                </div>

                <div className="item-flex amount">
                  <div className="rt">
                    <div className="balance">
                      <span>Balance: {balances[receiveToken] || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="button-wrap">
                <button
                  type="button"
                  className="normal"
                  disabled={!isSwapEnabled}
                  onClick={handleSwap}
                >
                  Swap
                </button>
              </div>

            </div>
          </div>
        </section>
      </div>
      {isTokenSelectorOpen && (
        <TokenSelector
          onClose={() => setIsTokenSelectorOpen(false)}
          onSelectToken={(token) => handleTokenSelect(token)}
        />
      )}
    </>
  );
};

export { Main as default };
