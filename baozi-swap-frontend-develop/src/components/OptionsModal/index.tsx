import React, { useState } from 'react';
import Modal from 'react-modal';
import { observer } from 'mobx-react';

import CloseIcon from '../../assets/icons/close-icon.svg';
import { useMst } from '../../store/store';
import { Button } from '../index';

import './OptionsModal.scss';

const OptionsModal: React.FC = observer(() => {
  const [slippageError, setSlippageError] = useState({ isOpen: false, msg: '' });
  const { modals } = useMst();

  const closeModal = () => {
    modals.options.close();
  };

  const handleClickAuto = () => {
    modals.options.setSlippage('0.5');
  };

  const handleChangeSlippage = (e: any) => {
    if (!Number.isNaN(+e.target.value) || e.target.value === '.') {
      if (e.target.value[0] === '.') {
        modals.options.setSlippage(`0${e.target.value}`);
      } else {
        modals.options.setSlippage(e.target.value);
      }
    }

    if (+e.target.value > 20 || +e.target.value < 0.1) {
      setSlippageError({ isOpen: true, msg: 'value must be from 0.1 to 20' });
    } else if ((+e.target.value * 10) % 1 !== 0) {
      setSlippageError({ isOpen: true, msg: 'value must be a multiple of 0.1' });
    } else {
      setSlippageError({ isOpen: false, msg: '' });
    }
  };

  const handleChangeDeadline = (e: any) => {
    if (!Number.isNaN(+e.target.value)) {
      modals.options.setDeadline(e.target.value);
    }
  };

  const switchMultihops = () => {
    modals.options.switchMultihops();
  };

  return (
    <Modal
      className="options-modal"
      overlayClassName="overlay"
      isOpen={modals.options.isOpen}
      onRequestClose={closeModal}
      shouldCloseOnOverlayClick
      ariaHideApp={false}
    >
      <div className="options-modal__header">
        Transaction settings
        <Button onClick={closeModal} className="options-modal__header__btn">
          <img src={CloseIcon} alt="close icon" />
        </Button>
      </div>
      <div className="options-modal__title">Slippage tolerance</div>
      <div className="slippage">
        <Button className="slippage__auto" onClick={handleClickAuto}>
          Auto
        </Button>
        <div className="slippage__input">
          <input
            type="text"
            value={modals.options.slippage}
            placeholder="0.10"
            onChange={handleChangeSlippage}
          />
          %
        </div>
      </div>
      {slippageError.isOpen ? <div className="options-modal__error">{slippageError.msg}</div> : ''}
      <div className="options-modal__title">Transaction deadline</div>
      <div className="deadline">
        <div className="deadline__input">
          <input
            type="text"
            value={modals.options.deadline}
            placeholder="20"
            onChange={handleChangeDeadline}
          />
        </div>
        Minutes
      </div>
      <div className="options-modal__title">Interface settings</div>
      <div className="interface-settings">
        Disable Multihops
        <Button
          className={`interface-settings__switcher${modals.options.multihops ? '' : '-active'}`}
          onClick={switchMultihops}
        >
          <div
            className={`interface-settings__switcher${
              modals.options.multihops ? '' : '-active'
            }__dot `}
          />
        </Button>
      </div>
    </Modal>
  );
});

export default OptionsModal;
