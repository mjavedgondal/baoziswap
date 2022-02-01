#!/bin/bash

rm -rf ./node_modules/truffle-flattener
npx github:fedeb95/truffle-flattener $1 > ./flattened1.sol
# (sed '3!{/\/\/ SPDX.*/d;}' flattened1.sol) > flattened2.sol
# (sed '155!{/pragma abicoder.*/d;}' flattened2.sol) > flattened.sol
rm ./flattened.sol
# rm ./flattened2.sol
