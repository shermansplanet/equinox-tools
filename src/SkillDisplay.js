import React from "react";

export default class SkillDisplay extends React.Component {
  constructor(props) {
    super(props);
  }

  renderSkillTree = (id, depths, parent) => {
    var skills = this.props.skills;
    var skill = skills[id];
    var children = [];
    var depth = depths[id];
    for (var childid of (skill.children || []).sort((a, b) =>
      skills[a].name.localeCompare(skills[b].name)
    )) {
      if (depths[childid] == depth + 1) {
        var childparent = -1;
        for (var parentid of (skills[childid].parents || []).sort((a, b) =>
          skills[a].name.localeCompare(skills[b].name)
        )) {
          if (depths[parentid] == depth) {
            childparent = parentid;
            break;
          }
        }
        if (childparent == id) {
          children.push(this.renderSkillTree(childid, depths, id));
        }
      }
    }
    var parents = [];
    for (var parentid of skill.parents || []) {
      if (parentid != parent) {
        parents.push(
          <span className="small" key={parentid}>
            <i>({skills[parentid].name})</i>
          </span>
        );
      }
    }
    var color =
      skill.label == undefined
        ? "#fff"
        : {
            aspect: "#ffd",
            affinity: "#dff",
            skill: "#dfd"
          }[skill.label];
    const cid = id;
    return (
      <div key={id} className="skillGroup">
        <span className="skillDisp">
          <button
            className="skillDispButton"
            style={{ backgroundColor: color }}
            onClick={() => this.props.selectSkill(id)}
          >
            <b>{skill.name}</b>
          </button>
          {parents}
          <button
            className="addButton"
            key="addButton"
            onClick={() => {
              this.props.newSkillOverride(cid);
            }}
          >
            +
          </button>
        </span>
        <div className="childDisp">{children}</div>
      </div>
    );
  };

  setDepthsRecursive = (depths, id, depth) => {
    depths[id] = depth;
    var skill = this.props.skills[id];
    for (var c of skill.children || []) {
      depths = this.setDepthsRecursive(depths, c, depth + 1);
    }
    return depths;
  };

  render() {
    var skills = this.props.skills;
    var depths = {};
    var roots = [];
    for (var id in skills) {
      var skill = skills[id];
      if ((skill.parents || []).length == 0) {
        roots.push(id);
        depths = this.setDepthsRecursive(depths, id, 0);
      }
    }
    return <div>{roots.map(val => this.renderSkillTree(val, depths))}</div>;
  }
}
