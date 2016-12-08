import { shadeColor } from './utils';

/*
 * urls
 */

export const posytDomain = (global.__DEV__ ? '10.0.1.87' : 'beta.posyt.com');
export const posytUri = (global.__DEV__ ? `http://${posytDomain}:3000` : `https://${posytDomain}`);
export const posytWsUri = (global.__DEV__ ? `ws://${posytDomain}:3000/websocket` : `wss://${posytDomain}/websocket`);
export const posytPort = (global.__DEV__ ? 3000 : 443);
export const posytSSL = (global.__DEV__ ? false : true);

/*
 * keys
 */

export const segmentWriteKey = (global.__DEV__ ? '9awl42vsc9' : '6lhm0kwq2w');

/*
 * colors
 */

export const red = '#FF6161';
export const lightRed = shadeColor(0.4, red);
export const green = '#5DC37F';
export const blue = '#38B9FF';
// export const gold = '#FFB84F';
export const warningYellow = '#fabe3b';
export const gold = '#FFDB3B';
export const pink = '#FA7EF5';
export const black = '#2B2B2B';
export const lightBlack = '#555555';
export const lightGrey = '#f5f5f5';
export const grey = '#CCCCCF';

export const appleBlue = '#0076FF';
export const appleLightBlue = '#54C7FC';
export const appleGrey = '#8E8E93';

// http://brandcolors.net/
export const facebookBlue = '#3b5998';
export const twitterBlue = '#55acee';
export const instagramBlue = '#3f729b';
