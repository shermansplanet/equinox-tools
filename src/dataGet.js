import app from "firebase/app";
import "firebase/firestore";

var collectionList = {};
var isReady = false;
const collectionLabels = ["actions", "locations", "items", "skills", "markets"];
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
        collectionList[collectionLabel][doc.id] = doc.data();
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
