import { types } from 'mobx-state-tree';

const OptionsModal = types
  .model({
    isOpen: types.optional(types.boolean, false),
    slippage: types.optional(types.string, '0.5'),
    deadline: types.optional(types.string, '30'),
    multihops: types.optional(types.boolean, true),
  })
  .actions((self) => ({
    open() {
      self.isOpen = true;
    },
    close() {
      self.isOpen = false;
    },
    setSlippage(value: string) {
      self.slippage = value;
    },
    setDeadline(value: string) {
      self.deadline = value;
    },
    switchMultihops() {
      self.multihops = !self.multihops;
    },
  }));

const TokenSelectModal = types
  .model({
    isOpen: types.optional(types.boolean, false),
    isIn: types.optional(types.boolean, true),
  })
  .actions((self) => ({
    open(isIn: boolean) {
      self.isOpen = true;
      self.isIn = isIn;
    },
    close() {
      self.isOpen = false;
    },
  }));

const UserInfoModal = types
  .model({
    isOpen: types.optional(types.boolean, false),
  })
  .actions((self) => ({
    open() {
      self.isOpen = true;
    },
    close() {
      self.isOpen = false;
    },
  }));

const InfoModal = types
  .model({
    msg: types.optional(types.string, ''),
    type: types.optional(types.string, ''),
    tx: types.optional(types.string, ''),
  })
  .actions((self) => ({
    setMsg(msg: string, type: 'success' | 'error', tx?: string) {
      self.msg = msg;
      self.type = type;
      if (tx) self.tx = tx;
    },
    close() {
      self.msg = '';
      self.type = '';
      self.tx = '';
    },
  }));

const RemoveLiquidityModal = types
  .model({
    isOpen: types.optional(types.boolean, false),
    tokenA: types.optional(types.string, ''),
    tokenB: types.optional(types.string, ''),
    decimalsA: types.optional(types.number, 0),
    decimalsB: types.optional(types.number, 0),
    decimalsLP: types.optional(types.number, 0),
    liquidityAmount: types.optional(types.string, ''),
    firstTokenAmount: types.optional(types.string, ''),
    secondTokenAmount: types.optional(types.string, ''),
    firstTokenPrice: types.optional(types.number, 1),
    secondTokenPrice: types.optional(types.number, 1),
  })
  .actions((self) => ({
    setRemove(
      tokenA: string,
      tokenB: string,
      decimalsA: number,
      decimalsB: number,
      decimalsLP: number,
      liquidity: string,
      firstAmount: string,
      secondAmount: string,
      firstPrice: number,
      secondPrice: number,
    ) {
      self.isOpen = true;
      self.tokenA = tokenA;
      self.tokenB = tokenB;
      self.decimalsA = decimalsA;
      self.decimalsB = decimalsB;
      self.decimalsLP = decimalsLP;
      self.liquidityAmount = liquidity;
      self.firstTokenAmount = firstAmount;
      self.secondTokenAmount = secondAmount;
      self.firstTokenPrice = firstPrice;
      self.secondTokenPrice = secondPrice;
    },
    close() {
      self.isOpen = false;
      self.tokenA = '';
      self.tokenB = '';
      self.decimalsA = 0;
      self.decimalsB = 0;
      self.decimalsLP = 0;
      self.liquidityAmount = '';
      self.firstTokenAmount = '';
      self.secondTokenAmount = '';
      self.firstTokenPrice = 1;
      self.secondTokenPrice = 1;
    },
  }));

export const Modals = types
  .model({
    info: InfoModal,
    userInfo: UserInfoModal,
    tokenSelect: TokenSelectModal,
    options: OptionsModal,
    removeLiquidity: RemoveLiquidityModal,
  })
  .actions((self) => ({
    closeAll() {
      self.info.close();
      self.tokenSelect.close();
      self.options.close();
      self.userInfo.close();
      self.removeLiquidity.close();
    },
  }));
