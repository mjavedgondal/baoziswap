pragma solidity >=0.8.0;

import "./interfaces/IBaoziFactory.sol";
import "./interfaces/IBaoziPair.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EventEmitter is Ownable, IEventEmitter {

    address public factory;

    event PairCreated(address indexed token0, address indexed token1, address pair, uint);
    event Mint(address indexed sender, address indexed pair, uint amount0, uint amount1);

    constructor() {}

    function mint(address sender, address pair, uint amount0, uint amount1) external override returns(bool) {
        require(_isDexAddress(msg.sender), "Not allowed call");
        emit Mint(sender, pair, amount0, amount1);
        return true;
    }

    function pairCreated(address token0, address token1, address pair, uint length) external override returns(bool) {
        require(msg.sender == factory, "Not allowed call");
        emit PairCreated(token0, token1, pair, length);
        return true;
    }

    function setFactoryAddress(address _factory) external onlyOwner {
        factory = _factory;
    }

    function _isContract(address addr) private view returns (bool) {
		uint256 size;
		assembly {
			size := extcodesize(addr)
		}
		return size > 0;
	}

	function _isDexAddress(address destination) private view returns (bool) {
		if (!_isContract(destination)) return false;
		address token0;
		try IBaoziPair(destination).token0() returns (address _token0) {
			token0 = _token0;
		} catch (bytes memory) {
			return false;
		}

		address token1;
		try IBaoziPair(destination).token1() returns (address _token1) {
			token1 = _token1;
		} catch (bytes memory) {
			return false;
		}

		address goodPair = IBaoziFactory(factory).getPair(token0, token1);
		if (goodPair != destination) {
			return false;
        }

		return true;
	}
}