import React from "react";

import { WhenReady, GetCollection, Subscribe, GetTraits } from "./dataGet";

export default class Votes extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ready: false };
  }

  componentDidMount() {
    WhenReady(() =>
      this.setState({
        ready: true
      })
    );
    Subscribe(n => this.setState({ revision: n }));
  }

  render() {
    if (!this.state.ready) {
      return null;
    }
    let votes = GetCollection("votes");
    let items = GetCollection("items");
    let cindervotes = votes.cindergod;
    let totals = {};
    let totalVotes = {};
    for (let i in cindervotes) {
      let traits = GetTraits(i);
      let id = traits.variety || traits.id;
      let item = items[id];
      let totalValue = cindervotes[i] * (item.derivedValue || 0);
      if (traits.variety !== undefined) {
        totalValue *= items[traits.id].derivedValue || 0;
      }
      totals[id] = totals[id] || 0 + totalValue;
      totalVotes[id] = totalVotes[id] || 0 + cindervotes[i];
    }
    let itemList = Object.keys(totals).sort((a, b) => totals[b] - totals[a]);
    return (
      <div>
        {itemList.map((id, i) => (
          <div key={i}>
            {items[id].name}: {totals[id]} ({totalVotes[id]})
          </div>
        ))}
      </div>
    );
  }
}
