const bot = require('./bot'),
      mongoClient = require("mongodb").MongoClient,
      dbUri = process.env.MONGO || 'mongodb://localhost:27017/notes',
      cronNote = require('cron').CronJob;

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

function setCronNote(user, time, msg) {
  const noteTime = `00 ${time.m} ${time.h} * * *`;

  const note = new cronNote({
    cronTime: noteTime,
    onTick() {
      bot.sendMessage(user, msg);
    },
    start: true,
    timeZone: process.env.TZ
  });

  cronNoteHash.set(getNoteId(user, time, msg), note);
}

/* Set note */

mongoClient.connect(dbUri, (err, db) => {
  const collection = db.collection("notes");
  
  collection.find({}).toArray((err, results) => {
    results.forEach((item) => {
      const user = item.name;

      item.notifications.forEach((item) => {
        setCronNote(user, item[0], item[1]);
      });
    });
  });
});

/* Set note */

bot.onText(/\/nt +([0-9]+):([0-9]+)\s+-\s+(.+)/, (msg, match) => {
  const userId = msg.from.id,
        timeObj = { h: match[1], m: match[2] },
        noteMsg = match[3];

  setCronNote(msg.from.id, timeObj, noteMsg);

  mongoClient.connect(dbUri, (err, db) => {
    const collection = db.collection("notes");
    
    collection.findOne({ name: userId }, (err, user) => {
      if (user) {
        collection.updateOne(
          { name: userId },
          { 
            $push: { notifications: [timeObj, noteMsg] }
          },
          (err, result) => {
            db.close();
          }
        );
      } else {
        collection.insertOne(
          {
            name: userId,
            notifications: [[timeObj, noteMsg]]
          }, 
          (err, result) => {
            db.close();
          }
        );
      }
    });
  });
});

/* Get note list */

bot.onText(/\/ls/, (msg, match) => {
  const userId = msg.from.id;

  mongoClient.connect(dbUri, (err, db) => {
    const collection = db.collection("notes");

    let noteList,
        noteNum = 0;
    
    collection.find({ name: userId }).toArray((err, results) => {
      noteList = results[0].notifications.map((note) => {
        return `${++noteNum}. ${note[0].h}:${note[0].m} - ${note[1]}`;
      });

      bot.sendMessage(userId, noteList.join("\n"));
    });
  });
});

/* Remove note */

bot.onText(/\/rm (.+)/, (msg, match) => {
  const userId = msg.from.id,
        noteNum = match[1] - 1;

  let noteDel;

  mongoClient.connect(dbUri, (err, db) => {
    const collection = db.collection("notes");
    
    collection.find({ name: userId }).toArray((err, results) => {
      noteDel = results[0].notifications[noteNum];

      collection.update(
        { name: userId }, 
        { 
          $pull: { notifications: noteDel }
        },
        (err, result) => {
          db.close();
        }
      );

      stopNote(userId, noteDel[0], noteDel[1]);
    });
  });
});