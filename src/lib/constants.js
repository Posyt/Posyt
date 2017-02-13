import _ from 'lodash';
import { shadeColor } from './utils';

/*
 * urls
 */

export const posytDomain = (global.__DEV__ ? 'localhost' : 'www.posyt.com');
export const posytUri = (global.__DEV__ ? `http://${posytDomain}:3000` : `https://${posytDomain}`);
export const posytWsUri = (global.__DEV__ ? `ws://${posytDomain}:3000/websocket` : `wss://${posytDomain}/websocket`);
export const posytGraphQLUri = (global.__DEV__ ? `http://${posytDomain}:3000/graphql` : `https://${posytDomain}/graphql`);
export const posytPort = (global.__DEV__ ? 3000 : 443);
export const posytSSL = (global.__DEV__ ? false : true);

/*
 * keys
 */

export const appId = (global.__DEV__ ? '' : '1037842845');
export const segmentWriteKey = (global.__DEV__ ? 'mATdPTIQxyMk6wCtSJH8iXdJp3PTcF7K' : 'ASBKWL2TC6rtcrpGUAPzFz51kGji79kV');
export const appsflyerDevKey = (global.__DEV__ ? '' : 'tCS4w2zCJNCPxMx8FHjYeL');
export const sentryPublicDSN = (global.__DEV__ ? '' : 'https://a0392b7a67f84bab9191cc3162ab0b62@sentry.io/129274');
export const bugsnagKey = (global.__DEV__ ? 'bf9abc670731967f0941a94d7fb82ee0' : '1198ce8497fed00f630cc1cb74cb1e3f');

/*
 * sources
 */

export const sources = _.shuffle([
  'Medium',
  'Hacker News',
  'Imgur',
  'Product Hunt',
  'The Verge',
  'New York Times',
  'Dribbble',
]);
export const sourcesIcons = {
  'Medium': require(`../../assets/images/feed_medium.png`),
  'Hacker News': require(`../../assets/images/feed_hacker_news.png`),
  'Imgur': require(`../../assets/images/feed_imgur.png`),
  'Product Hunt': require(`../../assets/images/feed_product_hunt.png`),
  'The Verge': require(`../../assets/images/feed_the_verge.png`),
  'New York Times': require(`../../assets/images/feed_new_york_times.png`),
  'Dribbble': require(`../../assets/images/feed_dribbble.png`),
};

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
export const lightGreyRGB = '245,245,245';
export const grey = '#CCCCCF';

export const appleBlue = '#0076FF';
export const appleLightBlue = '#54C7FC';
export const appleGrey = '#8E8E93';

// http://brandcolors.net/
export const facebookBlue = '#3b5998';
export const twitterBlue = '#55acee';
export const instagramBlue = '#3f729b';
