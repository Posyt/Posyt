import {
  CHANGED_COLLECTION,
  CHANGED_COLLECTION_BREAK,
  SELECT_CONVERSATION,
  UPDATE_CHAT,
  PAGE_CHAT,
  CACHE_MESSAGE,
  MESSAGE_CREATE_FAILED,
  RETRYING_MESSAGE_CREATE,
  REMOVE_MESSAGE_FROM_CACHE,
  LEAVE_CHAT,
} from '../lib/actions';
import { ddp } from '../lib/DDP';
import { mongo } from '../lib/Mongo';
import _ from 'lodash';

const PAGE_INC = 1;
const initialState = {
  conversationId: null,
  participants: [],
  bubbles: [],
  numMessagesOnClient: 0,
  limit: PAGE_INC,
  cachedMessages: [],
};

function chatDidChange(state, action) {
  if (!state.conversationId) return false;
  if (/messages|articles|posyts|users/.test(action.payload.collectionName)) return true;
  if (action.payload.collectionName === 'conversations' && action.payload.id === state.conversationId) return true;
  return false;
}

// TODO: URGENT: PERFORMANCE!!!
// TODO: make more performant. don't update everything just what's changed
function updateChat(state, action) {
  if (!ddp.userId) return {};
  const convo = mongo.db.conversations.findOne({ _id: state.conversationId });
  if (!convo) return {};
  const participants = (convo.participants || []).map(p => ({ ...p, ...mongo.db.users.findOne({ _id: p.id }, { fields: { username:1, 'status.online':1 } }) }));
  const messages = mongo.db.messages.find({ conversationId: convo._id }, { sort: { createdAt: -1 } }).map(m => ({ ...m, _type: 'message', date: (m.createdAt || new Date(0))}));
  const typeToDb = { article: mongo.db.articles, posyt: mongo.db.posyts };
  const cards = _.compact((convo.likes || []).map(l => {
    const card = typeToDb[l.type].findOne({ _id: l.id });
    return card && { ...card, _type: l.type, date: (l.matchedAt || new Date(0))};
  }));
  const first5Messages = messages.slice(0, 5);
  const cachedMessages = _.filter(state.cachedMessages, m => {
    // compare cachedMessages to recent messages and remove dupes from cached messages
    return !(m.state === 'sending' && first5Messages.map(mm => mm.content).includes(m.content))
  });
  const lookingFor = { lastDelivered: true, lastRead: true, lastReadAndIsMine: true };
  const me = _.find(participants, { id: ddp.userId }) || {};
  const otherUser = _.find(participants, { id: _.without(convo.participantIds, ddp.userId)[0] }) || {};
  const typingBubbles = otherUser.isTyping ? [{ _type: 'message', content: '· · ·', ownerId: otherUser._id, date: new Date, isTypingIndicator: true }] : [];
  // TODO: bubbles don't change so cache them instead of recomputing all of them on every update
  const bubbles = _.sortBy([...typingBubbles, ...cachedMessages, ...messages, ...cards], 'date').reverse().slice(0, state.limit).map((b, i, a) => {
    const isMine = b.ownerId === ddp.userId;
    const previousDate = i + 1 < a.length && a[i + 1].date;
    const nextDate = i > 0 && a[i - 1].date;
    const nextIsSameOwner = i > 0 && a[i - 1].ownerId === b.ownerId;
    const previousIsSameOwner = i + 1 < a.length && a[i + 1].ownerId === b.ownerId;
    const isParticipants = (convo.participantIds || []).includes(b.ownerId);
    const nextIsParticipants = i > 0 && (convo.participantIds || []).includes(a[i - 1].ownerId);
    const previousIsParticipants = i + 1 < a.length && (convo.participantIds || []).includes(a[i + 1].ownerId);
    const isLast = i === 0;
    const isFirst = i + 1 === a.length;
    const isLastDelivered = lookingFor.lastDelivered && b._type === 'message' && b._id && isMine;
    if (isLastDelivered) lookingFor.lastDelivered = false;
    if (lookingFor.lastRead && b._type === 'message' && b._id && otherUser.lastReadMessageId === b._id) lookingFor.lastRead = false;
    const isLastRead = !lookingFor.lastRead && lookingFor.lastReadAndIsMine && b._type === 'message' && b._id && isMine;
    if (isLastRead) lookingFor.lastReadAndIsMine = false;
    return { ...b, isMine, previousDate, nextDate, nextIsSameOwner, previousIsSameOwner, isParticipants, nextIsParticipants, previousIsParticipants, isLast, isFirst, isLastDelivered, isLastRead };
  });
  if (messages && messages[0] && me.lastReadMessageId !== messages[0]._id) ddp.call('conversations/setLastRead', [messages[0]._id, convo._id]);
  return {
    cachedMessages,
    participants,
    bubbles,
    numMessagesOnClient: messages.length,
  };
}

function cacheMessage(state, action) {
  const cachedMessages = state.cachedMessages;
  const message = action.payload.attrs;
  // Don't allow dupes
  if (_.find(cachedMessages, _.pick(message, ['content']))) return {};
  message.date = new Date;
  message.ownerId = ddp.userId;
  message._type = 'message';
  message.state = 'sending';
  return {
    cachedMessages: [message, ...cachedMessages],
  };
}

function removeMessageFromCache(state, action) {
  const cachedMessages = state.cachedMessages;
  const message = action.payload.attrs;
  const index = _.findIndex(cachedMessages, _.pick(message, ['content']));
  if (index === -1) return {};
  cachedMessages.splice(index, 1);
  return {
    cachedMessages,
  };
}

function test(action) {
  return action.payload && action.payload.id && mongo.db.conversations.findOne({_id: action.payload.id})
}

export default function chatReducer(state = initialState, action) {
  let cachedMessages;
  let i;
  switch (action.type) {
    case SELECT_CONVERSATION:
      return {
        ...initialState,
        conversationId: action.payload.id,
      };
    // case CHANGED_COLLECTION:
    case CHANGED_COLLECTION_BREAK:
      // if (!chatDidChange(state, action)) return state;
      return {
        ...state,
        ...updateChat(state, action),
      };
    case UPDATE_CHAT:
      return {
        ...state,
        ...updateChat(state, action),
      };
    case PAGE_CHAT:
      if (state.limit > state.bubbles.length + PAGE_INC) return state;
      return {
        ...state,
        limit: state.limit + PAGE_INC,
      };
    case CACHE_MESSAGE:
      return {
        ...state,
        ...cacheMessage(state, action),
      };
    case MESSAGE_CREATE_FAILED:
      cachedMessages = state.cachedMessages;
      i = _.findIndex(cachedMessages, _.pick(action.payload.attrs, ['content']));
      if (i === -1) return state;
      cachedMessages[i].state = 'failed';
      return {
        ...state,
        cachedMessages,
      };
    case RETRYING_MESSAGE_CREATE:
      cachedMessages = state.cachedMessages;
      i = _.findIndex(cachedMessages, _.pick(action.payload.attrs, ['content']));
      if (i === -1) return state;
      cachedMessages[i].state = 'sending';
      return {
        ...state,
        cachedMessages,
      };
    case REMOVE_MESSAGE_FROM_CACHE:
      return {
        ...state,
        ...removeMessageFromCache(state, action),
      };
    case LEAVE_CHAT:
      return initialState;
    default:
      return state;
  }
}
