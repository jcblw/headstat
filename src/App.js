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
import {
  setChartsFilter,
  setChartsBreakdown,
  setChartsMetric,
} from './actions/charts';
import { setOptions, getResource } from './actions/json-api';
import { select, relationshipsToArray } from './selectors/json-api';
import { byDate } from './selectors/aggregation';
import {
  aggregationToChartMap,
  allFilters,
  titleFormatters,
  aggregationToBars,
  aggregationToChartMapTime,
} from './selectors/charts';
import './App.css';

function mapStateToProps(state) {
  const userActivities = select('userActivityCompletions', null, state);
  const { filter, breakdown, metric } = state.charts;
  const formatTitle = titleFormatters[filter];
  const dateAggregate = byDate(filter, userActivities, {
    total: breakdown === 'total',
  });
  const aggregationFn =
    metric === 'sessions' ? aggregationToChartMap : aggregationToChartMapTime;
  return {
    user: state.user,
    token: state.jsonapi.token,
    allFilters: allFilters(),
    filter,
    breakdown,
    metric,
    userActivities,
    bars: aggregationToBars(dateAggregate),
    aggregation: aggregationFn(dateAggregate, formatTitle),
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
      dispatch(getResource('user-activity-completions', { limit: -1, userId }));
    },
    allVariations(userActivities) {
      userActivities.forEach(userActivity => {
        const { variation, activity } = userActivity.relationships;
        dispatch(
          getResource('activity-variations', variation.data.id, {
            activityId: activity.data.id,
          })
        );
      });
      // dispatch(getResource('user-activities', { limit: -1, userId }));
    },
    setChartsFilter(filter) {
      dispatch(setChartsFilter(filter));
    },
    setChartsBreakdown(breakdown) {
      dispatch(setChartsBreakdown(breakdown));
    },
    setChartsMetric(metric) {
      dispatch(setChartsMetric(metric));
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
    const { userActivities, allVariations } = this.props;
    if (userActivities.length && !prevUserActivities.length) {
      allVariations(userActivities);
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

  onBreakdownChange(e) {
    const { setChartsBreakdown } = this.props;
    setChartsBreakdown(e.target.value);
  }

  onMetricChange(e) {
    const { setChartsMetric } = this.props;
    setChartsMetric(e.target.value);
  }

  render() {
    const {
      aggregation,
      aggregationTime,
      token,
      filter,
      metric,
      breakdown,
      allFilters,
      userActivities,
      bars,
    } = this.props;
    const filterLabels = { day: 'Daily', week: 'Weekly', month: 'Monthly' };
    const hasFullyLoaded = userActivities.every(a => a.variation);
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
        <select value={filter} onChange={this.onFilterChange.bind(this)}>
          {allFilters.map(_filter => {
            return (
              <option key={_filter} value={_filter}>
                {filterLabels[_filter]}
              </option>
            );
          })}
        </select>
        <select value={breakdown} onChange={this.onBreakdownChange.bind(this)}>
          <option value="total">Total</option>
          <option value="not-total">By activity</option>
        </select>
        <select value={metric} onChange={this.onMetricChange.bind(this)}>
          <option value="sessions">Sessions</option>
          <option value="minutes">Minutes</option>
        </select>
        <h1>
          {filterLabels[filter]} {metric}
        </h1>
        {metric === 'sessions' || hasFullyLoaded
          ? <BarChart width={window.innerWidth} height={300} data={aggregation}>
              <XAxis dataKey="name" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 5 3 5" />
              <Tooltip />
              <Legend />
              {bars.map(bar =>
                <Bar
                  type="monotone"
                  stackId="b"
                  key={bar.key}
                  dataKey={bar.key}
                  fill={bar.color}
                />
              )}
            </BarChart>
          : 'loading...'}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
