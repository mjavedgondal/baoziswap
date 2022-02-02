import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import BigNumber from 'bignumber.js';
import { observer } from 'mobx-react';

import CloseImg from '../../assets/icons/close-icon.svg';
import { tokenList } from '../../config/tokens';
import { useTronLinkService } from '../../services/web3';
import { useMst } from '../../store/store';
import { TypeToken } from '../../types';
import { clogData } from '../../utils/logger';
import { Button } from '../index';

import './RemoveLiquidityModal.scss';

const RemoveLiquidityModal: React.FC = observer(() => {
  const [isLoading, setLoading] = useState(false);
  const [firstToken, setFirstToken] = useState({} as TypeToken);
  const [secondToken, setSecondToken] = useState({} as TypeToken);
  const { modals, user } = useMst();
  const connector = useTronLinkService().connectorService;

  const handleClose = () => {
    if (!isLoading) {
      modals.removeLiquidity.close();
    }
  };

  const handleConfirm = async () => {
    if (!isLoading) {
      try {
        setLoading(true);
        const res = await connector.removeLiquidity(
          firstToken.address,
          secondToken.address,
          modals.removeLiquidity.liquidityAmount,
          modals.removeLiquidity.firstTokenAmount,
          modals.removeLiquidity.secondTokenAmount,
          user.address,
          +modals.options.deadline,
          +modals.options.slippage / 100,
        );
        clogData('remove res:', res);
        modals.removeLiquidity.close();
        modals.info.setMsg('You have successfully removed your liquidity amount', 'success');
        setLoading(false);
      } catch (e: any) {
        modals.removeLiquidity.close();
        if (e.error && e.transaction) {
          modals.info.setMsg(e.error, 'error', e.transaction.txID);
        } else modals.info.setMsg('Something went wrong', 'error');
        clogData('remove error:', e);
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    [...tokenList, ...user.importedTokens].forEach((token) => {
      if (modals.removeLiquidity.tokenA === token.address) setFirstToken(token);
      if (modals.removeLiquidity.tokenB === token.address) setSecondToken(token);
    });
  }, [
    modals.removeLiquidity.firstTokenAmount,
    modals.removeLiquidity.secondTokenAmount,
    modals.removeLiquidity.tokenA,
    modals.removeLiquidity.tokenB,
    user.importedTokens,
  ]);

  return (
    <Modal
      isOpen={modals.removeLiquidity.isOpen}
      shouldCloseOnOverlayClick={!isLoading}
      ariaHideApp={false}
      className="remove-modal shadow-box"
      overlayClassName="overlay"
    >
      <div className="remove-modal__header">
        You will receive
        <Button onClick={handleClose} className="remove-modal__header__close">
          <img src={CloseImg} alt="close icon" />
        </Button>
      </div>
      <div className="remove-modal__token">
        <div className="remove-modal__token__amount">
          {new BigNumber(modals.removeLiquidity.firstTokenAmount)
            .dividedBy(10 ** modals.removeLiquidity.decimalsA)
            .toFixed(5, 1)}
        </div>
        <div className="shadow-btn">
          <img className="shadow-btn__logo" src={firstToken.logo} alt={firstToken.name} />
          {firstToken.symbol}
        </div>
      </div>
      <div className="white-circle">+</div>
      <div className="remove-modal__token">
        <div className="remove-modal__token__amount">
          {new BigNumber(modals.removeLiquidity.secondTokenAmount)
            .dividedBy(10 ** modals.removeLiquidity.decimalsB)
            .toFixed(5, 1)}
        </div>
        <div className="shadow-btn">
          <img className="shadow-btn__logo" src={secondToken.logo} alt={secondToken.name} />
          {secondToken.symbol}
        </div>
      </div>
      <div className="remove-modal__info">
        Output is estimated. If the price by more than {+modals.options.slippage || 0.5}% your
        transaction will revert 7
      </div>
      <div className="remove-modal__lp">
        <div className="remove-modal__lp__info">
          {firstToken.symbol}/{secondToken.symbol} Burned
        </div>
        <div className="remove-modal__lp__amount">
          <img src={firstToken.logo} alt={firstToken.name} />
          <img
            className="remove-modal__lp__amount__second-logo"
            src={secondToken.logo}
            alt={secondToken.name}
          />
          {new BigNumber(modals.removeLiquidity.liquidityAmount)
            .dividedBy(10 ** modals.removeLiquidity.decimalsLP)
            .toFixed(5, 1)}
        </div>
      </div>
      <div className="remove-modal__price">
        Price:
        <div className="remove-modal__price__list">
          1 {firstToken.symbol} ={' '}
          {new BigNumber(modals.removeLiquidity.firstTokenPrice).toFixed(5, 1)} {secondToken.symbol}
          <br />1 {secondToken.symbol} ={' '}
          {new BigNumber(modals.removeLiquidity.secondTokenPrice).toFixed(5, 1)} {firstToken.symbol}
        </div>
      </div>
      <Button onClick={handleConfirm} className="remove-modal__confirm brown-btn">
        {isLoading ? 'In progress...' : 'Confirm'}
      </Button>
    </Modal>
  );
});

export default RemoveLiquidityModal;
