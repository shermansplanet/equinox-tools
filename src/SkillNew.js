import React from "react";

export default class SkillNew extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      parents: [],
      selected: "",
      baseSkill: null,
      itemLink: ""
    };
    this.props.setOverride(data => this.setState(data));
  }

  componentDidUpdate() {
    var id = this.props.baseSkill;
    if (this.state.baseSkill != id) {
      this.setState({
        name: this.props.skills[id].name,
        parents: this.props.skills[id].parents || [],
        baseSkill: id
      });
    }
  }

  render() {
    var skillList = [<option key={0} value={0} />];
    for (var id in this.props.skills || {}) {
      if (this.state.parents.includes(id)) {
        continue;
      }
      skillList.push(
        <option key={id} value={id}>
          {this.props.skills[id].name}
        </option>
      );
    }
    var parentDisplay = this.state.parents.map(val => {
      const v = val;
      return (
        <div key={v}>
          <button
            onClick={() => {
              const index = this.state.parents.indexOf(v);
              var newSelected = 0;
              for (var i in this.props.skills) {
                var id = i;
                if (id == v || !this.state.parents.includes(id)) {
                  newSelected = id;
                  break;
                }
              }
              this.setState(prevState => {
                prevState.selected = newSelected;
                prevState.parents.splice(index, 1);
                return prevState;
              });
            }}
          >
            -
          </button>
          {this.props.skills[v].name}
        </div>
      );
    });
    return (
      <div>
        <h4>{this.props.baseSkill == null ? "Add Skill:" : "Edit Skill:"}</h4>
        <div>
          <input
            id="addSkillName"
            placeholder="skill name"
            value={this.state.name}
            onChange={e => this.setState({ name: e.target.value })}
          />
        </div>
        {parentDisplay}
        <div>
          <button
            onClick={() => {
              var newSelected = 0;
              for (var i in this.props.skills) {
                var id = i;
                if (
                  !this.state.parents.includes(id) &&
                  id != this.state.selected
                ) {
                  newSelected = id;
                  break;
                }
              }
              this.setState(prevState => {
                prevState.parents.push(this.state.selected);
                prevState.selected = newSelected;
                return prevState;
              });
            }}
          >
            +
          </button>
          <select
            name="skills"
            id="skills"
            value={this.state.selected}
            onChange={e => {
              this.setState({ selected: e.target.value });
            }}
          >
            {skillList}
          </select>
        </div>

        <button
          onClick={() => {
            this.props.cb({
              name: this.state.name,
              parents: this.state.parents,
              baseSkill: this.state.baseSkill
            });
            this.setState({
              name: "",
              parents: [],
              selected: 0,
              baseSkill: null
            });
          }}
        >
          Add
        </button>
        <button
          disabled={this.state.baseSkill == null}
          onClick={() => {
            this.props.deletecb({
              name: this.state.name,
              parents: this.state.parents,
              baseSkill: this.state.baseSkill
            });
            this.setState({
              name: "",
              parents: [],
              selected: 0,
              baseSkill: null
            });
          }}
        >
          Delete
        </button>
      </div>
    );
  }
}
