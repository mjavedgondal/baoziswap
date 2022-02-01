pragma solidity >=0.8.0;

import '../BaoziTRC20.sol';

contract TRC20 is BaoziTRC20 {
    constructor(uint _totalSupply) {
        _mint(msg.sender, _totalSupply);
    }
}
