const CHART_COLOR = '#f58b44';

const breakdownHelpers = {
  month: {
    getKey(date) {
      return `${date.getFullYear()}-${date.getMonth() + 1}`;
    },
    incrementDate(date) {
      date.setMonth(date.getMonth() + 1);
    },
  },
  day: {
    getKey(date) {
      return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    },
    incrementDate(date) {
      date.setDate(date.getDate() + 1);
    },
  },
  week: {
    getKey(date) {
      return `${date.getFullYear()}-${date.getMonth() + 1}-${getWeekNumber(
        date
      )}`;
    },
    incrementDate(date) {
      date.setDate(date.getDate() + 1);
    },
  },
};

function getWeekNumber(date) {
  var d = new Date(+date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  return Math.ceil(((d - new Date(d.getFullYear(), 0, 1)) / 8.64e7 + 1) / 7);
}

export const byDate = (breakdown, activities, options = {}) => {
  if (!activities.length) return {};
  const aggregate = {};
  const { total } = options;
  const { getKey, incrementDate } =
    breakdownHelpers[breakdown] || breakdownHelpers.day;
  let firstDate;
  let lastDate;
  activities.forEach(activity => {
    const { completedAt, activityGroupName } = activity;
    const createdAtDate = new Date(completedAt);
    const dateKey = getKey(createdAtDate);

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
      aggregate[dateKey] = {};
      aggregate[dateKey].date = activity.completedAt;
    }

    if (total) {
      if (!aggregate[dateKey].sessions) {
        aggregate[dateKey].sessions = [];
      }
      aggregate[dateKey].sessions.push(activity);
      return;
    }

    if (!aggregate[dateKey][activityGroupName]) {
      aggregate[dateKey][activityGroupName] = [];
    }
    aggregate[dateKey][activityGroupName].push(activity);
  });

  let fillDate = firstDate;
  const now = new Date();
  while (getKey(fillDate) !== getKey(now)) {
    const key = getKey(fillDate);
    if (!aggregate[key]) {
      aggregate[key] = {};
      aggregate[key].date = new Date(fillDate);
    }
    incrementDate(fillDate);
  }
  return aggregate;
};
