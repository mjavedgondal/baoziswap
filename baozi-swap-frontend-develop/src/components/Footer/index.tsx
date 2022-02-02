import React from 'react';

import TelegramLogo from '../../assets/icons/tg-icon.svg';
import TwitterLogo from '../../assets/icons/tw-icon.svg';

import './Footer.scss';

const Footer: React.FC = () => (
  <footer>
    <div className="footer">
      <div className="footer__links">
        <a href="https://twitter.com/BaoziSwap" target="_blank" rel="noreferrer">
          <img src={TwitterLogo} alt="twitter icon" />
        </a>
        <a href="https://t.me/BAOZISWAP" target="_blank" rel="noreferrer">
          <img src={TelegramLogo} alt="telegram icon" />
        </a>
      </div>
      2021 BAOZISwap
    </div>
  </footer>
);

export default Footer;
