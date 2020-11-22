import app from "firebase/app";
import "firebase/firestore";

var collectionList = {};
var isReady = false;
const collectionLabels = [
  "actions",
  "locations",
  "items",
  "skills",
  "markets",
  "votes"
];
var callbacks = [];
var subscriptions = [];

export function WhenReady(cb) {
  if (isReady) {
    cb();
    return;
  }
  callbacks.push(cb);
}

export function Subscribe(cb) {
  subscriptions.push(cb);
}

export function Init() {
  var db = app.firestore();
  var ready = 0;
  for (var cl of collectionLabels) {
    const collectionLabel = cl;
    db.collection(collectionLabel).onSnapshot(snap => {
      collectionList[collectionLabel] = {};
      for (var doc of snap.docs) {
        let data = doc.data();
        collectionList[collectionLabel][doc.id] = data;
      }
      ready++;
      if (ready == collectionLabels.length) {
        for (var id in collectionList["actions"]) {
          var action = collectionList["actions"][id];
          if (action.checkpoint != undefined) {
            collectionList["items"]["checkpoint_" + action.checkpoint] = {};
          }
        }
        for (var cb of callbacks) {
          cb();
        }
        isReady = true;
      } else if (ready > collectionLabels.length) {
        for (var cb of subscriptions) {
          cb(ready);
        }
      }
    });
  }
}

export function GetCollection(collection) {
  return collectionList[collection];
}

export function GetTraits(raw) {
  let item = {};
  let parts = raw.split("&");
  item.id = parts[0];
  for (let i = 1; i < parts.length; i++) {
    let keyval = parts[i].split("=");
    if (keyval[1] === "undefined") {
      continue;
    }
    let val = JSON.parse(keyval[1]);
    if (!isNaN(val)) {
      val = parseFloat(val);
    }
    item[keyval[0]] = val;
  }
  return item;
}
