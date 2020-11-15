import React from "react";
import app from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
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

  getAllChildren = (skills, id) => {
    let skill = skills[id];
    let children = [...skill.children];
    for (let child of skill.children) {
      children.push(...this.getAllChildren(skills, child));
    }
    return children;
  };

  linkToItem = (itemId, skillId, items, skills) => {
    for (let i of items[itemId].subtypes) {
      let newId = i + "_skill";
      if (!skills[skillId].children.includes(newId)) {
        skills[skillId].children.push(newId);
      }
      let parents = [skillId];
      if (skills[newId] !== undefined) {
        for (let i of skills[newId].parents) {
          if (i !== skillId) {
            parents.push(i);
          }
        }
      }
      skills[newId] = {
        name: items[i].plural,
        parents,
        children: []
      };
      this.linkToItem(i, newId, items, skills);
    }
  };

  updateSkillLabels = (skills, id, parentLabel) => {
    let skill = skills[id];
    if (skill.label == undefined) {
      skill.label = parentLabel;
    } else if (skill.label != parentLabel) {
      skill.label = "skill";
    }
    for (let child of skill.children) {
      this.updateSkillLabels(skills, child, skill.label);
    }
  };

  updateSkillsFromItems = items => {
    let skills = GetCollection("skills");
    let beginningSnapshot = {};

    let rootSkills = [];

    for (let i in skills) {
      beginningSnapshot[i] = JSON.stringify(skills[i]);
      skills[i].children = [];
      skills[i].label = undefined;
      if (skills[i].parents.length == 0) {
        rootSkills.push(i);
      }
    }

    for (let i in skills) {
      let newParents = [];
      for (let parent of skills[i].parents) {
        if (skills[parent] == undefined) {
          continue;
        }
        newParents.push(parent);
        skills[parent].children.push(i);
      }
      skills[i].parents = newParents;
    }

    for (let i in skills) {
      let skill = skills[i];
      if (skill.itemLink) {
        this.linkToItem(skill.itemLink, i, items, skills);
      }
    }

    for (let i of rootSkills) {
      this.updateSkillLabels(skills, i, skills[i].name);
    }

    for (let i in skills) {
      let skill = skills[i];
      if (beginningSnapshot[i] == JSON.stringify(skill)) {
        continue;
      }
      app
        .firestore()
        .collection("skills")
        .doc(i)
        .set(skill);
    }
  };

  getAllChildItems = (items, id) => {
    let item = items[id];
    let children = [id];
    if (item.subtypes !== undefined) {
      for (let child of item.subtypes) {
        children.push(...this.getAllChildItems(items, child));
      }
    }
    return children;
  };

  setTraitsRecursively = (items, id, parent = {}) => {
    let item = items[id];
    let subtypes = [...item.subtypes];
    let q = 0;
    item.varietyType =
      item.varietyType || item.baseVarietyType || parent.varietyType || null;

    if (item.varietyType !== null) {
      item.possibleVarieties = this.getAllChildItems(items, item.varietyType);
    }

    item.derivedValue =
      item.derivedValue || item.value || parent.derivedValue || 0;
    for (let i in parent.traits || {}) {
      item.traits[i] = parent.traits[i];
    }
    for (let i in item.baseTraits || {}) {
      item.traits[i] = item.baseTraits[i];
    }
    for (let i in parent.defaultStates || {}) {
      item.defaultStates[i] = parent.defaultStates[i];
    }
    for (let i in item.baseDefaultStates || []) {
      let state = item.baseDefaultStates[i];
      item.defaultStates[state.name] = state.defaultValues;
    }
    for (let child of subtypes) {
      q = Math.max(q, this.setTraitsRecursively(items, child, item) + 1);
    }
    if (item.varietyType) {
      q = Math.max(q, this.setTraitsRecursively(items, item.varietyType));
    }
    items[id].minq = q;
    return q;
  };

  updateActionRequirements = items => {
    var actions = GetCollection("actions");
    for (var index in actions) {
      const i = index;
      let action = actions[i];
      let matchingIds = {};
      let needsIdMatch = false;
      for (let id in action.costs) {
        needsIdMatch = true;
        matchingIds[id] = this.getAllChildItems(items, id);
      }
      for (let id in action.requirements) {
        needsIdMatch = true;
        matchingIds[id] = this.getAllChildItems(items, id);
      }
      if (!needsIdMatch) {
        continue;
      }
      app
        .firestore()
        .collection("actions")
        .doc(i)
        .set({ matchingIds }, { merge: true });
    }
  };

  deriveTraits = () => {
    var alchemyItems = [];
    var items = GetCollection("items");
    let beginningSnapshot = {};
    let otherItems = [];
    let baseItem = "Payc5snfnDmOqQTeJ502";
    for (var i in items) {
      let item = items[i];
      item.id = i;
      if ((item.is !== undefined && item.is.length > 0) || i == baseItem) {
        beginningSnapshot[i] = JSON.stringify(item);
        item.subtypes = [];
        item.minq = -1;
        item.traits = {};
        item.defaultStates = {};
        item.plural = item.pluralOverride || item.name + "s";
        item.derivedValue = 0;
        item.varietyType = undefined;
        item.possibleVarieties = [];
        alchemyItems.push(item);
      } else {
        otherItems.push(item);
      }
    }
    for (var item of alchemyItems) {
      for (var parent of item.is) {
        if (items[parent] == undefined) {
          console.log(item.name, parent);
          continue;
        }
        if (items[parent].subtypes == undefined) {
          items[parent].subtypes = [];
        }
        items[parent].subtypes.push(item.id);
      }
    }

    let baseq = this.setTraitsRecursively(items, baseItem);
    const maxq = 50;
    for (var item of alchemyItems) {
      item.minq = Math.ceil(Math.pow(2, (item.minq * maxq) / baseq)) - 1;
    }

    this.updateSkillsFromItems(items);

    this.updateActionRequirements(items);

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
            varietyType: item.varietyType,
            traits: item.traits,
            plural: item.plural,
            defaultStates: item.defaultStates,
            derivedValue: item.derivedValue,
            possibleVarieties: item.possibleVarieties
          },
          { merge: true }
        );
    }

    for (var item of otherItems) {
      app
        .firestore()
        .collection("items")
        .doc(item.id)
        .set(
          {
            plural: item.pluralOverride || item.name + "s"
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
