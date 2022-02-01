import React, { memo } from 'react';

import { ReactComponent as IconArrowDownBlack } from '../../../assets/icons/arrow-down-black.svg';
import { ReactComponent as IconArrowDownWhite } from '../../../assets/icons/arrow-down-white.svg';
import { ReactComponent as IconSettings } from '../../../assets/icons/form/settings.svg';
import { ReactComponent as IconSwap } from '../../../assets/icons/form/swap.svg';
import imageEth from '../../../assets/images/form/currencies/eth.png';
import { Button } from '../../../components';

import s from './style.module.scss';

const Form: React.FC = () => {
  return (
    <section className={s.container}>
      <div className={s.header}>
        <div className={s.title}>SWAP</div>
        <div className={s.settings}>
          <IconSettings />
        </div>
      </div>
      <div className={s.inputs}>
        <div className={s.bigInput}>
          <input className={s.input} type="text" placeholder="0.0" />
          <div className={s.select}>
            {/*<div className={s.buttonSelect}>*/}
            {/*  <img className={s.imageButtonSelect} src={imageEth} alt="" />*/}
            {/*  <div className={s.textButtonSelect}>ETH</div>*/}
            {/*  <IconArrowDownBlack className={s.arrowButtonSelect} />*/}
            {/*</div>*/}
            <Button inverted style={{ height: 44, borderRadius: 20, padding: '6px 12px' }}>
              <img className={s.imageButtonSelect} src={imageEth} alt="" />
              <div className={s.textButtonSelect}>ETH</div>
              <IconArrowDownBlack className={s.arrowButtonSelect} />
            </Button>
          </div>
        </div>
        <div className={s.buttonSwap}>
          <IconSwap />
        </div>
        <div className={s.bigInput}>
          <input className={s.input} type="text" placeholder="0.0" />
          <div className={s.select}>
            <div className={s.buttonSelect} style={{ background: '#E5AC4B', color: '#FFFFFF' }}>
              <div className={s.textButtonSelect}>Select a currency</div>
              <div className={s.wrapperArrowButtonSelect}>
                <IconArrowDownWhite className={s.arrowButtonSelect} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={s.buttons}>
        <Button style={{ height: 65 }}>Connect wallet</Button>
      </div>
    </section>
  );
};

export default memo(Form);
