
import { COINS, ERROR, TXS } from '../constants';
import fetchWorker from '../../lib/fetch.worker';
import promise from 'bluebird';

const promises = new Map();
const worker = new fetchWorker();

worker.onerror = (err) => {
  console.log(err);
};

worker.onmessage = (ev) => {
  const p = promises.get(ev.data.type);
  if (!p) {
    return;
  }

  if (ev.data.error) {
    p.reject(ev.data.error);
    promises.delete(ev.data.type);
    return;
  }

  p.resolve(ev.data.data);
};

const getFromWorker = (type, resolve, reject, query = null) => {
  promises.set(type, { resolve, reject });
  worker.postMessage({ query, type });
};

export const getCoinHistory = (dispatch, query) => {
  return new promise((resolve, reject) => {
    getFromWorker(
      'coins',
      (payload) => {
        dispatch({ payload, type: COINS });
        resolve(payload);
      },
      (payload) => {
        dispatch({ payload, type: ERROR });
        reject(payload);
      },
      query
    );
  });
};

export const getTXLatest = (dispatch, query) => {
  return new promise((resolve, reject) => {
    getFromWorker(
      'txs',
      (payload) => {
        dispatch({ payload, type: TXS });
        resolve(payload);
      },
      (payload) => {
        dispatch({ payload, type: ERROR });
        reject(payload);
      },
      query
    );
});
};

export default {
  getCoinHistory,
  getTXLatest
};