'use strict';

let _ = require('lodash');

// list of all days and accepted abbreviations
let all = [
  { index: "monday", abbr: 'mon', },
  { index: "tuesday", abbr: 'tue', },
  { index: "wednesday", abbr: 'wed', },
  { index: "thursday", abbr: 'thu', },
  { index: "friday", abbr: 'fri', },
  { index: "saturday", abbr: 'sat', },
  { index: "sunday", abbr: 'sun', },
]

// try to pars
let getDays = (string) => {
  // collect stated list of days
  let days = [];

  // weekdays
  if (string.match(/every/i)) {
    for (let a = 0; a < all.length; a++) {
      days.push(all[a].index);
    }
    return days;
  }

  // weekdays
  if (string.match(/weekda/i)) {
    for (let a = 0; a < 5; a++) {
      days.push(all[a].index);
    }
    return days;
  }

  // weekends
  if (string.match(/weeke/i)) {
    for (let a = 5; a < 7; a++) {
      days.push(all[a].index);
    }
    return days;
  }

  _.forEach(all, data => {
    let pattern = `${data.abbr}`;
    let re = new RegExp(pattern, 'i')
    if (string.match(re)) {
      days.push(data.index);
    }
  });

  // check for multiple days
  return days;
}

let getTimes = (string) => {
  // all day
  if (string.match(/24/)) {
    return ['00:00', '23:59'];
  }

  // validate time
  let results = string.match(/[0-9]{1,2}(:)?([0-9]{2,2})?[ ]?(a|am|p|pm)?/g);
  if (!results) {
    return [];
  }

  let parts = [];
  results.forEach(result => {
    parts.push(formatTime(result));
  });
  return parts;
}

let formatTime = (string) => {
  // build time structure
  let hour;
  let minute;
  let time = "";
  let pm = false;
  string = string.replace(/ /, '');

  // if there are colons
  if (string.match(/:/)) {
    hour = parseInt(string.replace(/:.*$/, ''));
    minute = string.replace(/^.*:/, '');
  } else {
    hour = parseInt(string.replace(/[^0-9]/, ''));
    minute = "0";
  }

  // bump to 24 hour format
  if (string.match(/p/i) && hour != 12) {
    hour += 12;
  }
  minute = parseInt(minute.replace(/[^0-9]/, ''));

  // start building final time
  if (hour < 10) {
    time = "0";
  }

  time += `${hour}:`;
  if (minute < 10) {
    time += "0";
  }
  time += minute;
  return time;
}

let parse = (string) => {
  let parts = [];
  let lastdays = [];
  let hours = { periods: [] };

  if (string == "24 hours") {
    _.forEach(all, day => {
      let times = getTimes("24");
      let period = {
        openDay: day.index.toUpperCase(),
        closeDay: day.index.toUpperCase(),
        openTime: times[0],
        closeTime: times[1]
      };
      hours.periods.push(period);
    });
  } else {
    string.split(",").forEach(part => {
      parts.push(part.trim().toLowerCase());
    });
    parts.forEach(part => {
      // get the days and see if we're using the previous day
      let days = getDays(part);
      if (days.length > 0) {
        lastdays = days;
      } else {
        days = lastdays;
      }
      let times = getTimes(part);
      if (times.length > 0) {
        days.forEach(day => {
          let period = {
            openDay: day.toUpperCase(),
            closeDay: day.toUpperCase(),
            openTime: times[0],
            closeTime: times[1]
          };

          hours.periods.push(period);
        });
      }
    });
  }

  return hours;
}

module.exports = parse;
