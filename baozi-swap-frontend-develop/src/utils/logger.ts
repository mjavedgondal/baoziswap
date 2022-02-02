import { showLogs } from '../config';

export const clog = (data: string): void => {
  if (showLogs) {
    console.log(data);
  }
};

export const clogData = (text: string, data: any): void => {
  if (showLogs) {
    console.log(text, data);
  }
};

export const clogGroup = (name: string | any[], end?: boolean): void => {
  if (showLogs) {
    if (end) {
      console.groupEnd();
      return;
    }
    console.group(name);
  }
};

export const throwError = (text: string): Error => {
  throw new Error(text);
};
