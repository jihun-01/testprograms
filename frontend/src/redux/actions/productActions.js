import { productService } from '../../services/productService';

// 액션 타입
export const FETCH_PRODUCTS_REQUEST = 'FETCH_PRODUCTS_REQUEST';
export const FETCH_PRODUCTS_SUCCESS = 'FETCH_PRODUCTS_SUCCESS';
export const FETCH_PRODUCTS_FAILURE = 'FETCH_PRODUCTS_FAILURE';
export const FETCH_PRODUCT_REQUEST = 'FETCH_PRODUCT_REQUEST';
export const FETCH_PRODUCT_SUCCESS = 'FETCH_PRODUCT_SUCCESS';
export const FETCH_PRODUCT_FAILURE = 'FETCH_PRODUCT_FAILURE';
export const CREATE_PRODUCT_REQUEST = 'CREATE_PRODUCT_REQUEST';
export const CREATE_PRODUCT_SUCCESS = 'CREATE_PRODUCT_SUCCESS';
export const CREATE_PRODUCT_FAILURE = 'CREATE_PRODUCT_FAILURE';
export const UPDATE_PRODUCT_REQUEST = 'UPDATE_PRODUCT_REQUEST';
export const UPDATE_PRODUCT_SUCCESS = 'UPDATE_PRODUCT_SUCCESS';
export const UPDATE_PRODUCT_FAILURE = 'UPDATE_PRODUCT_FAILURE';
export const DELETE_PRODUCT_REQUEST = 'DELETE_PRODUCT_REQUEST';
export const DELETE_PRODUCT_SUCCESS = 'DELETE_PRODUCT_SUCCESS';
export const DELETE_PRODUCT_FAILURE = 'DELETE_PRODUCT_FAILURE';

// 액션 생성자
export const fetchProducts = (params = {}) => async (dispatch) => {
  dispatch({ type: FETCH_PRODUCTS_REQUEST });
  try {
    const products = await productService.getAll(params);
    dispatch({ 
      type: FETCH_PRODUCTS_SUCCESS, 
      payload: products 
    });
  } catch (error) {
    dispatch({ 
      type: FETCH_PRODUCTS_FAILURE, 
      payload: error.response?.data?.message || '상품 목록을 불러오는데 실패했습니다.' 
    });
  }
};

export const fetchProduct = (id) => async (dispatch) => {
  dispatch({ type: FETCH_PRODUCT_REQUEST });
  try {
    const product = await productService.getById(id);
    dispatch({ 
      type: FETCH_PRODUCT_SUCCESS, 
      payload: product 
    });
  } catch (error) {
    dispatch({ 
      type: FETCH_PRODUCT_FAILURE, 
      payload: error.response?.data?.message || '상품 정보를 불러오는데 실패했습니다.' 
    });
  }
};

export const createProduct = (productData, callback) => async (dispatch) => {
  dispatch({ type: CREATE_PRODUCT_REQUEST });
  try {
    const newProduct = await productService.create(productData);
    dispatch({ 
      type: CREATE_PRODUCT_SUCCESS, 
      payload: newProduct 
    });
    if (callback) callback();
    return newProduct;
  } catch (error) {
    dispatch({ 
      type: CREATE_PRODUCT_FAILURE, 
      payload: error.response?.data?.message || '상품 생성에 실패했습니다.' 
    });
    throw error;
  }
};

export const updateProduct = (id, productData, callback) => async (dispatch) => {
  dispatch({ type: UPDATE_PRODUCT_REQUEST });
  try {
    const updatedProduct = await productService.update(id, productData);
    dispatch({ 
      type: UPDATE_PRODUCT_SUCCESS, 
      payload: updatedProduct 
    });
    if (callback) callback();
    return updatedProduct;
  } catch (error) {
    dispatch({ 
      type: UPDATE_PRODUCT_FAILURE, 
      payload: error.response?.data?.message || '상품 업데이트에 실패했습니다.' 
    });
    throw error;
  }
};

export const deleteProduct = (id, callback) => async (dispatch) => {
  dispatch({ type: DELETE_PRODUCT_REQUEST });
  try {
    await productService.remove(id);
    dispatch({ 
      type: DELETE_PRODUCT_SUCCESS, 
      payload: id 
    });
    if (callback) callback();
  } catch (error) {
    dispatch({ 
      type: DELETE_PRODUCT_FAILURE, 
      payload: error.response?.data?.message || '상품 삭제에 실패했습니다.' 
    });
    throw error;
  }
};