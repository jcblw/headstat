import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  BarChart,
  Bar,
  Legend,
  Tooltip,
  YAxis,
  XAxis,
  CartesianGrid,
} from 'recharts';

import { setUserAuth } from './actions/user';
import { setOptions, getResource } from './actions/json-api';
import { select } from './selectors/json-api';
import { byDate } from './selectors/aggregation';
import { aggregationToChartMap } from './selectors/charts';
import './App.css';

const CHART_COLOR = '#f58b44';

function mapStateToProps(state) {
  const userActivities = select('userActivities', null, state);
  return {
    user: state.user,
    token: state.jsonapi.token,
    aggregation: aggregationToChartMap(
      byDate('day', userActivities),
      () => 'foo'
    ),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setupAPI({ host, endpoint }) {
      dispatch(setOptions({ host, endpoint }));
    },
    setAuth(token) {
      dispatch(setUserAuth(token));
    },
    allUserActivities({ userId }) {
      dispatch(getResource('user-activities', { limit: -1, userId }));
      // dispatch(readEndpoint(`user-activities?limit=-1&userId=${userId}`));
    },
  };
}

class App extends Component {
  constructor(...args) {
    super(...args);
    this.state = {};
  }

  componentDidMount() {
    const { setupAPI } = this.props;
    setupAPI(this.props);
  }

  getMonthString(_date) {
    if (!_date) return 'Invalid Date';
    const date = new Date(_date);
    const formatter = new Intl.DateTimeFormat('en', { month: 'long' });
    return formatter.format(date);
  }

  formatTitle(_date) {
    if (!_date) return 'Invalid Date';
    const date = new Date(_date);
    const formatter = new Intl.DateTimeFormat('en', { month: 'short' });
    const month = formatter.format(date);
    return `${month} ${date.getDate() + 1}`;
  }

  getAggregation() {
    const { allUserActivities, user } = this.props;
    allUserActivities(user);
  }

  onTokenChange(e) {
    const { setAuth } = this.props;
    setAuth(e.target.value);
    setTimeout(() => this.getAggregation(), 0);
  }

  onFilterChange() {}

  render() {
    const { aggregation, token } = this.props;
    return (
      <div className="App">
        <h2>Headstats</h2>
        <label htmlFor="auth-token">Auth Token</label>
        <input
          id="auth-token"
          type="text"
          value={token}
          onChange={this.onTokenChange.bind(this)}
        />
        <select value="day">
          <option value="day">Daily</option>
          <option value="week">Weekly</option>
          <option value="month">Monthly</option>
        </select>
        <h1>Daily Sessions</h1>
        <BarChart width={window.innerWidth} height={400} data={aggregation}>
          <XAxis dataKey="name" />
          <YAxis />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Legend />
          <Bar type="monotone" dataKey="sessions" fill={CHART_COLOR} />
        </BarChart>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
