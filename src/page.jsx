import React, { Component } from "react"

export default class Page extends Component {

	render() {
		if (!this.props.show) {
			return null
		}

		return (
			<div class="modal fade">
				<div class="modal-dialog">
					<div class="modal-content">
						<div class="modal-header">
							<h5 class="modal-title">Modal title</h5>
							<button type="button" class="close"><span>&times;</span></button>
						</div>
						<div class="modal-body">
							...
						</div>
						<div class="modal-footer">
							<button type="button" class="btn btn-secondary">Close</button>
							<button type="button" class="btn btn-warning">Create</button>
						</div>
					</div>
				</div>
			</div>
		)
	}

}
