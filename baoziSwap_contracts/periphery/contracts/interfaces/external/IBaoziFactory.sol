pragma solidity >=0.5.0;

import './IEventEmitter.sol';

interface IBaoziFactory {

    function feeTo() external view returns (address);
    function feeToSetter() external view returns (address);
    function eventEmitter() external view returns (IEventEmitter);

    function getPair(address tokenA, address tokenB) external view returns (address pair);
    function getFeeAddress(address token) external view returns (address owner);
    function allPairs(uint) external view returns (address pair);
    function allPairsLength() external view returns (uint);

    function createPair(address tokenA, address tokenB) external returns (address pair);

    function setFeeTo(address) external;
    function setFeeToSetter(address) external;
    function setTokensDev(address[] calldata tokenAddress, address[] calldata devAddress) external;
}
