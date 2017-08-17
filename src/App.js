import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend,
  Tooltip,
  YAxis,
  XAxis,
  CartesianGrid,
} from 'recharts';

import { setUserAuth, setUserId } from './actions/user';
import {
  setChartsFilter,
  setChartsBreakdown,
  setChartsMetric,
} from './actions/charts';
import { setOptions, getResource, clearCache } from './actions/json-api';
import { select, relationshipsToArray } from './selectors/json-api';
import {
  byDate,
  byTimeOfDay,
  metitatesTimeOfDay,
} from './selectors/aggregation';
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
  const timeOfDay = byTimeOfDay(userActivities);
  return {
    user: state.user,
    userId: state.user.userId,
    token: state.jsonapi.token,
    allFilters: allFilters(),
    filter,
    breakdown,
    metric,
    userActivities,
    bars: aggregationToBars(dateAggregate),
    aggregation: aggregationFn(dateAggregate, formatTitle),
    timeOfDay,
    meditatesTimeOfDay: metitatesTimeOfDay(timeOfDay),
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
    clearCache() {
      dispatch(clearCache());
    },
    setUserId(id) {
      dispatch(setUserId(id));
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
    const { allUserActivities, user, clearCache } = this.props;
    clearCache();
    allUserActivities(user);
  }

  onTokenChange(e) {
    const { setAuth } = this.props;
    setAuth(e.target.value);
    setTimeout(() => this.getData(), 0);
  }

  onUserIdChange(e) {
    const { setUserId } = this.props;
    setUserId(e.target.value);
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
      allFilters,
      bars,
      breakdown,
      filter,
      meditatesTimeOfDay,
      metric,
      timeOfDay,
      token,
      userActivities,
      userId,
    } = this.props;
    // console.log(timeOfDay);
    const filterLabels = { day: 'Daily', week: 'Weekly', month: 'Monthly' };
    const hasFullyLoaded = userActivities.every(a => a.variation);
    const lastMonth = aggregation[aggregation.length - 2];
    const prevMonth = aggregation[aggregation.length - 3];
    return (
      <div className="App">
        <h2>Headstats</h2>
        <div>
          <label htmlFor="auth-token">Auth Token</label>
          <input
            id="auth-token"
            type="text"
            value={token}
            onChange={this.onTokenChange.bind(this)}
          />
          <label htmlFor="user-id">User Id</label>
          <input
            id="user-id"
            type="text"
            value={userId}
            onChange={this.onUserIdChange.bind(this)}
          />
        </div>
        <div>
          <select value={filter} onChange={this.onFilterChange.bind(this)}>
            {allFilters.map(_filter => {
              return (
                <option key={_filter} value={_filter}>
                  {filterLabels[_filter]}
                </option>
              );
            })}
          </select>
          <select
            value={breakdown}
            onChange={this.onBreakdownChange.bind(this)}
          >
            <option value="total">Total</option>
            <option value="not-total">By activity</option>
          </select>
          <select value={metric} onChange={this.onMetricChange.bind(this)}>
            <option value="sessions">Sessions</option>
            <option value="minutes">Minutes</option>
          </select>
        </div>
        <h2>
          {filterLabels[filter]} {metric}
        </h2>
        {metric === 'sessions' || hasFullyLoaded
          ? <BarChart width={window.innerWidth} height={300} data={aggregation}>
              <XAxis dataKey="name" />
              <YAxis />
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

        {lastMonth
          ? <div>
              <h6>
                {lastMonth.name} v. {prevMonth.name}
              </h6>
              <p>
                {(lastMonth.sessions || 0) - (prevMonth.sessions || 0)}
              </p>
            </div>
          : null}

        <h2>Time of day frequency</h2>
        <LineChart width={window.innerWidth} height={300} data={timeOfDay}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="amount"
            strokeWidth="3px"
            stroke="#86D1AC"
          />
        </LineChart>
        <h4>
          You like to meditate in the {meditatesTimeOfDay}
        </h4>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
