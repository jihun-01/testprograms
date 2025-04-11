import {
    FETCH_PRODUCTS_REQUEST,
    FETCH_PRODUCTS_SUCCESS,
    FETCH_PRODUCTS_FAILURE,
    FETCH_PRODUCT_REQUEST,
    FETCH_PRODUCT_SUCCESS,
    FETCH_PRODUCT_FAILURE,
    CREATE_PRODUCT_SUCCESS,
    UPDATE_PRODUCT_SUCCESS,
    DELETE_PRODUCT_SUCCESS
  } from '../actions/productActions';
  
  const initialState = {
    products: [],
    product: null,
    loading: false,
    error: null
  };
  
  const productReducer = (state = initialState, action) => {
    switch (action.type) {
      case FETCH_PRODUCTS_REQUEST:
      case FETCH_PRODUCT_REQUEST:
        return {
          ...state,
          loading: true,
          error: null
        };
      
      case FETCH_PRODUCTS_SUCCESS:
        return {
          ...state,
          products: action.payload,
          loading: false
        };
      
      case FETCH_PRODUCT_SUCCESS:
        return {
          ...state,
          product: action.payload,
          loading: false
        };
      
      case FETCH_PRODUCTS_FAILURE:
      case FETCH_PRODUCT_FAILURE:
        return {
          ...state,
          loading: false,
          error: action.payload
        };
      
      case CREATE_PRODUCT_SUCCESS:
        return {
          ...state,
          products: [action.payload, ...state.products]
        };
      
      case UPDATE_PRODUCT_SUCCESS:
        return {
          ...state,
          products: state.products.map(product =>
            product.id === action.payload.id ? action.payload : product
          ),
          product: action.payload
        };
      
      case DELETE_PRODUCT_SUCCESS:
        return {
          ...state,
          products: state.products.filter(product => product.id !== action.payload)
        };
      
      default:
        return state;
    }
  };
  
  export default productReducer;