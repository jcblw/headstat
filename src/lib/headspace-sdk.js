const fetch = require('isomorphic-fetch');
const qs = require('query-string');
const normalize = require('json-api-normalizer');
const decodeJWT = require('jwt-decode');
require('./date-extensions');

class SDK {
  constructor(baseURL) {
    this.baseURL = baseURL || 'https://api.prod.headspace.com';
  }

  request(endpoint, method, data) {
    const query =
      method.toUpperCase() === 'GET' ? `?${qs.stringify(data)}` : '';
    const options = {
      method,
      headers: {
        'Content-type': 'application/json',
        Authorization: this.token ? `Bearer ${this.token}` : undefined,
      },
      body: data && !query ? JSON.stringify(data) : undefined,
    };
    return fetch(this.buildURL(`${endpoint}${query}`), options);
  }

  setAuth(token) {
    this.token = token;
    try {
      this.meta = decodeJWT(token);
    } catch (e) {
      this.token = null;
      this.meta = null;
    }
  }

  buildURL(endpoint) {
    return `${this.baseURL}${endpoint}`;
  }

  getMonthKey(date) {
    return `${date.getFullYear()}-${date.getMonth() + 1}`;
  }

  getDayKey(date) {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  }

  getWeekKey(date) {
    return `${date.getFullYear()}-${date.getMonth() +
      1}-${date.getWeekNumber()}`;
  }

  getCompletionsByMonth() {
    return this.allUserActivities().then(activities => {
      const aggregate = {};
      let firstDate;
      let lastDate;
      activities
        .filter(activity => activity.status === 'COMPLETE')
        .forEach(activity => {
          const { updatedAt } = activity;
          const createdAtDate = new Date(updatedAt);
          const dateKey = this.getMonthKey(createdAtDate);

          if (!firstDate) {
            firstDate = createdAtDate;
          } else {
            if (createdAtDate.valueOf() < firstDate.valueOf()) {
              firstDate = createdAtDate;
            }
          }

          if (!lastDate) {
            lastDate = createdAtDate;
          } else {
            if (createdAtDate.valueOf() > lastDate.valueOf()) {
              lastDate = createdAtDate;
            }
          }

          if (!aggregate[dateKey]) {
            aggregate[dateKey] = [];
          }
          aggregate[dateKey].push(activity);
        });

      let fillDate = firstDate;
      const now = new Date();
      while (this.getMonthKey(fillDate) !== this.getMonthKey(now)) {
        const key = this.getMonthKey(fillDate);
        if (!aggregate[key]) {
          aggregate[key] = [];
          aggregate[key].date = new Date(fillDate);
        }
        fillDate.setMonth(fillDate.getMonth() + 1);
      }
      return Promise.resolve(aggregate);
    });
  }

  getCompletionsByDay() {
    return this.allUserActivities().then(activities => {
      const aggregate = {};
      let firstDate;
      let lastDate;
      activities
        .filter(activity => activity.status === 'COMPLETE')
        .forEach(activity => {
          const { updatedAt } = activity;
          const createdAtDate = new Date(updatedAt);
          const dateKey = this.getDayKey(createdAtDate);

          if (!firstDate) {
            firstDate = createdAtDate;
          } else {
            if (createdAtDate.valueOf() < firstDate.valueOf()) {
              firstDate = createdAtDate;
            }
          }

          if (!lastDate) {
            lastDate = createdAtDate;
          } else {
            if (createdAtDate.valueOf() > lastDate.valueOf()) {
              lastDate = createdAtDate;
            }
          }

          if (!aggregate[dateKey]) {
            aggregate[dateKey] = [];
          }
          aggregate[dateKey].push(activity);
        });

      let fillDate = firstDate;
      const now = new Date();
      while (this.getDayKey(fillDate) !== this.getDayKey(now)) {
        const key = this.getDayKey(fillDate);
        if (!aggregate[key]) {
          aggregate[key] = [];
          aggregate[key].date = new Date(fillDate);
        }
        fillDate.setDate(fillDate.getDate() + 1);
      }
      return Promise.resolve(aggregate);
    });
  }

  getCompletionsByWeek() {
    return this.allUserActivities().then(activities => {
      const aggregate = {};
      let firstDate;
      let lastDate;
      activities
        .filter(activity => activity.status === 'COMPLETE')
        .forEach(activity => {
          const { updatedAt } = activity;
          const createdAtDate = new Date(updatedAt);
          const dateKey = this.getWeekKey(createdAtDate);

          if (!firstDate) {
            firstDate = createdAtDate;
          } else {
            if (createdAtDate.valueOf() < firstDate.valueOf()) {
              firstDate = createdAtDate;
            }
          }

          if (!lastDate) {
            lastDate = createdAtDate;
          } else {
            if (createdAtDate.valueOf() > lastDate.valueOf()) {
              lastDate = createdAtDate;
            }
          }

          if (!aggregate[dateKey]) {
            aggregate[dateKey] = [];
          }
          aggregate[dateKey].push(activity);
        });

      let fillDate = firstDate;
      const now = new Date();
      while (this.getWeekKey(fillDate) !== this.getWeekKey(now)) {
        const key = this.getWeekKey(fillDate);
        if (!aggregate[key]) {
          aggregate[key] = [];
          aggregate[key].date = new Date(fillDate);
        }
        fillDate.setDate(fillDate.getDate() + 1);
      }

      return Promise.resolve(aggregate);
    });
  }

  allUserActivities() {
    const query = {
      limit: -1,
      userId: this.meta ? this.meta.userId : undefined,
    };
    return this.request('/content/user-activities', 'GET', query)
      .then(response => {
        return response.json();
      })
      .then(data => {
        const { userActivities } = normalize.default(data);
        const activities = Object.keys(userActivities).map(id => {
          const activity = Object.assign({}, userActivities[id].attributes, {
            id,
          });
          return activity;
        });
        return Promise.resolve(activities);
      });
  }
}

module.exports = SDK;
module.exports.sdk = new SDK();
