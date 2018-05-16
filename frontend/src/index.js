import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import rootReducer from './reducers';

import './index.css';
import App from './components/App';
import '../node_modules/font-awesome/css/font-awesome.min.css'; 

const store = createStore(rootReducer);

const driver = require('bigchaindb-driver')


const alice = new driver.Ed25519Keypair()
const conn = new driver.Connection(
    'https://test.bigchaindb.com/api/v1/',
    { app_id: 'af2e016d',
      app_key: '405c9c673ddcf8a68807dbc4c45ef5e1' })

const tx = driver.Transaction.makeCreateTransaction(
        { message: 'testmessage' },
        null,
        [ driver.Transaction.makeOutput(
            driver.Transaction.makeEd25519Condition(alice.publicKey))],
        alice.publicKey)
    const txSigned = driver.Transaction.signTransaction(tx, alice.privateKey)
    conn.postTransactionCommit(txSigned)


conn.searchAssets('testmessage')
.then(assets => console.log('Found assets with serial number Bicycle Inc.:', assets))  



render(
  <Provider store={store} >
    <App />
  </Provider>,
  document.getElementById('root')
)
