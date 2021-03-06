import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { sdk } from './lib/headspace-sdk';
import {
  BarChart,
  Bar,
  Legend,
  Tooltip,
  YAxis,
  XAxis,
  CartesianGrid,
} from 'recharts';

const CHART_COLOR = '#f58b44';

class App extends Component {
  constructor(...args) {
    super(...args);
    this.state = {};
  }

  aggregate(data, formatTitle) {
    return Object.keys(data)
      .map(date => {
        const firstDate = data[date][0]
          ? data[date][0].updatedAt
          : data[date].date;
        return {
          name: formatTitle(firstDate),
          sessions: data[date].length,
          sortBy: firstDate,
        };
      })
      .filter(aggregat => aggregat.sessions < 10)
      .sort((prev, next) => {
        return (
          new Date(prev.sortBy).valueOf() - new Date(next.sortBy).valueOf()
        );
      });
  }

  componentDidMount() {}

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
    let daily;
    let weekly;
    let monthly;

    sdk
      .getCompletionsByDay()
      .then(d => {
        daily = this.aggregate(d, this.formatTitle);
        return sdk.getCompletionsByWeek();
      })
      .then(w => {
        weekly = this.aggregate(w, this.formatTitle);
        return sdk.getCompletionsByMonth();
      })
      .then(m => {
        monthly = this.aggregate(m, this.getMonthString);
        this.setState({
          daily,
          weekly,
          monthly,
        });
      });
  }

  onChange(e) {
    sdk.setAuth(e.target.value);
    this.getAggregation();
  }

  render() {
    const { weekly, daily, monthly, authToken } = this.state;
    return (
      <div className="App">
        <h2>Headstats</h2>
        <label htmlFor="auth-token">Auth Token</label>
        <input
          id="auth-token"
          type="text"
          value={authToken}
          onChange={this.onChange.bind(this)}
        />
        <h1>Daily Sessions</h1>
        <BarChart width={window.innerWidth} height={400} data={daily}>
          <XAxis dataKey="name" />
          <YAxis />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Legend />
          <Bar type="monotone" dataKey="sessions" fill={CHART_COLOR} />
        </BarChart>

        <h1>Weekly Sessions</h1>
        <BarChart width={window.innerWidth} height={400} data={weekly}>
          <XAxis dataKey="name" />
          <YAxis />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Legend />
          <Bar type="monotone" dataKey="sessions" fill={CHART_COLOR} />
        </BarChart>

        <h1>Monthly Sessions</h1>
        <BarChart width={window.innerWidth} height={400} data={monthly}>
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

export default App;
