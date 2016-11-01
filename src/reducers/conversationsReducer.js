import {
  CHANGED_COLLECTION,
  PAGE_CONVERSATIONS,
} from '../lib/actions';
import { ddp } from '../lib/DDP';
import { mongo } from '../lib/Mongo';
import _ from 'lodash';

const PAGE_INC = 10
const initialState = {
  conversations: [],
  limit: PAGE_INC,
};

function conversationsDidChange(state, action) {
  if (!/conversations|users/.test(action.payload.collectionName)) return false;
  if (!state.conversations.length) return true; // Conversations are the starting place, so try hard to get them
  if (action.payload.collectionName === 'users') return true;
  if (action.payload.collectionName === 'conversations') return true;
  return false;
}

// TODO: make more performant. don't update everything just what's changed
function updateConversations(state, action) {
  if (!ddp.userId) return {};
  const conversationsWithoutUsers = mongo.db.conversations.find({}, { sort: { 'lastMessage.createdAt': -1, createdAt: -1 } });
  const conversations = conversationsWithoutUsers.map(c => {
    const user = mongo.db.users.findOne({ _id: _.without(c.participantIds, ddp.userId)[0] }, { fields: { username:1, 'status.online':1 } });
    return { ...c, user };
  });
  return {
    conversations,
  };
}

export default function conversationsReducer(state = initialState, action) {
  switch (action.type) {
    case CHANGED_COLLECTION:
      if (!conversationsDidChange(state, action)) return state;
      return {
        ...state,
        ...updateConversations(state, action),
      };
    case PAGE_CONVERSATIONS:
      if (state.limit > state.conversations.length + 1) return state;
      return {
        ...state,
        limit: state.limit + PAGE_INC,
      };
    default:
      return state;
  }
}
