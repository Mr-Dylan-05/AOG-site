import React, { Component, useState } from 'react'
import classnames from 'classnames'
import { __ } from '../../i18n'
import Button from '../button'
import Rule from '../rule'
import Field from '../field'

/**
 * Class for rendering rule groups.
 *
 * @since 0.1
 * @class RuleGroup
 */
class RuleGroup extends Component {

	constructor( props ) {
		super( props )
		this.state = {
			isChecked: false,
			action: ''
		}
	}

	render() {
		const {
			group,
			data,
			isLast,
			addRule,
			updateRule,
			removeRule,
			requests,
			buttonClassName,
			checkAll,
			applyAction,
			bulkAction,
			cloneRule,
			reArrange
		} = this.props

		const { isChecked, action } = this.state
		const isMultiRule = 1 < data.length

		return (
			<div className='bb-logic-rule-group'>
				<div className='bb-logic-rule-group-rules'>
					{ isMultiRule && bulkAction && <div style={ { display:'flex', margin: '4px', alignItems: 'center' } }>
						<Field
							name={ name }
							type='checkbox'
							checked={ isChecked }
							onChange={ ( e ) => {
								this.setState({ isChecked: ! isChecked })
								checkAll( e, group )
							} }
						/>
						<div style={ { marginRight: '10px' } }>
							{ __( 'Select All' ) }
						</div>
						<select
						style={ { marginRight: '10px' } }
						onChange={ e => {
							this.setState({ action: e.target.value })
						} }>
							<option value=''>{ __( 'Bulk actions' ) }</option>
							<option value='duplicate'>{ __( 'Duplicate' ) }</option>
							<option value='delete'>{ __( 'Delete' ) }</option>
						</select>
						<Button
							label={ __( 'Apply' ) }
							className={ classnames( 'bb-logic-add-rule', buttonClassName ) }
							onClick={ () => {
								if( action ) {
									console.log("adas")
									this.setState({ isChecked: false })
									applyAction( group, action )
								}
							} }
						/>
					</div> }
					{ data.map( ( rule, index ) =>
						<Rule
							key={ index }
							group={ group }
							rule={ index }
							data={ rule }
							requests={ requests }
							isLast={ index === data.length - 1 }
							updateRule={ updateRule }
							removeRule={ removeRule }
							bulkAction={ bulkAction }
							cloneRule={ cloneRule }
							reArrange={ reArrange }
							isMultiRule={ isMultiRule }
						/>
					) }
					<Button
						label={ isLast ? __( 'Add Rule Group' ) : __( 'Add Rule' ) }
						className={ classnames( 'bb-logic-add-rule', buttonClassName ) }
						onClick={ () => addRule( group ) }
					/>
				</div>
				{ ! isLast &&
					<div className="bb-logic-rule-group-separator">
						{ __( 'or' ) }
					</div>
				}
			</div>
		)
	}
}

export default RuleGroup
