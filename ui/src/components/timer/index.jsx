// @flow

import { timer } from './style.js.scss';
import { Component } from 'preact';

class Timer extends Component {
	constructor() {
		super();
		// set initial time:
		this.state = {
			time: Date.now()
		};
	}

	componentDidMount() {
		// update time every second
		this.timer = setInterval(() => {
			this.setState({ time: Date.now() });
		}, 1000);
	}

	componentWillUnmount() {
		// stop when not renderable
		clearInterval(this.timer);
	}

	render(props: Object) {
		let time = new Date(this.state.time).toLocaleTimeString();

		return <h1 style={timer}>{ time }</h1>;
	}
}

export default Timer;
