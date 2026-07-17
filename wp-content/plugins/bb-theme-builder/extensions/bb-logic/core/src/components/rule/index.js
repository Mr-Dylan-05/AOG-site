import React, { Component, useState } from 'react'
import { __ } from '../../i18n'
import { getRuleFormConfig, getDefaultOperator } from '../../api'
import Button from '../button'
import { DismissIcon } from '../icons/dismiss'
import { CloneIcon } from '../icons/clone'
import { DragIcon } from '../icons/drag'
import Field from '../field'
import TypeSelect from './type-select'

/**
 * Class for rendering a single rule.
 *
 * @since 0.1
 * @class Rule
 */
class Rule extends Component {
	constructor( props ) {
		super( props )
		const { data } = this.props
		data.checked = false
		this.state = {
			dragOverItem: null,
		}
	}

	handleDragStart = ( e, group, id ) => {
		e.dataTransfer.setData('id', id)
		e.dataTransfer.setData('group', group)
	}

	handleDragOver = ( e, index ) => {
		e.preventDefault()
		this.setState( { dragOverItem: index } )
	}

	handleDrop = ( e, newGroup, newIndex, reArrange ) => {
		e.preventDefault()
		const oldId = e.dataTransfer.getData('id')
		const oldGroup = parseInt(e.dataTransfer.getData('group'))
		reArrange( oldGroup, oldId, newGroup, newIndex )
		this.setState( { dragOverItem: null } )
	}

	render() {
		const {
			data,
			group,
			rule,
			isLast,
			removeRule,
			bulkAction,
			cloneRule,
			reArrange,
			isMultiRule
		} = this.props

		return (
			<div className='bb-logic-rule'
				onDragStart={ (e) => {
					this.handleDragStart(e, group, rule)
				} }
				onDragOver={ (e) => {
					this.handleDragOver(e, rule)
				} }
				onDrop={ (e) => {
					this.handleDrop( e, group, rule, reArrange )
				} }
				draggable={ true }
				style={ { padding: '8px 0px', margin: '4px', cursor: 'grab' } }
			>
				<div className='bb-logic-rule-fields'>
					{ isMultiRule && bulkAction && <Field
						key={ rule }
						name={ `bb-logic[${ group }][${ rule }][checked]` }
						style={ { width:'initial' } }
						type='checkbox'
						checked={ data.checked || false }
						onChange={ this.onCBChange.bind( this ) }
					/> }
					<TypeSelect
						name={ `bb-logic[${ group }][${ rule }][type]` }
						value={ data.type }
						onChange={ this.onTypeChange.bind( this ) }
					/>
					{ this.renderFields() }
				</div>
				{ data.type && <Button
					label={ <CloneIcon /> }
					className='bb-logic-rule-clone'
					onClick={ () => cloneRule( group, rule ) }
				/> }
				<Button
					label={ <DismissIcon /> }
					className='bb-logic-rule-delete'
					onClick={ () => removeRule( group, rule ) }
				/>
				<Button
					label={ <DragIcon /> }
					onClick={ (e) => e.preventDefault() }
					className='bb-logic-rule-drag'
				/>
			</div>
		)
	}

	renderFields() {
		const { data, group, rule, requests } = this.props
		const config = getRuleFormConfig( data.type, data )
		const fields = []

		if ( ! config ) {
			return null
		}

		for ( let key in config ) {
			const { visible } = config[ key ]

			if ( 'undefined' !== typeof visible && ! visible ) {
				continue;
			}

			fields.push(
				<Field
					key={ key }
					name={ `bb-logic[${ group }][${ rule }][${ key }]` }
					value={ data[ key ] }
					onChange={ this.onFieldChange.bind( this ) }
					data={ data }
					requests={ requests }
					{ ...config[ key ] }
				/>
			)
		}

		return fields
	}

	onTypeChange( e ) {
		const { group, rule, updateRule } = this.props
		const type = e.target.value
		updateRule( group, rule, {
			type: type,
			...this.getFieldDefaults( type )
		} )
	}

	onCBChange( e ) {
		const { group, rule, data, updateRule } = this.props
		const isChecked = e.target.checked
		updateRule( group, rule, {
			...data,
			checked: isChecked
		} )
	}

	onFieldChange( e ) {
		const { group, rule, data, updateRule } = this.props
		const { name, value } = e.target
		const key = name.split( '[' ).pop().replace( ']', '' )
		updateRule( group, rule, {
			...data,
			[key]: value
		} )
	}

	getFieldDefaults( type ) {
		const config = getRuleFormConfig( type )
		const defaults = {}

		if ( config ) {
			for ( let key in config  ) {
				let field = config[ key ]

				if ( 'select' === field.type && field.options ) {
					defaults[ key ] = field.options[0].value
				} else if ( 'operator' === field.type ) {
					defaults[ key ] = field.operators ? field.operators[0] : getDefaultOperator()
				} else {
					defaults[ key ] = field.defaultValue ? field.defaultValue : ''
				}
			}
		}

		return defaults
	}
}

export default Rule
