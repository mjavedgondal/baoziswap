const styles = {
  login: 'color: grey; font-weight: bold;',
  App: 'color: black; font-weight: bold;',
  Pool: 'color: #065a66; font-weight: bold;',
  PagePool: 'color: #065a66; font-weight: bold;',
  ContractPresalePublicService: 'color: #996655; font-weight: bold;',
  ContractLessTokenService: 'color: #996655; font-weight: bold;',
  ContractLessLibraryService: 'color: #996655; font-weight: bold;',
  yyy: 'color: #996655; font-weight: bold;',
};

export const stylizeConsole = ({ showConsoleLog = true }) => {
  const stylesOfPages = Object.entries(styles);
  const { log } = console;
  console.log = (...args: any) => {
    try {
      if (!showConsoleLog) return;
      let used = false;
      stylesOfPages.map((item) => {
        const [page, style] = item;
        if (args[0] && args[0].includes(page)) {
          log(`%c%s`, style, ...args);
          used = true;
        }
        return null;
      });
      if (!used) log(...args);
    } catch (e) {
      log(...args);
    }
  };
};
