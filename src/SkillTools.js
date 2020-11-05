import React from "react";
import SkillNew from "./SkillNew";
import SkillDisplay from "./SkillDisplay";
import app from "firebase/app";
import "firebase/firestore";

export default class SkillTools extends React.Component {
  constructor(props) {
    super(props);
    this.db = app.firestore();
    this.db.collection("skills").onSnapshot(snapshot => {
      var skills = {};
      snapshot.forEach(doc => {
        skills[doc.id] = doc.data();
      });
      this.setState({ skills });
    });
    this.state = {
      skills: {},
      selected: null
    };
  }

  addSkill = async skill => {
    if (skill.baseSkill != null) {
      return await this.updateSkill(skill);
    }
    var newDoc = await this.db.collection("skills").add({
      name: skill.name,
      children: [],
      parents: skill.parents
    });

    for (var parentid of skill.parents || []) {
      var children = this.state.skills[parentid].children || [];
      children.push(newDoc.id);
      await this.db
        .collection("skills")
        .doc(parentid)
        .set({ children }, { merge: true });
    }
    this.processSkills();
  };

  updateSkill = async skill => {
    var id = skill.baseSkill;
    var ref = this.db.collection("skills").doc(id);
    var skillData = (await ref.get()).data();

    for (var parentid of skillData.parents || []) {
      if (skill.parents.includes(parentid)) continue;
      var children = this.state.skills[parentid].children || [];
      var index = children.indexOf(id);
      children.splice(index, 1);
      await this.db
        .collection("skills")
        .doc(parentid)
        .set({ children }, { merge: true });
    }

    for (parentid of skill.parents || []) {
      if (skillData.parents.includes(parentid)) continue;
      var children = this.state.skills[parentid].children || [];
      children.push(id);
      await this.db
        .collection("skills")
        .doc(parentid)
        .set({ children }, { merge: true });
    }

    skillData.name = skill.name;
    skillData.parents = skill.parents;
    await ref.set(
      {
        name: skill.name,
        parents: skill.parents
      },
      { merge: true }
    );
    this.processSkills();
  };

  deleteSkill = async skill => {
    var id = skill.baseSkill;
    var ref = this.db.collection("skills").doc(id);
    var skillData = (await ref.get()).data();

    for (var parentid of skillData.parents || []) {
      var children = this.state.skills[parentid].children || [];
      var index = children.indexOf(id);
      children.splice(index, 1);
      await this.db
        .collection("skills")
        .doc(parentid)
        .set({ children }, { merge: true });
    }

    for (var childid of skillData.children || []) {
      var parents = this.state.skills[childid].parents || [];
      var index = parents.indexOf(id);
      parents.splice(index, 1);
      await this.db
        .collection("skills")
        .doc(childid)
        .set({ parents }, { merge: true });
    }

    await ref.delete();
    this.processSkills();
  };

  processSkillsRecursive = (id, label) => {
    var l = this.skillLabels[id];
    if (l === label) return;
    if (l === undefined) {
      l = label;
    } else {
      l = "skill";
    }
    this.skillLabels[id] = l;
    for (var child of this.state.skills[id].children || []) {
      this.processSkillsRecursive(child, label);
    }
  };

  processSkills = () => {
    this.skillLabels = {};
    for (var i in this.state.skills) {
      var skill = this.state.skills[i];
      if ((skill.parents || []).length == 0) {
        this.processSkillsRecursive(i, skill.name);
      }
    }
    for (var i in this.skillLabels) {
      this.db
        .collection("skills")
        .doc(i)
        .set({ label: this.skillLabels[i] }, { merge: true });
    }
  };

  render() {
    return (
      <div>
        <SkillDisplay
          skills={this.state.skills}
          selectSkill={id => {
            this.setState({ selected: id });
          }}
          newSkillOverride={data => {
            this.setState({ selected: null });
            this.newSkillOverride(data);
          }}
        />
        <SkillNew
          baseSkill={this.state.selected}
          cb={this.addSkill}
          deletecb={this.deleteSkill}
          skills={this.state.skills}
          setOverride={cb => (this.newSkillOverride = cb)}
        />
      </div>
    );
  }
}
