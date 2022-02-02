import React, { useState } from 'react';
import Modal from 'react-modal';
import { observer } from 'mobx-react';

import CloseIcon from '../../assets/icons/close-icon.svg';
import CopyIcon from '../../assets/icons/user-info/copy-icon.svg';
import LinkIcon from '../../assets/icons/user-info/link-icon.svg';
import LogOutIcon from '../../assets/icons/user-info/logout-icon.svg';
import { isProduction } from '../../config';
import { useMst } from '../../store/store';
import { Button } from '../index';

import './UserInfoModal.scss';

const UserInfoModal: React.FC = observer(() => {
  const [isCopied, setIsCopied] = useState(false);
  const { modals, user } = useMst();

  const closeModal = () => {
    modals.userInfo.close();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(user.address).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleDisconnect = () => {
    user.disconnect();
    closeModal();
  };

  return (
    <Modal
      className="user-info"
      isOpen={modals.userInfo.isOpen}
      onRequestClose={closeModal}
      ariaHideApp={false}
      shouldCloseOnOverlayClick
      overlayClassName="overlay"
    >
      <div className="user-info__header">
        Account
        <Button className="user-info__header__btn" onClick={closeModal}>
          <img src={CloseIcon} alt="close icon" />
        </Button>
      </div>
      Connected with TronLink
      <div className="user-info__address">
        {`${user.address.substr(0, 7)}...${user.address.substr(user.address.length - 4)}`}
      </div>
      <div className="user-info__buttons">
        {isCopied ? <div className="is-copied">Address copied to clipboard</div> : ''}
        <Button className="user-info__buttons__btn" onClick={copyToClipboard}>
          <img src={CopyIcon} alt="copy icon" />
          Copy address
        </Button>
        <a
          href={`https://${isProduction ? '' : 'shasta.'}tronscan.org/#/wallet`}
          className="user-info__buttons__btn"
          target="_blank"
          rel="noreferrer"
        >
          <img src={LinkIcon} alt="link icon" />
          View on Tronscan
        </a>
        <Button className="user-info__buttons__btn" onClick={handleDisconnect}>
          <img src={LogOutIcon} alt="logout icon" />
          Disconnect
        </Button>
      </div>
    </Modal>
  );
});

export default UserInfoModal;
