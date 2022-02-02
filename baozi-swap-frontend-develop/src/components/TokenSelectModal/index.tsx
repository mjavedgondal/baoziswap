import React, { useCallback, useEffect, useState } from 'react';
import Modal from 'react-modal';
import { observer } from 'mobx-react';

import CloseIcon from '../../assets/icons/close-icon.svg';
import SearchIcon from '../../assets/icons/search-icon.svg';
import { TRXLogo } from '../../assets/icons/tokens';
import { tokenList } from '../../config/tokens';
import { tokensApi } from '../../services/api';
import { useTronLinkService } from '../../services/web3';
import { useMst } from '../../store/store';
import { clogData } from '../../utils/logger';
import { Button } from '../index';

import './TokenSelectModal.scss';

const TokenSelectModal: React.FC = observer(() => {
  const [isImport, setIsImport] = useState(false);
  const [importedAddress, setImportedAddress] = useState('');
  const [importedToken, setImportedToken] = useState({
    symbol: '',
    name: '',
    logo: TRXLogo,
    decimals: 0,
    isActive: false,
  });
  const [searchInput, setSearchInput] = useState('');
  const { modals, user } = useMst();
  const [tokens, setTokens] = useState<any[]>([]);
  const connector = useTronLinkService().connectorService;

  const closeModal = () => {
    modals.tokenSelect.close();
  };

  const handleInputSearch = (e: any) => {
    setSearchInput(e.target.value);
  };

  const handleInputAddress = async (e: any) => {
    setImportedAddress(e.target.value);
  };

  const handleSelectToken = (index: number) => {
    if (modals.tokenSelect.isIn) {
      user.setFirstIndex(index);
    } else user.setSecondIndex(index);
    closeModal();
  };

  const addImportedToken = async () => {
    if (
      !importedToken.isActive &&
      importedAddress.toLowerCase() !== 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'.toLowerCase()
    ) {
      const data = {
        token_address: importedAddress,
      };
      await tokensApi.addToken(data, user.address);
      const importedTokens = await tokensApi.getTokens(user.address);
      user.setImportedTokens([...importedTokens.data]);
      setTokens([...tokenList, ...user.importedTokens]);
      setIsImport(false);
    }
  };

  const getImportedToken = useCallback(async () => {
    try {
      const foundToken = tokens.filter((token) => token.address === importedAddress);
      const active = foundToken.length > 0;
      const tokenContract = await connector.getContract(importedAddress);
      const symbol = await tokenContract.symbol().call();
      const name = await tokenContract.name().call();
      const decimals = await tokenContract.decimals().call();
      setImportedToken((prev) => ({
        ...prev,
        symbol,
        name,
        decimals,
        isActive: active,
      }));
    } catch (e: any) {
      clogData('getImportedToken error:', e);
    }
  }, [connector, importedAddress, tokens]);

  useEffect(() => {
    if (importedAddress[0] === 'T' && importedAddress.length === 34) {
      getImportedToken();
    }
  }, [getImportedToken, importedAddress]);

  useEffect(() => {
    if (modals.tokenSelect.isOpen) {
      setTokens([...tokenList, ...user.importedTokens]);
    }
  }, [modals.tokenSelect.isOpen, user.importedTokens]);

  return (
    <Modal
      isOpen={modals.tokenSelect.isOpen}
      className="token-select"
      onRequestClose={closeModal}
      ariaHideApp={false}
      shouldCloseOnOverlayClick
      overlayClassName="overlay"
    >
      <div className="token-select__header">
        Select a token
        <Button onClick={closeModal} className="token-select__header__btn">
          <img src={CloseIcon} alt="close icon" />
        </Button>
      </div>
      <div className="token-select__search">
        <img src={SearchIcon} alt="search icon" />
        {isImport ? (
          <input
            type="text"
            placeholder="Search address"
            value={importedAddress}
            onChange={handleInputAddress}
          />
        ) : (
          <input
            type="text"
            placeholder="Search name"
            value={searchInput}
            onChange={handleInputSearch}
          />
        )}
      </div>
      {isImport ? (
        <>
          {importedToken.symbol ? (
            <Button className="token-select__list__item" onClick={addImportedToken}>
              <div className="token-select__list__item__data">
                <div className="token-select__list__item__logo">
                  <img src={importedToken.logo} alt="token logo" />
                </div>
                <div className="token-select__list__item__info">
                  <div className="token-select__list__item__info__name">{importedToken.name}</div>
                  <div className="token-select__list__item__info__symbol">
                    {importedToken.symbol}
                  </div>
                </div>
              </div>
              {importedToken.isActive ? (
                <div className="token-select__list__item__active">Active</div>
              ) : (
                ''
              )}
            </Button>
          ) : (
            <div className="token-select__no-item">No tokens found</div>
          )}
        </>
      ) : (
        <div className="token-select__list">
          {tokens.map((token, index) => {
            return token.name.toLowerCase().includes(searchInput.toLowerCase()) &&
              index !==
                (modals.tokenSelect.isIn ? user.tokenIndex.second : user.tokenIndex.first) ? (
              <Button
                key={`${token.name}-${index + 1}`}
                className="token-select__list__item"
                onClick={() => handleSelectToken(index)}
              >
                <div className="token-select__list__item__data">
                  <div className="token-select__list__item__logo">
                    <img src={token.logo || TRXLogo} alt="token logo" />
                  </div>
                  <div className="token-select__list__item__info">
                    <div className="token-select__list__item__info__name">{token.name}</div>
                    <div className="token-select__list__item__info__symbol">{token.symbol}</div>
                  </div>
                </div>
              </Button>
            ) : (
              ''
            );
          })}
        </div>
      )}
      <div className="token-select__import-token">
        <Button className="yellow-btn" onClick={() => setIsImport(!isImport)}>
          {isImport ? 'Close import' : 'Import token'}
        </Button>
      </div>
    </Modal>
  );
});

export default TokenSelectModal;
