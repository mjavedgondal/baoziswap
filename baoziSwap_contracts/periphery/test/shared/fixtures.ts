import { Wallet, Contract } from 'ethers'
import * as ethers from 'ethers'
type Web3Provider = ethers.providers.Web3Provider
import { deployContract } from 'ethereum-waffle'

import { expandTo18Decimals } from './utilities'

import BaoziFactory from '../../../core/build/BaoziFactory.json'
import IBaoziPair from '../../../core/build/IBaoziPair.json'

import TRC20 from '../../build/TRC20.json'
import WTRX9 from '../../build/WTRX9.json'
import UniswapV1Exchange from '../../buildV1/UniswapV1Exchange.json'
import UniswapV1Factory from '../../buildV1/UniswapV1Factory.json'
import BaoziRouter01 from '../../build/BaoziRouter.json'
import BaoziRouter from '../../build/BaoziRouter.json'
import RouterEventEmitter from '../../build/RouterEventEmitter.json'


import { bytecode } from '../../../core/build/BaoziPair.json'
import { keccak256 } from '@ethersproject/solidity'



const overrides = {
  gasLimit: 9999999
}

interface V2Fixture {
  token0: Contract
  token1: Contract
  WTRX: Contract
  WTRXPartner: Contract
  factoryV1: Contract
  factoryV2: Contract
  router01: Contract
  router02: Contract
  routerEventEmitter: Contract
  router: Contract
  WTRXExchangeV1: Contract
  pair: Contract
  WTRXPair: Contract
}

export async function v2Fixture( [wallet]: Wallet[], provider: Web3Provider): Promise<V2Fixture> {
  // deploy tokens
  const tokenA = await deployContract(wallet, TRC20, [expandTo18Decimals(10000)])
  const tokenB = await deployContract(wallet, TRC20, [expandTo18Decimals(10000)])
  const WTRX = await deployContract(wallet, WTRX9)
  const WTRXPartner = await deployContract(wallet, TRC20, [expandTo18Decimals(10000)])

  // deploy V1
  const factoryV1 = await deployContract(wallet, UniswapV1Factory, [])
  await factoryV1.initializeFactory((await deployContract(wallet, UniswapV1Exchange, [])).address)

  // deploy V2
  const factoryV2 = await deployContract(wallet, BaoziFactory, [wallet.address])

  // deploy routers
  const router01 = await deployContract(wallet, BaoziRouter01, [factoryV2.address, WTRX.address], overrides)
  const router02 = await deployContract(wallet, BaoziRouter, [factoryV2.address, WTRX.address], overrides)

  // event emitter for testing
  const routerEventEmitter = await deployContract(wallet, RouterEventEmitter, [])

  // deploy migrator


  // initialize V1
  await factoryV1.createExchange(WTRXPartner.address, overrides)
  const WTRXExchangeV1Address = await factoryV1.getExchange(WTRXPartner.address)
  const WTRXExchangeV1 = new Contract(WTRXExchangeV1Address, JSON.stringify(UniswapV1Exchange.abi), provider).connect(
    wallet
  )

  // initialize V2
  await factoryV2.createPair(tokenA.address, tokenB.address)
  const pairAddress = await factoryV2.getPair(tokenA.address, tokenB.address)

  const pair = new Contract(pairAddress, JSON.stringify(IBaoziPair.abi), provider).connect(wallet)

  const token0Address = await pair.token0()
  const token0 = tokenA.address === token0Address ? tokenA : tokenB
  const token1 = tokenA.address === token0Address ? tokenB : tokenA

  await factoryV2.createPair(WTRX.address, WTRXPartner.address)
  const WTRXPairAddress = await factoryV2.getPair(WTRX.address, WTRXPartner.address)
  const WTRXPair = new Contract(WTRXPairAddress, JSON.stringify(IBaoziPair.abi), provider).connect(wallet)

  return {
    token0,
    token1,
    WTRX,
    WTRXPartner,
    factoryV1,
    factoryV2,
    router01,
    router02,
    router: router02, // the default router, 01 had a minor bug
    routerEventEmitter,
    WTRXExchangeV1,
    pair,
    WTRXPair
  }
}
