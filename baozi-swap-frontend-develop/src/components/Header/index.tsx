import React from 'react';
import { Link } from 'react-router-dom';
import { observer } from 'mobx-react';

import ImageLogo from '../../assets/images/header/logo.svg';
import { connectTron } from '../../services/connectWallet';
import { useMst } from '../../store/store';
import { Button } from '../index';

import './Header.scss';

const Header: React.FC = observer(() => {
  const { modals, user } = useMst();

  const handleOpenUserInfo = () => {
    modals.userInfo.open();
  };

  return (
    <header className="header">
      <div className="header__left">
        <Link to="/" className="header__left__logo">
          <img src={ImageLogo} alt="logo" />
        </Link>
      </div>
      <div className="header__right">
        <Button
          className="header__right__button"
          onClick={user.address ? handleOpenUserInfo : connectTron}
        >
          {user.address
            ? `${user.address.substr(0, 5)}...${user.address.substr(user.address.length - 4)}`
            : 'Connect wallet'}
        </Button>
      </div>
    </header>
  );
});

export default Header;
