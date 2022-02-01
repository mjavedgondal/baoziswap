pragma solidity ^0.8.0;

interface IEventEmitter {
   
    function mint(address sender, address pair, uint amount0, uint amount1) external returns(bool);
    function pairCreated(address token0, address token1, address pair, uint length) external returns(bool);
}