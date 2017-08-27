import React, { Component } from 'react';
import { connect } from 'react-redux';
import SimpleBar from './components/simple-bar';
import Filters, { filterLabels } from './components/filters';

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

function getLongestRunStreak(sessions) {
  let longestRunStreak = 0;
  let currentStreak = 0;
  sessions.forEach(s => {
    if (s.sessions > 0) {
      currentStreak += 1;
    } else {
      currentStreak = 0;
    }

    if (currentStreak > longestRunStreak) {
      longestRunStreak = currentStreak;
    }
  });
  return longestRunStreak;
}

function mapStateToProps(state) {
  const userActivities = select('userActivityCompletions', null, state);
  const { filter, breakdown, metric } = state.charts;
  const formatTitle = titleFormatters[filter];
  const dateAggregate = byDate(filter, userActivities, {
    total: breakdown === 'total',
  });
  const ats = aggregationToChartMap(dateAggregate, formatTitle);
  const atm = aggregationToChartMapTime(dateAggregate, formatTitle);
  const aggregation = ats.map((a, i) => Object.assign({}, a, atm[i]));
  const longestRunStreak = getLongestRunStreak(
    aggregationToChartMap(
      byDate('day', userActivities, { total: 'total' }),
      formatTitle
    )
  );

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
    aggregation,
    longestRunStreak,
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
      metric,
      timeOfDay,
      token,
      userActivities,
      userId,
      longestRunStreak,
    } = this.props;

    const hasFullyLoaded = userActivities.every(a => a.variation);
    const aggMax = aggregation
      .map(a => a.minutes || 0)
      .reduce((n1, n2) => Math.max(n1, n2), 0);
    const totalMinutes = aggregation.reduce(
      (n1, n2) => n1 + (n2.minutes || 0),
      0
    );
    const totalSessions = aggregation.reduce(
      (n1, n2) => n1 + (n2.sessions || 0),
      0
    );

    return (
      <div className="App">
        <h2>Headstats</h2>
        <div className="u-flex">
          <div className="u-flex--1">
            <label htmlFor="auth-token">Auth Token</label>
            <input
              id="auth-token"
              type="text"
              value={token}
              onChange={this.onTokenChange.bind(this)}
            />
          </div>
          <div className="u-flex--1">
            <label htmlFor="user-id">User Id</label>
            <input
              id="user-id"
              type="text"
              value={userId}
              onChange={this.onUserIdChange.bind(this)}
            />
          </div>
        </div>
        <div className="u-flex">
          <div className="u-flex--1">
            <Filters
              filter={filter}
              allFilters={allFilters}
              onFilterChange={this.onFilterChange.bind(this)}
              breakdown={breakdown}
              onBreakdownChange={this.onBreakdownChange.bind(this)}
              metric={metric}
              onMetricChange={this.onMetricChange.bind(this)}
            />
          </div>
        </div>
        <h2>
          Your {filterLabels[filter]} stats
        </h2>
        {aggregation.map(agg =>
          <SimpleBar
            key={agg.name}
            label={agg.name}
            max={aggMax}
            value={agg.minutes}
            suffix="minutes"
          />
        )}
        <div className="u-flex">
          <div className="u-flex u-flexDirection--column u-flex--1 u-textAlign--center">
            <p className="u-flex--1">Total minutes meditated</p>
            <p className="u-flex--1 u-bold">
              {totalMinutes}
            </p>
          </div>
          <div className="u-flex u-flexDirection--column u-flex--1 u-textAlign--center">
            <p className="u-flex--1">Longest run streak</p>
            <p className="u-flex--1 u-bold">
              {longestRunStreak}
            </p>
          </div>
        </div>
        <div className="u-flex">
          <div className="u-flex u-flexDirection--column u-flex--1 u-textAlign--center">
            <p className="u-flex--1">Sessions completed</p>
            <p className="u-flex--1 u-bold">
              {totalSessions}
            </p>
          </div>
          <div className="u-flex u-flexDirection--column u-flex--1 u-textAlign--center">
            <p className="u-flex--1">Packs completed</p>
            <p className="u-flex--1 u-bold">
              {totalSessions}
            </p>
          </div>
        </div>
        <pre style={{ textAlign: 'left' }}>
          {JSON.stringify(aggregation, null, '\t')}
        </pre>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
