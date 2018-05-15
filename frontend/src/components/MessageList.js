import React, { Component } from 'react';

import Message from './Message';

class MessageList extends Component {
  render() {
    return (
      <Container>
        {this.props.messages.map((message, i) =>
          <Message key={i} message={message.text} severity={message.severity} />
        )}
      </Container>
    )
  }
}

const Container = (props) => (
  <div style={{
    position: 'absolute',
    top: 0,
    width: '100%'
  }} {...props} />
)

export default MessageList;