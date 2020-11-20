import React from "react";
import { templates } from "./typedata";
import { WhenReady, GetCollection, Subscribe } from "./dataGet";
import app from "firebase/app";
import "firebase/firestore";
import SkillDisplay from "./SkillDisplay";

export default class ArbitraryData extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ready: false,
      id: null,
      revision: 0,
      collapsed: { VqcpyIT7MZNAralTKGt1: true, VT7g2nD1mILf0eIvamkA: true }
    };
  }

  componentDidMount() {
    let datatype = this.state.overrideDatatype || this.props.datatype;
    WhenReady(() =>
      this.setState({
        data: this.genDefaultData(datatype, []),
        ready: true
      })
    );
    Subscribe(n => this.setState({ revision: n }));
  }

  genDefaultData = datatype => {
    if (templates[datatype] != undefined) {
      var fields = {};
      for (var i in templates[datatype]) {
        fields[i] = this.genDefaultData(templates[datatype][i]);
      }
      return fields;
    }
    if (datatype.endsWith("array")) {
      return [];
    }
    if (datatype.endsWith("dict")) {
      return {};
    }
    if (datatype[0] == "?") {
      return undefined;
    }
    if (datatype == "bool") {
      return true;
    }
    if (datatype == "number") {
      return 0;
    }
    if (datatype[0] == "!") {
      var collection = GetCollection(datatype.substring(1));
      for (var id in collection) {
        return id;
      }
    }
    if (datatype == "display") {
      return undefined;
    }
    return "";
  };

  setStatePath(data, dataPath, isKey = false) {
    const c = data;
    this.setState(prevState => {
      var obj = prevState.data || {};
      prevState.toSelect = null;
      for (var i in dataPath) {
        var path = dataPath[i];
        if (i == dataPath.length - 1) {
          if (c == "ARRAY_DELETE") {
            obj.splice(path, 1);
          } else if (c == "DICT_DELETE") {
            delete obj[path];
          } else {
            if (isKey) {
              prevState.toSelect = [
                ...dataPath.splice(0, dataPath.length - 1),
                c
              ];
              let old = obj[path];
              delete obj[path];
              obj[c] = old;
            } else {
              obj[path] = c;
            }
          }
        } else {
          obj = obj[path];
        }
      }
      return prevState;
    });
  }

  renderElement(datatype, dataPath, isKey = false) {
    var data = this.state.data;
    if (isKey) {
      data = dataPath[dataPath.length - 1];
    } else {
      for (var path of dataPath) {
        data = data[path];
      }
    }

    let fieldKey = dataPath.toString() + (isKey ? "_key" : "");

    if (datatype == "display") {
      return JSON.stringify(data);
    }
    if (datatype.endsWith("array")) {
      var elements = [];
      var dt = datatype.split(" ")[0];
      for (var i in data) {
        const ci = i;
        elements.push(
          <div key={ci}>
            <button
              onClick={() =>
                this.setStatePath("ARRAY_DELETE", [...dataPath, ci])
              }
            >
              -
            </button>
            {this.renderElement(dt, [...dataPath, ci])}
          </div>
        );
      }
      return (
        <div>
          {elements}
          <div>
            <button
              onClick={() => {
                if (data == null) {
                  this.setStatePath([this.genDefaultData(dt)], dataPath);
                } else {
                  this.setStatePath(this.genDefaultData(dt), [
                    ...dataPath,
                    data.length
                  ]);
                }
              }}
            >
              +
            </button>
          </div>
        </div>
      );
    }
    if (datatype.endsWith("dict")) {
      var elements = [];
      var dt1 = datatype.split(" ")[0];
      var dt2 = datatype.split(" ")[1];
      for (var i in data) {
        const ci = i;
        elements.push(
          <div key={ci}>
            <button
              onClick={() =>
                this.setStatePath("DICT_DELETE", [...dataPath, ci])
              }
            >
              -
            </button>
            {this.renderElement(dt1, [...dataPath, ci], true)}
            {this.renderElement(dt2, [...dataPath, ci])}
          </div>
        );
      }
      return (
        <div>
          {elements}
          <div>
            <button
              onClick={() => {
                if (data == null) {
                  this.setStatePath({}, dataPath);
                } else {
                  this.setStatePath(this.genDefaultData(dt2), [
                    ...dataPath,
                    this.genDefaultData(dt1)
                  ]);
                }
              }}
            >
              +
            </button>
          </div>
        </div>
      );
    }
    if (datatype === "string") {
      return (
        <input
          key={fieldKey}
          ref={e => {
            if (
              e &&
              isKey &&
              this.state.toSelect?.toString() == dataPath.toString()
            ) {
              e.focus();
            }
          }}
          value={data || ""}
          className={"data_" + datatype}
          onChange={e => this.setStatePath(e.target.value, dataPath, isKey)}
        />
      );
    }
    if (datatype === "longstring") {
      return (
        <textarea
          key={dataPath}
          value={data || ""}
          className={"data_" + datatype}
          onChange={e => this.setStatePath(e.target.value, dataPath, isKey)}
        />
      );
    }
    if (datatype === "number") {
      return (
        <input
          key={dataPath}
          type="number"
          value={data === undefined ? "" : data}
          className={"data_" + datatype}
          onChange={e =>
            this.setStatePath(parseFloat(e.target.value), dataPath, isKey)
          }
        />
      );
    }
    if (datatype[0] == "?") {
      var hasProperty = data !== undefined;
      var dt = datatype.substring(1);
      return (
        <div>
          <input
            type="checkbox"
            checked={hasProperty}
            onChange={e =>
              this.setStatePath(
                e.target.checked ? this.genDefaultData(dt) : undefined,
                dataPath
              )
            }
          />
          {hasProperty ? this.renderElement(dt, dataPath) : null}
        </div>
      );
    }
    if (datatype == "bool") {
      return null;
    }
    if (templates[datatype] != undefined) {
      var fields = [];
      for (var i in templates[datatype]) {
        fields.push(
          <div key={i} className="fieldContainer">
            <span className="fieldLabel">{i}</span>
            {this.renderElement(templates[datatype][i], [...dataPath, i])}
          </div>
        );
      }
      return <div>{fields}</div>;
    }
    if (datatype.startsWith("!")) {
      var dt = datatype.replace("!", "");
      var collection = GetCollection(dt);
      var options = [];
      for (var id in collection) {
        let label =
          collection[id].name ||
          (collection[id].text
            ? collection[id].text.substring(0, 50) + "..."
            : null) ||
          id;
        options.push({ id, label });
      }
      options.sort((a, b) => a.label.localeCompare(b.label));
      let variety = null;
      if (dt == "items" && data.includes("$")) {
        let bits = data.split("$");
        data = bits[0];
        variety = bits[1];
      }
      return (
        <span>
          <select
            value={data}
            onChange={e =>
              this.setStatePath(
                e.target.value + (variety == null ? "" : `\$${variety}`),
                dataPath,
                isKey
              )
            }
          >
            {options.map(option => (
              <option value={option.id} key={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          {dt != "items" ? null : (
            <span>
              <input
                type="checkbox"
                checked={variety != null}
                onChange={e => {
                  if (e.target.checked) {
                    this.setStatePath(
                      data + "$" + this.genDefaultData(datatype),
                      dataPath,
                      isKey
                    );
                  } else {
                    this.setStatePath(data, dataPath, isKey);
                  }
                }}
              />

              {variety == null ? null : (
                <select
                  value={variety}
                  onChange={e =>
                    this.setStatePath(
                      data + "$" + e.target.value,
                      dataPath,
                      isKey
                    )
                  }
                >
                  {options.map(option => (
                    <option value={option.id} key={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            </span>
          )}
          <button
            onClick={() => {
              this.setState({
                overrideDatatype: dt,
                id: data,
                data: GetCollection(dt)[data]
              });
            }}
          >
            {"edit"}
          </button>
        </span>
      );
    }
    return datatype;
  }

  renderData = () => {
    let datatype = this.state.overrideDatatype || this.props.datatype;
    var data = GetCollection(datatype);
    if (datatype == "skills") {
      return (
        <SkillDisplay
          skills={data}
          selectSkill={id => {
            this.setState({ data: data[id], id: id });
          }}
          newSkillOverride={id => {
            let data = this.genDefaultData("skills");
            data.parents = [id];
            this.setState({ data, id: null });
          }}
        />
      );
    }
    var items = [];
    for (var id in data) {
      const cid = id;
      if (id.startsWith("checkpoint") || data[id].isAlchemical) {
        continue;
      }
      items.push(
        <button
          key={id}
          onClick={() => this.setState({ data: data[cid], id: cid })}
        >
          {data[id].name ||
            (data[id].text ? data[id].text.substring(0, 20) + "..." : null) ||
            id}
        </button>
      );
    }
    return <div style={{ margin: "12px" }}>{items}</div>;
  };

  getValue = id => {
    let coeff = 1;
    if (id.includes("$")) {
      let bits = id.split("$");
      id = bits[1];
      coeff = this.getValue(bits[0]);
    }
    var item = GetCollection("items")[id];
    if (item === undefined) {
      return 0;
    }
    let cost = coeff * (item.value || item.derivedValue || 0);
    console.log(id, cost);
    return cost;
  };

  renderActionRec = () => {
    var data = this.state.data;
    var cost = 0;
    var reward = 0;
    var consequence = 0;
    var hasCheck = data.check !== undefined;
    for (var c in data.costs) {
      cost += data.costs[c] * this.getValue(c);
    }
    var SKILL_VALUE = 144;
    for (var i in data.results) {
      var r = 0;
      var result = data.results[i];
      for (var specific of result.specificItems || []) {
        r += specific.count * this.getValue(specific.item);
      }
      for (var id in result.items) {
        r += result.items[id] * this.getValue(id);
      }
      for (var id in result.skills) {
        r += result.skills[id] * SKILL_VALUE;
      }
      if (r < 0) {
        consequence += r;
      } else {
        reward += r;
      }
    }
    var t = reward * 1.05 - cost * 0.95;
    if (hasCheck) {
      var difficulty = data.check.difficulty;
      t =
        (10 * (reward * 0.99 + consequence * 0.01 - cost)) / (difficulty + 10);
    }
    t = Math.ceil(t);
    var s = t + " minutes";
    if (t <= 0) {
      t = undefined;
      s = "instant";
    }
    return (
      <div>
        Recommended time: {s}{" "}
        <button
          onClick={() =>
            this.setState(oldState => {
              oldState.data.minutes = t;
              return oldState;
            })
          }
        >
          Set
        </button>
      </div>
    );
  };

  renderItemRecursive = (items, id, setItems = {}) => {
    if (items[id] == undefined) {
      return;
    }
    let level = Math.log(items[id].minq + 1) / Math.log(1.5);
    let offset = level * 30;
    let depth = Math.round(level) - 2000;
    if (depth == NaN) {
      console.log(items[id].name);
    }
    let justDisplay = setItems[id] !== undefined;
    setItems[id] = true;
    let itemName =
      (items[id].name || id) +
      (items[id].varietyType
        ? " [" + items[items[id].varietyType].name + "]"
        : "");
    let collapsed = this.state.collapsed[id] == true;
    return (
      <div style={{ display: "flex", flexDirection: "row-reverse" }}>
        <div
          style={{ width: 0, display: "flex", flexDirection: "row-reverse" }}
        >
          <div
            style={{
              display: "flex",
              position: "relative",
              right: offset + "px"
            }}
          >
            <div
              style={{
                position: "absolute",
                width: "2000px",
                marginLeft: "-1990px",
                height: "100%",
                backgroundColor: "white",
                alignSelf: "center",
                zIndex: depth
              }}
            />
            <div
              style={{
                position: "absolute",
                width: "2000px",
                marginLeft: "-1990px",
                height: "2px",
                backgroundColor: "black",
                alignSelf: "center",
                zIndex: depth
              }}
            />
            {justDisplay ? (
              <div
                style={{
                  backgroundColor: "white",
                  padding: "4px",
                  fontSize: "11pt"
                }}
              >
                {itemName}
              </div>
            ) : (
              [
                <button
                  key={id}
                  onClick={() => this.setState({ data: items[id], id: id })}
                >
                  {itemName}
                </button>,
                <div
                  style={{
                    alignSelf: "center",
                    height: 0,
                    transform: "translateY(-20px)"
                  }}
                >
                  {(items[id].subtypes || []).length > 0 ? (
                    <button
                      key={id + "plus"}
                      style={{
                        height: "20px",
                        width: "20px",
                        padding: "0px",
                        margin: "-4px"
                      }}
                      onClick={() => {
                        this.setState(prevState => {
                          if (collapsed) {
                            delete prevState.collapsed[id];
                          } else {
                            prevState.collapsed[id] = true;
                          }
                          return prevState;
                        });
                      }}
                    >
                      {collapsed ? ">" : "<"}
                    </button>
                  ) : (
                    <div style={{ height: "8px" }} />
                  )}
                  <button
                    key={id + "collapse"}
                    style={{
                      height: "20px",
                      width: "20px",
                      padding: "0px",
                      margin: "-4px"
                    }}
                    onClick={() => {
                      let data = this.genDefaultData("items");
                      data.is = [id];
                      this.setState({ data, id: null });
                    }}
                  >
                    +
                  </button>
                </div>
              ]
            )}
          </div>
        </div>
        <div>
          {justDisplay || collapsed
            ? null
            : (items[id].subtypes || []).map((id, i) => (
                <div key={i}>
                  {this.renderItemRecursive(items, id, setItems)}
                </div>
              ))}
        </div>
      </div>
    );
  };

  renderItemTree = () => {
    let items = GetCollection(
      this.state.overrideDatatype || this.props.datatype
    );
    let baseItem = "Payc5snfnDmOqQTeJ502";
    return (
      <div style={{ position: "relative", left: 0, right: 0 }}>
        {this.renderItemRecursive(items, baseItem)}
      </div>
    );
  };

  render() {
    let datatype = this.state.overrideDatatype || this.props.datatype;
    if (!this.state.ready) {
      return null;
    }
    const dataObj = JSON.parse(JSON.stringify(this.state.data));
    return (
      <div>
        {this.renderData()}
        <b>
          {this.state.id == null ? "Adding to " : "Editing item in "}
          {datatype}:
        </b>
        {this.renderElement(datatype, [])}
        <b>{datatype === "actions" ? this.renderActionRec() : null}</b>
        <div>{this.state.id}</div>
        <div>{JSON.stringify(this.state.data)}</div>
        <br />
        <div>
          {this.state.id === null ? (
            <button
              onClick={() =>
                app
                  .firestore()
                  .collection(datatype)
                  .add(dataObj)
              }
            >
              Add
            </button>
          ) : (
            <div>
              <button
                style={{ color: "#800" }}
                onClick={() =>
                  app
                    .firestore()
                    .collection(datatype)
                    .doc(this.state.id)
                    .set(dataObj)
                    .then(() =>
                      this.setState({
                        data: this.genDefaultData(datatype, []),
                        id: null
                      })
                    )
                }
              >
                Overwrite
              </button>
              <button
                onClick={() =>
                  app
                    .firestore()
                    .collection(datatype)
                    .doc(this.state.id)
                    .delete()
                    .then(() =>
                      this.setState({
                        data: this.genDefaultData(datatype, []),
                        id: null
                      })
                    )
                }
              >
                Delete
              </button>
              <button
                onClick={() =>
                  this.setState({
                    id: null
                  })
                }
              >
                Copy
              </button>
            </div>
          )}
        </div>
        {datatype === "items" ? this.renderItemTree() : null}
      </div>
    );
  }
}
