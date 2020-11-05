import React from "react";
import app from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import SkillTools from "./SkillTools";
import ArbitraryData from "./ArbitraryData";
import { Init, GetCollection } from "./dataGet";

export default class Main extends React.Component {
  constructor(props) {
    super(props);
    var firebaseConfig = {
      apiKey: "AIzaSyDa_29u_EWqM0zXurRUnD_5QSMpYPbE5jU",
      authDomain: "equinox-engine.firebaseapp.com",
      databaseURL: "https://equinox-engine.firebaseio.com",
      projectId: "equinox-engine",
      storageBucket: "equinox-engine.appspot.com",
      messagingSenderId: "479848169963",
      appId: "1:479848169963:web:cb68f3f2a764d72b31d9ae",
      measurementId: "G-JSTKKZ228S"
    };
    if (!app.apps.length) {
      app.initializeApp(firebaseConfig);
    }
    this.auth = app.auth();
    this.state = {
      email: "",
      password: "",
      authUser: null,
      currentTab: "items"
    };
  }

  componentDidMount() {
    this.auth.onAuthStateChanged(authUser => {
      if (authUser) {
        this.setState({ authUser });
        Init();
      } else {
        this.setState({ authUser: null });
      }
    });
  }

  signIn = () => {
    this.auth.signInWithEmailAndPassword(this.state.email, this.state.password);
  };

  setTraitsRecursively = (items, id, parent = {}) => {
    let item = items[id];
    let subtypes = [...item.subtypes];
    let q = 0;
    item.varietyType = item.baseVarietyType || parent.varietyType || null;
    for (let child of subtypes) {
      q = Math.max(q, this.setTraitsRecursively(items, child, item) + 1);
    }
    if (item.varietyType) {
      q = Math.max(q, this.setTraitsRecursively(items, item.varietyType));
    }
    items[id].minq = q;
    return q;
  };

  deriveTraits = () => {
    var alchemyItems = [];
    var items = GetCollection("items");
    var beginningSnapshot = {};

    let baseItem = "Payc5snfnDmOqQTeJ502";
    for (var i in items) {
      if (
        (items[i].is !== undefined && items[i].is.length > 0) ||
        i == baseItem
      ) {
        beginningSnapshot[i] = JSON.stringify(items[i]);
        items[i].subtypes = [];
        items[i].id = i;
        items[i].minq = -1;
        alchemyItems.push(items[i]);
      }
    }
    for (var item of alchemyItems) {
      for (var parent of item.is) {
        if (items[parent] == undefined) {
          console.log(item.name, parent);
          continue;
        }
        items[parent].subtypes.push(item.id);
      }
    }

    let baseq = this.setTraitsRecursively(items, baseItem);
    const maxq = 5;
    for (var item of alchemyItems) {
      item.minq = Math.ceil(Math.pow(10, (item.minq * maxq) / baseq)) - 1;
    }

    for (var item of alchemyItems) {
      if (beginningSnapshot[item.id] == JSON.stringify(items[item.id])) {
        continue;
      }
      app
        .firestore()
        .collection("items")
        .doc(item.id)
        .set(
          {
            minq: item.minq,
            isAlchemical: true,
            subtypes: item.subtypes,
            varietyType: item.varietyType
          },
          { merge: true }
        );
    }
  };

  render() {
    if (this.state.authUser != null) {
      var content = (
        <ArbitraryData
          key={this.state.currentTab}
          datatype={this.state.currentTab}
        />
      );
      return (
        <div>
          <button onClick={() => this.setState({ currentTab: "skills" })}>
            SKILLS
          </button>
          <button onClick={() => this.setState({ currentTab: "locations" })}>
            LOCATIONS
          </button>
          <button onClick={() => this.setState({ currentTab: "actions" })}>
            ACTIONS
          </button>
          <button onClick={() => this.setState({ currentTab: "items" })}>
            ITEMS
          </button>
          <button onClick={() => this.setState({ currentTab: "markets" })}>
            MARKETS
          </button>
          {content}
          <button onClick={this.deriveTraits}>Derive Traits</button>
        </div>
      );
    }
    return (
      <div className="main">
        {this.state.authUser == null ? "None" : this.state.authUser.email}
        <input
          placeholder="email"
          value={this.state.email}
          onChange={e => this.setState({ email: e.target.value })}
        />
        <input
          placeholder="password"
          type="password"
          value={this.state.password}
          onChange={e => this.setState({ password: e.target.value })}
        />
        <button onClick={this.signIn}> Login </button>
      </div>
    );
  }
}
