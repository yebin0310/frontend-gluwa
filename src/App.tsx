import './style/index.scss';
import React, { useState, useEffect } from 'react';
import { TokenSelector } from './component/TokenSelector';

const Main: React.FC = () => {
  const [isTokenSelectorOpen, setIsTokenSelectorOpen] = useState(false);
  const [youPayCurrency, setYouPayCurrency] = useState('CTC');
  const [youReceiveCurrency, setYouReceiveCurrency] = useState('');
  const [youPayAmount, setYouPayAmount] = useState<number | ''>(0);
  const [youReceiveAmount, setYouReceiveAmount] = useState<number | ''>(0);
  const [balance, setBalance] = useState<{ [key: string]: number }>({});
  const [price, setPrice] = useState<{ [key: string]: number }>({});

  // API 호출: 잔액과 가격 정보 가져오기
  useEffect(() => {
    const fetchBalance = async () => {
      const res = await fetch('https://inhousedashboard-test-app.azurewebsites.net/api/Interview/get-balance');
      const data = await res.json();
      setBalance(data);
    };

    const fetchPrice = async () => {
      const res = await fetch('https://inhousedashboard-test-app.azurewebsites.net/api/Interview/get-price');
      const data = await res.json();
      setPrice(data);
    };

    fetchBalance();
    fetchPrice();
  }, []);

  // 금액 입력 시 "You receive" 통화 수량 계산
  useEffect(() => {
    if (youPayAmount && youPayCurrency && youReceiveCurrency && price[youPayCurrency] && price[youReceiveCurrency]) {
      const totalValue = youPayAmount * price[youPayCurrency];
      setYouReceiveAmount(totalValue / price[youReceiveCurrency]);
    } else {
      setYouReceiveAmount(0);
    }
  }, [youPayAmount, youPayCurrency, youReceiveCurrency, price]);

  // 스왑 동작
  const handleSwap = async () => {
    if (youPayCurrency && youReceiveCurrency && youPayAmount && balance[youPayCurrency] >= youPayAmount) {
      await fetch('https://inhousedashboard-test-app.azurewebsites.net/api/Interview/post-swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: youPayCurrency, to: youReceiveCurrency, amount: youPayAmount }),
      });
      // 잔액 재로딩
      const res = await fetch('https://inhousedashboard-test-app.azurewebsites.net/api/Interview/get-balance');
      const data = await res.json();
      setBalance(data);
    }
  };

  // 토큰 선택 이벤트 핸들러
  const handleTokenSelect = (token: string) => {
    if (!youPayCurrency) {
      setYouPayCurrency(token);
    } else {
      setYouReceiveCurrency(token);
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
              {/* You Pay */}
              <div className="swap-item active">
                <div className="title">
                  <h3>You pay</h3>
                </div>

                <div className="amount-input">
                  <div className="input">
                    <input
                      type="number"
                      placeholder='0'
                      value={youPayAmount}
                      onChange={(e) => setYouPayAmount(Number(e.target.value))}
                    />
                  </div>
                  <button
                    type="button"
                    className="currency-label"
                    onClick={() => { setIsTokenSelectorOpen(true); }}
                  >
                    <div className={`token ${youPayCurrency}`} data-token-size="28"></div>
                    <strong className="name">{youPayCurrency || 'Select token'}</strong>
                  </button>
                </div>

                <div className="amount item-flex">
                  <div className="rt">
                    <div className="balance">
                      <span>Balance: {balance[youPayCurrency] || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Swap Arrow */}
              <button type="button" className="mark" onClick={() => {
                setYouPayCurrency(youReceiveCurrency);
                setYouReceiveCurrency(youPayCurrency);
              }}>
                <i className="blind">swap</i>
              </button>

              {/* You Receive */}
              <div className="swap-item">
                <div className="title">
                  <h3>You receive</h3>
                </div>

                <div className="amount-input">
                  <div className="input">
                    <input type="number" placeholder='0' value={youReceiveAmount} readOnly />
                  </div>
                  <button
                    type="button"
                    className="currency-label select"
                    onClick={() => { setIsTokenSelectorOpen(true); }}
                  >
                    {youReceiveCurrency || 'Select token'}
                  </button>
                </div>

                <div className="item-flex amount">
                  <div className="rt">
                    <div className="balance">
                      <span>Balance: {balance[youReceiveCurrency] || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Swap Button */}
              <div className="button-wrap">
                <button
                  type="button"
                  className="normal"
                  disabled={!youPayAmount || youPayAmount > (balance[youPayCurrency] || 0) || !youReceiveCurrency}
                  onClick={handleSwap}
                >
                  Swap
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Token Selector Modal */}
      {isTokenSelectorOpen && (
        <TokenSelector onClose={() => setIsTokenSelectorOpen(false)} onSelect={handleTokenSelect} />
      )}
    </>
  );
}

export { Main as default };
