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
import { setChartsFilter } from './actions/charts';
import { setOptions, getResource } from './actions/json-api';
import { select, relationshipsToArray } from './selectors/json-api';
import { byDate } from './selectors/aggregation';
import {
  aggregationToChartMap,
  allFilters,
  titleFormatters,
} from './selectors/charts';
import './App.css';

const CHART_COLOR = '#f58b44';

function mapStateToProps(state) {
  const userActivities = select('userActivities', null, state);
  const { filter } = state.charts;
  const formatTitle = titleFormatters[filter];
  return {
    user: state.user,
    token: state.jsonapi.token,
    allFilters: allFilters(),
    filter,
    userActivities,
    aggregation: aggregationToChartMap(
      byDate(filter, userActivities),
      formatTitle
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
    },
    allActivities(userActivities) {
      userActivities.forEach(userActivity => {
        const relationships = relationshipsToArray(userActivity);
        relationships.forEach(({ data: { type, id } }) => {
          dispatch(getResource(type, id));
        });
      });
      // dispatch(getResource('user-activities', { limit: -1, userId }));
    },
    setChartsFilter(filter) {
      dispatch(setChartsFilter(filter));
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

  componentDidUpdate({ userActivities: prevUserActivities }) {
    const { userActivities, allActivities } = this.props;
    if (userActivities.length && !prevUserActivities.length) {
      console.log('all activities');
      allActivities(userActivities);
    }
  }

  getData() {
    const { allUserActivities, user } = this.props;
    allUserActivities(user);
  }

  onTokenChange(e) {
    const { setAuth } = this.props;
    setAuth(e.target.value);
    setTimeout(() => this.getData(), 0);
  }

  onFilterChange(e) {
    const { setChartsFilter } = this.props;
    setChartsFilter(e.target.value);
  }

  render() {
    const {
      aggregation,
      token,
      filter,
      allFilters,
      userActivities,
    } = this.props;
    const filterLabels = { day: 'Daily', week: 'Weekly', month: 'Monthly' };
    return (
      <div className="App">
        <h2>Headstats</h2>
        <pre styles={{ textAlign: 'left' }}>
          {JSON.stringify(userActivities, null, '  ')}
        </pre>
        <label htmlFor="auth-token">Auth Token</label>
        <input
          id="auth-token"
          type="text"
          value={token}
          onChange={this.onTokenChange.bind(this)}
        />
        <select value={filter} onChange={this.onFilterChange.bind(this)}>
          {allFilters.map(_filter => {
            return (
              <option key={_filter} value={_filter}>
                {filterLabels[_filter]}
              </option>
            );
          })}
        </select>
        <h1>
          {filterLabels[filter]} Sessions
        </h1>
        <BarChart width={window.innerWidth} height={300} data={aggregation}>
          <XAxis dataKey="name" />
          <YAxis />
          <CartesianGrid strokeDasharray="3 5 3 5" />
          <Tooltip />
          <Legend />
          <Bar type="monotone" dataKey="sessions" fill={CHART_COLOR} />
        </BarChart>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
