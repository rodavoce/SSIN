import React, { Component } from 'react';
import { connect } from 'react-redux';

import { addMessage } from '../actions';

class ImportForm extends Component {
	constructor(props) {
		super(props);
		this.state = {
			errors: {
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
		this.clearErrors('file');

		let valid = true;
		if (!this.fileInput.files[0]) {
			this.addError('file', 'This field is mandatory');
			valid = false;
		}

		return valid;
	}

	handleSubmit(event) {
		event.preventDefault();
		if (!this.validateForm()) return;

		let data = new FormData();
		data.append('file', this.fileInput.files[0]);

		fetch(`https://localhost:3001/timestamp`, {
			method: "POST",
			body: data,
		})
			.then(response => {
                if (response.ok) {
                    return response.json()
                }
                else {
                    this.props.dispatch(addMessage('Error importing file', 'danger'));
                    throw new Error();
                }

			})
            .then(res => {
					this.props.dispatch(addMessage('File imported successfully', 'success'));
					let blob = new Blob([JSON.stringify(res)], {type: "application/json"});
					let link = document.createElement('a');
					link.href = window.URL.createObjectURL(blob);
					link.download = this.fileInput.files[0].name + "." + "stamp";
					link.click();
			})
			.catch(err => {
				console.log(err);
				this.props.dispatch(addMessage('Error importing file', 'danger'))
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
			let errors = this.state.errors;
			errors[field] = [];
			this.setState({
				errors: errors
			});
		}
	}

	render() {
		return (
			<div>
				<h3>Import a file</h3>
				<form method="post" encType="multipart/form-data" >
					<div className="form-group" >
						<input className="form-control-file" type="file" name="file" id="file" ref={input => this.fileInput = input} required />
						{this.state.errors['file'].map((error, i) =>
							<small key={i} className="text-danger">{error}</small>
						)}
					</div>
                    <input className="btn btn-primary" type="submit" onClick={this.handleSubmit} value="Import" />
				</form>

			</div>
		)
	}
}

export default connect()(ImportForm);