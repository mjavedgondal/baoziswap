import React from 'react';
import Modal from 'react-modal';
import { observer } from 'mobx-react';

import { isProduction } from '../../config';
import { useMst } from '../../store/store';
import { Button } from '../index';

import './InfoModal.scss';

const InfoModal: React.FC = observer(() => {
  const { modals } = useMst();

  const closeModal = () => {
    modals.info.close();
  };

  return (
    <Modal
      className="info-modal"
      overlayClassName="overlay"
      isOpen={!!modals.info.msg}
      onRequestClose={closeModal}
      ariaHideApp={false}
      shouldCloseOnOverlayClick
    >
      <div className="info-modal__message">{modals.info.msg}</div>
      {modals.info.tx ? (
        <a
          className="info-modal__tx brown-btn"
          href={`https://${isProduction ? '' : 'shasta.'}tronscan.org/#/transaction/${
            modals.info.tx
          }`}
          target="_blank"
          rel="noreferrer"
        >
          See transaction info
        </a>
      ) : (
        ''
      )}
      <Button onClick={closeModal} className="info-modal__btn">
        {modals.info.type === 'error' ? 'OK' : 'Awesome'}
      </Button>
    </Modal>
  );
});

export default InfoModal;
