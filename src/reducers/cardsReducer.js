import _ from 'lodash';
import {
  TOP_CARD_EXPANDED,
  TOP_CARD_CONTRACTED,
  POP_TOP_CARD,
  UNPOP_LAST_CARD,
  UNSHIFT_CARD,
  CHANGED_COLLECTION,
  CHANGED_COLLECTION_BREAK,
  LOGIN_SUCCESS,
} from '../lib/actions';
import { ddp } from '../lib/DDP';
import { mongo } from '../lib/Mongo';

const introCards = [
  { _type: 'intro', _id: 'intro1', hero: 'Swipe ➡️', content: 'to like stuff', step: 'Intro 1 / 5', shimmerDirection: 'right', shimmerSpeed: 40 },
  { _type: 'intro', _id: 'intro2', hero: 'Swipe ⬅️', content: 'when you\'re not feeling something', step: 'Intro 2 / 5', shimmerDirection: 'left', shimmerSpeed: 40 },
  { _type: 'intro', _id: 'intro3', hero: 'Swipe ⬇️', content: 'when you\'re REALLY not feeling something', step: 'Intro 3 / 5', shimmerDirection: 'down', shimmerSpeed: 20 },
  { _type: 'intro', _id: 'intro4', hero: 'Swipe ⬆️', content: 'to share the best ideas and make sure they get seen', step: 'Intro 4 / 5', shimmerDirection: 'up', shimmerSpeed: 20 },
  { _type: 'intro', _id: 'intro5', hero: '🎊\nWelcome to Posyt', step: 'Intro 5 / 5', shimmerDirection: 'right', shimmerSpeed: 15,
    content: 'When someone likes a bunch of the stuff you like, you can chat 💬\n\nSo keep swiping! ⬅️⬇️⬆️➡️\n\nAnd if you\'re feeling inspired, post your own ideas.' },
];

const initialState = {
  leads: [], // The current user's leads
  cards: [], // The current user's leads converted into renderable articles and posyts
  swiped: [], // recently swiped leads. don't show them again
  unshiftedCards: [], // Manually added cards, e.g. deep links. We don't want to neglect them when calling updateCards
  startedReadingAt: new Date, // reset on every pop, used to calulate readTime
  expandedAts: [], // times when a link is opened, used to calulate expandedTime
  contractedAts: [], // times when a link is closed, used to calulate expandedTime
};

function cardsDidChange(state, action) {
  if (!/posyts|articles|users/.test(action.payload.collectionName)) return false;
  if (!state.leads.length) return true; // Leads are the starting place, so try hard to get them
  if (action.payload.collectionName === 'users' && (!ddp.userId || action.payload.id === ddp.userId)) return true;
  if (action.payload.collectionName === 'articles' && _.find(state.leads, { type: 'article', id: action.payload.id }) ) return true;
  if (action.payload.collectionName === 'posyts' && _.find(state.leads, { type: 'posyt', id: action.payload.id }) ) return true;
  return false;
}

// TODO: make more performant. don't update everything just what's changed
function updateCards(state, action) {
  if (!ddp.userId) {
    const cards = mongo.db.articles.find().map(a => ({ ...a, _type: 'article' }));
    cards.push({ _id: '2' });
    cards.push({ _id: '3' });
    return {
      leads: [],
      cards,
    };
  }

  const user = mongo.db.users.findOne({ _id: ddp.userId });

  // // TODO: UNDO: don't actually sort leads by type
  // const leads = user && user.meta && _.sortBy(user.meta.leads, o => o.type) || [];
  const leads = user && user.meta && user.meta.leads || [];
  const typeToDb = { article: mongo.db.articles, posyt: mongo.db.posyts };
  const cards = _.uniqBy([...state.unshiftedCards, ..._.compact(leads.map((l) => {
    if (_.find(state.swiped, { _type: l.type, _id: l.id })) return null;
    if (_.find(state.unshiftedCards, { _type: l.type, _id: l.id })) return null;
    const card = typeToDb[l.type].findOne({ _id: l.id });
    return card && { ...card, _type: l.type };
  }))], '_id');
  // TODO: leave the top 3 cards at the top

  if (user && user.profile && !user.profile.hasCompletedSwipeIntro) {
    return {
      leads,
      cards: [...introCards, ...cards],
    };
  }

  return {
    leads,
    cards,
  };
}

export default function cardsReducer(state = initialState, action) {
  let card, unshiftedCards, newState;
  switch (action.type) {
    case TOP_CARD_EXPANDED:
      return {
        ...state,
        ...{ expandedAts: [...state.expandedAts, new Date] },
      };
    case TOP_CARD_CONTRACTED:
      return {
        ...state,
        ...{ contractedAts: [...state.contractedAts, new Date] },
      };
    case POP_TOP_CARD:
      return {
        ...state,
        ...{
          swiped: [state.cards[0], ...state.swiped].slice(0, 10),
          cards: state.cards.slice(1),
          unshiftedCards: state.unshiftedCards.slice(1),
          startedReadingAt: new Date,
          expandedAts: [],
          contractedAts: [],
        },
      };
    case UNPOP_LAST_CARD:
      return {
        ...state,
        ...{
          cards: [state.swiped[0], ...state.cards],
          swiped: state.swiped.slice(1),
          startedReadingAt: new Date,
          expandedAts: [],
          contractedAts: [],
        },
      };
    case UNSHIFT_CARD:
      card = action.payload.card;
      unshiftedCards =
        !_.find(state.unshiftedCards, { _type: card._type, _id: card._id })
        ? [card, ...state.unshiftedCards]
        : state.unshiftedCards;
      newState = {
        ...state,
        ...{
          unshiftedCards,
          swiped: state.swiped.slice(1),
          startedReadingAt: new Date,
          expandedAts: [],
          contractedAts: [],
        },
      };
      return {
        ...newState,
        ...updateCards(newState, action),
      };
    // case CHANGED_COLLECTION:
    case CHANGED_COLLECTION_BREAK:
      // if (!cardsDidChange(state, action)) return state;
      return {
        ...state,
        ...updateCards(state, action),
      };
    case LOGIN_SUCCESS:
      return {
        ...state,
        ...updateCards(state, action),
      };
    default:
      return state;
  }
}
