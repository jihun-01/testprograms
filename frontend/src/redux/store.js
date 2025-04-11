import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import productReducer from './reducers/productReducer';

// 루트 리듀서
const rootReducer = combineReducers({
  products: productReducer,
  // 다른 리듀서들을 여기에 추가
});

// 스토어 생성
const store = createStore(
  rootReducer,
  applyMiddleware(thunk)
);

export default store;