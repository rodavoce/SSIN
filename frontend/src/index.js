import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import rootReducer from './reducers';

import './index.css';
import App from './components/App';
import '../node_modules/font-awesome/css/font-awesome.min.css'; 

const store = createStore(rootReducer);

render(
  <Provider store={store} >
    <App />
  </Provider>,
  document.getElementById('root')
)
