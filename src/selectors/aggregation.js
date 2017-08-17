import { format, startOfWeek, getHours } from 'date-fns';

const breakdownHelpers = {
  month: {
    getKey(date) {
      return `${format(date, 'YYYY-MM')}`;
    },
    incrementDate(date) {
      date.setMonth(date.getMonth() + 1);
    },
  },
  day: {
    getKey(date) {
      return `${format(date, 'YYYY-MM-DD')}`;
    },
    incrementDate(date) {
      date.setDate(date.getDate() + 1);
    },
  },
  week: {
    getKey(date) {
      return `${format(startOfWeek(date, { weekStartsOn: 1 }), 'YYYY-MM-DD')}`;
    },
    incrementDate(date) {
      date.setDate(date.getDate() + 1);
    },
  },
};

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

export const byTimeOfDay = activities => {
  if (!activities.length) return [];
  const aggregate = {};
  activities.forEach(activity => {
    const { completedAt } = activity;
    const date = new Date(completedAt);
    const hour = getHours(date);
    if (!aggregate[hour]) {
      aggregate[hour] = 0;
    }

    aggregate[hour] += 1;
  });
  let fill = 0;
  while (fill < 24) {
    if (!aggregate[fill]) {
      aggregate[fill] = 0;
    }
    fill += 1;
  }
  // transform for charts
  return Object.keys(aggregate).sort((prev, next) => prev - next).map(key => ({
    amount: aggregate[key],
    name: formatTime(key),
  }));
};

export const metitatesTimeOfDay = timeOfDayAgg => {
  const sections = {
    morning: [4, 5, 6, 7, 8, 9, 10].map(formatTime),
    afternoon: [11, 12, 13, 14, 15, 16].map(formatTime),
    night: [17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3].map(formatTime),
  };
  const counts = {
    morning: 0,
    afternoon: 0,
    night: 0,
  };
  timeOfDayAgg.forEach(agg => {
    Object.keys(sections).forEach(section => {
      if (sections[section].indexOf(agg.name) !== -1) {
        counts[section] += agg.amount;
      }
    });
  });
  return Object.keys(counts)
    .map(key => [key, counts[key]])
    .reduce((cur, prev) => {
      if (cur[1] < prev[1]) {
        return prev;
      }
      return cur;
    })
    .shift();
};

function formatTime(_time) {
  const time = +_time;
  if (!time) return '12 AM';
  let m = time >= 12 ? 'PM' : 'AM';
  let hour = time > 12 ? time - 12 : time;
  return `${hour} ${m}`;
}
