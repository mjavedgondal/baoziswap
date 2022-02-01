import React from 'react';

import { ReactComponent as ImageLogo } from '../../assets/images/header/logo.svg';

import s from './style.module.scss';

const Header: React.FC = () => {
  return (
    <div className={s.header}>
      <div className={s.headerLeft}>
        <div className={s.logo}>
          <ImageLogo />
        </div>
      </div>
      <div className={s.headerRight}>
        <div className={s.button}>
          <div className={s.textButton}>Connect wallet</div>
        </div>
      </div>
    </div>
  );
};

export default Header;
