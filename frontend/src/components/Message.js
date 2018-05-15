import React, { Component } from 'react';

class Message extends Component {
  render() {
    return (
      <div style={{ marginBottom: 0, borderRadius: 0 }} className={`alert alert-${this.props.severity} alert-dismissible`}>
        <a href="#" className="close" data-dismiss="alert" aria-label="close">&times;</a>
        {this.props.message}
      </div>
    )
  }
}

export default Message;