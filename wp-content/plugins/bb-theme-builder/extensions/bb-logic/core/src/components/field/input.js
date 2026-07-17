import React, { Component } from 'react'

/**
 * Renders a standard form input.
 *
 * @since 0.1
 * @class InputField
 */
class InputField extends Component {
	render() {
		const { name, type, value, checked, placeholder, onChange } = this.props

		return (
			<input
				name={ name }
				type={ type }
				value={ value }
				checked={ checked }
				placeholder={ placeholder }
				onChange={ onChange }
			/>
		)
	}
}

export default InputField
