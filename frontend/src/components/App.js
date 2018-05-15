import React, { Component } from 'react';
import { BrowserRouter as Router, Link, NavLink, Route } from 'react-router-dom';

import ImportForm from '../containers/ImportForm';
import Messages from '../containers/Messages';
import './App.css';

class App extends Component {
  render() {
    return (
      <Router>
        <Root>
          <Sidebar>
            <SidebarTitle>
              <Link to='/'>D'CHAIN</Link>
            </SidebarTitle>
            <Separator />
            <PlanMenu />
          </Sidebar>
          <Main>
            <Messages />
            <div className="container">
              <Route path='/import' component={ImportForm} />
            </div>
          </Main>
        </Root>
      </Router>
    );
  }
}

const PlanMenu = (props) => (
  <div>
    <SidebarLink to='/import'><Icon icon="fa-upload" />Import</SidebarLink>
    <SidebarLink to='/verify'><Icon icon="fa-check" />verify</SidebarLink>
  </div>
)

const Icon = (props) => (
  <i style={{ paddingRight: '5px' }} className={`fa ${props.icon}`}></i>
)

const Root = (props) => (
  <div style={{
    display: 'flex'
  }} {...props} />
)

const Sidebar = (props) => (
  <div id="sidebar" style={{
    width: '260px',
    height: '100vh'
  }} {...props} />
)

const SidebarTitle = (props) => (
  <h1 style={{
    fontSize: '30px',
    fontWeight: 700,
    padding: '10px 20px',
    marginBottom: 0,
  }} {...props} />
)

const Separator = (props) => (
  <hr style={{
    margin: 0,
    marginBottom: '10px',
    position: 'relative',
    borderTop: '1px solid rgba(255,255,255,0.3)'
  }} {...props} />
)

const SidebarItem = (props) => (
  <div style={{
    padding: '7px 20px',
    color: 'white',
    position: 'relative'
  }} {...props} />
)

const SidebarLink = (props) => (
  <div style={{ padding: '0', paddingLeft: '40px' }}>
    <NavLink style={{ padding: '7px 10px' }} to={props.to} {...props} />
  </div>
)

const Main = (props) => (
  <div style={{
    flex: 1,
    height: '100vh',
    backgroundColor: '#fafafa',
    position: 'relative',
    padding: '10px 0px'
  }} {...props} />
)

export default App;
