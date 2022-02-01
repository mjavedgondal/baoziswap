pragma solidity >=0.8.0;

import './interfaces/IBaoziFactory.sol';
import './interfaces/IBaoziPair.sol';
import './BaoziPair.sol';

contract BaoziFactory is IBaoziFactory {
    bytes32 public constant INIT_CODE_PAIR_HASH = keccak256(abi.encodePacked(type(BaoziPair).creationCode));

    IEventEmitter public immutable override eventEmitter;

    address public override feeTo;
    address public override feeToSetter;

    mapping(address => address) public override getFeeAddress;
    mapping(address => mapping(address => address)) public override getPair;
    address[] public override allPairs;

    constructor(address _feeToSetter, IEventEmitter _eventEmitter) {
        feeToSetter = _feeToSetter;
        eventEmitter = _eventEmitter;
    }

    function allPairsLength() external view override returns (uint) {
        return allPairs.length;
    }

    function createPair(address tokenA, address tokenB) external override returns (address pair) {
        require(tokenA != tokenB, 'Baozi: IDENTICAL_ADDRESSES');
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), 'Baozi: ZERO_ADDRESS');
        require(getPair[token0][token1] == address(0), 'Baozi: PAIR_EXISTS'); // single check is sufficient
 
        pair = address(new BaoziPair{salt: keccak256(abi.encodePacked(token0, token1))}());
        IBaoziPair(pair).initialize(token0, token1);
        
        getPair[token0][token1] = pair;
        getPair[token1][token0] = pair; // populate mapping in the reverse direction
        allPairs.push(pair);
        eventEmitter.pairCreated(token0, token1, pair, allPairs.length);
    }

    function setFeeTo(address _feeTo) external override {
        require(msg.sender == feeToSetter, 'Baozi: FORBIDDEN');
        feeTo = _feeTo;
    }

    function setTokensDev(address[] calldata _tokenAddress, address[] calldata _devAddress) external override {
        require(msg.sender == feeToSetter, 'Baozi: FORBIDDEN');
        require(_tokenAddress.length == _devAddress.length, "Wrong count of token and devs");
        for (uint i = 0; i < _tokenAddress.length; i++) {
            if (getFeeAddress[_tokenAddress[i]] != _devAddress[i]) {
                getFeeAddress[_tokenAddress[i]] = _devAddress[i];
            }
        }
    }

    function setFeeToSetter(address _feeToSetter) external override {
        require(feeToSetter == msg.sender, 'Baozi: FORBIDDEN');
        feeToSetter = _feeToSetter;
    }
}
