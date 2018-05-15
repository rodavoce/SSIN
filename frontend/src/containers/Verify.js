import React, { Component } from 'react';
import { connect } from 'react-redux';

import { addMessage } from '../actions';

class ImportForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fileName: '',
      errors: {
        fileName: [],
        file: [],
      }
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    })
  }

  validateForm() {
    let valid = true;
    if (this.state.fileName === '') {
      this.addError('fileName', 'This field is mandatory');
      valid = false;
    } else {
      this.clearErrors('fileName');
    }
    if (!this.fileInput.files[0]) {
      this.addError('file', 'This field is mandatory');
      valid = false;
    } else {
      this.clearErrors('file');
    }
    return valid;
  }

  handleSubmit(event) {
    event.preventDefault();
    if (!this.validateForm()) return;

    let data = new FormData();
    data.append('fileName', this.state.fileName);
    data.append('file', this.fileInput.files[0]);

    fetch('http://localhost:4567/file/', {
      method: "POST",
      body: data,
    })
    .then(res => {
      console.log(res.ok);
      if (res.ok) { 
        this.props.dispatch(addMessage('File saved successfully!', 'success'));        
      } else {
        this.props.dispatch(addMessage(`Error importing the submitted file (${res})`, 'danger'));
      }
    })
    .catch(err => { 
      this.props.dispatch(addMessage('Error importing the submitted file', 'danger'))
    });
  }
  
  addError(field, error) {
    if (this.state.errors[field].includes(error)) return;
    const errors = this.state.errors;
    errors[field] = [...this.state.errors[field], error];
    this.setState({
      errors: errors
    });
  }

  clearErrors(field) {
    if (!field) {
      let errors = {}
      for (let field in this.state.errors) {
        errors[field] = []
      }
      this.setState({
        errors: errors
      });
    } else {
      this.setState({
        errors: {
          ...this.state.errors,
          [field]: [],
        }
      });
    }
  }

  render() {
    return (
      <div>
        <h3>Verify a file</h3>
        <form method="post" encType="multipart/form-data" >
          <input className="btn btn-primary" type="submit" onClick={this.handleSubmit} value="verify" />
        </form>
      </div>
    )
  }
}

export default connect()(Verify);