const bot = require('./bot'),
      monk = require('monk'),
      dbUri = process.env.MONGO || 'mongodb://localhost:27017/notes',
      db = monk(dbUri),
      notes = db.get('notes'),
      cronNote = require('cron').CronJob,
      sendDataCurrency = require('./currency').sendDataCurrency,
      sendCustomDataCurrency = require('./currency').sendCustomDataCurrency;

/* Cron Hash */

const cronNoteHash = new Map();

function getNoteId(user, time, msg) {
  return `${user}${time.h}${time.m}${msg}`;
}

function stopNote(user, time, msg) {
  if (cronNoteHash.has(getNoteId(user, time, msg))) {
      cronNoteHash.get(getNoteId(user, time, msg)).stop();
  }
}

function setCronNote(user, time, msg, tz) {
  const noteTime = `00 ${time.m} ${time.h} * * *`;

  const note = new cronNote({
    cronTime: noteTime,
    onTick() {
      if (msg.match(/\/cc\s+([a-z]+)/)) {
        const match = msg.match(/\/cc\s+([a-z]+)/),
              unit = match[1].toUpperCase();

        sendDataCurrency(unit, user, 'latest');

        return;
      } else if (msg.match(/\/cc\s+([\d,.\s]+)\s+([a-z]+)\s+to\s+([a-z]+)/)) {
        const match = msg.match(/\/cc\s+([\d,.\s]+)\s+([a-z]+)\s+to\s+([a-z]+)/),
              unitNum = match[1],
              unit = match[2].toUpperCase(),
              unitCon = match[3].toUpperCase();

        sendCustomDataCurrency(unitNum, unit, unitCon, user, 'latest');

        return;
      }

      bot.sendMessage(user, msg);
    },
    start: true,
    timeZone: tz
  });

  cronNoteHash.set(getNoteId(user, time, msg), note);
}

/* Set note from database */

db.then(() => {
  notes.find({}).each((item) => {
    const user = item.name,
          tz = item.tz;

    if (item.notifications) {
      item.notifications.forEach((item) => {
        setCronNote(user, item[0], item[1], tz);
      });
    }
  }).then(() => {
    console.log('Set notes!');
  });
});

/* Set note */

bot.onText(/\/note +(\d+):(\d+)\s+-\s+(.+)/, (msg, match) => {
  const userId = msg.from.id,
        timeObj = { h: match[1], m: match[2] },
        noteMsg = match[3];

  notes.findOne({ name: userId }).then((user) => {
    if (user && user.timezone) {
      notes.update(
        { name: userId },
        { 
          $push: { notifications: [timeObj, noteMsg] }
        }
      ).then(() => {
        setCronNote(userId, timeObj, noteMsg, user.timezone);
        getNoteList(userId);
      });
    } else {
      bot.sendMessage(userId, 'Please use /tz to set the timezone');
    }
  });
});

/* Get note list */

function getNoteList(userId) {
  let noteList,
      noteNum = 0;
 
  notes.findOne({ name: userId }).then((user) => {
    if (user && user.notifications && user.notifications != 0) {
      noteList = user.notifications.map((note) => {
        return `${++noteNum}. ${note[0].h}:${note[0].m} - ${note[1]}`;
      });

      bot.sendMessage(userId, '<b>Your note list:</b>\n\n' + noteList.join('\n') + '\n\nTimezone: ' + user.timezone, {
        parse_mode: 'HTML'
      });
    } else {
      bot.sendMessage(userId, 'List of notes is empty');
    }
  });
}

bot.onText(/\/note_ls/, (msg, match) => {
  getNoteList(msg.from.id);
});

/* Remove note */

bot.onText(/\/note_rm (.+)/, (msg, match) => {
  const userId = msg.from.id,
        noteNum = match[1] - 1;

  function delNote(num) {
    notes.update(
      { name: userId }, 
      { 
        $pull: { notifications: num }
      }
    ).then(() => {
      stopNote(userId, num[0], num[1]);
    });
  }

  notes.findOne({ name: userId }).then((user) => {
    const noteList = user.notifications;

    if (match[1] == 'all') {
      noteList.forEach((item) => {
        delNote(item);
      });
    } else if (noteList[noteNum]) {
      delNote(noteList[noteNum]);
    }
  }).then(() => {
    setTimeout(() => {
      getNoteList(userId);
    }, 1000);
  });
});

/* Time zone */

const moment = require('moment-timezone'),
      cityTimezones = require('city-timezones');

bot.onText(/(\/tz)$/, (msg, match) => {
  const userId = msg.from.id;

  notes.findOne({ name: userId }).then((user) => {
    if (user && user.timezone) {
      bot.sendMessage(userId, 'Your timezone: ' + user.timezone);
    } else {
      bot.sendMessage(userId, 'Please set your timezone, \nexample: /tz Moscow');
    }
  });
});

bot.onText(/\/tz (.+)/, (msg, match) => {
  const userId = msg.from.id,
        userCity = match[1].charAt(0).toUpperCase() + match[1].slice(1),
        checkCity = cityTimezones.lookupViaCity(userCity),
        checkZone = moment.tz.zone(userCity);

  let timezone;

  if (checkZone) {
    timezone = checkZone.name;
  } else if (checkCity.length != 0) {
    timezone = checkCity[0].timezone;
  } else {
    timezone = false;
  }

  if (timezone) {
    notes.findOne({ name: userId }).then((user) => {
      if (user) {
        notes.update(
          { name: userId },
          { 
            $set: { timezone: timezone }
          }
        ).then(() => {
          if (user.notifications) {
            user.notifications.forEach((item) => {
              stopNote(userId, item[0], item[1]);
              setCronNote(userId, item[0], item[1], timezone);
            });
          }

          bot.sendMessage(userId, 'Your timezone: ' + timezone);
        });
      } else {
        notes.insert(
          {
            name: userId,
            timezone: timezone
          }
        ).then(() => {
          bot.sendMessage(userId, 'Your timezone: ' + timezone);
        });
      }
    });
  } else {
    bot.sendMessage(userId, 'Unknown city');
  }
});