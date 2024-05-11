import React, { Component } from "react";
import { Table, TableData } from "@finos/perspective";
import { ServerRespond } from "./DataStreamer";
import { DataManipulator } from "./DataManipulator";
import "./Graph.css";
import { timeStamp } from "console";

interface IProps {
  data: ServerRespond[];
}

interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void;
}
class Graph extends Component<IProps, {}> {
  table: Table | undefined;

  render() {
    return React.createElement("perspective-viewer");
  }

  componentDidMount() {
    // Get element from the DOM.
    const elem = (document.getElementsByTagName(
      "perspective-viewer"
    )[0] as unknown) as PerspectiveViewerElement;

    const schema = {
      price_abc: "float",
      price_def: "float",
      ratio: "float",
      timestamp: "date",
      upper_bound: "float",
      lower_bound: "float",
      trigger_alert: "float",
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.
      elem.load(this.table);
      elem.setAttribute("view", "y_line");
      elem.setAttribute("row-pivots", '["timestamp"]');
      elem.setAttribute(
        "columns",
        '["ratio","lower_bound","upper_bound", "trigger_alert"] '
      );

      elem.setAttribute(
        "aggregates",
        JSON.stringify({
          price_abc: "avg",
          price_def: "avg",
          ratio: "avg",
          timestamp: "distinct count",
          upper_bound: "avg",
          lower_bound: "avg",
          trigger_alert: "avg",
        })
      );
    }
  }

  componentDidUpdate() {
    if (this.table) {
      this.table.update(([
        DataManipulator.generateRow(this.props.data),
      ] as unknown) as TableData);
    }
  }
}

export default Graph;

/*Author Bhavitha M 
 The Graph component now renders the following things
 - The ratio between the prices of the stocks abc and def
 - The upper bound 
 - The lower bound
 - The timestamp on its x axis
 and a trigger when the ratio passes the upper bound
 or goes below the lower bound

 What the traders can get from this graph now compared to just the prices of the 
 both stocks being compared.. 
 Now the traders can see if the ratio is more than the upper bound and lower than the 
 lower bound along with a trigger, implying that the prices of two stocks are differed
 by a large margin and hence they can now attempt to buy/ sell one of the stocks
 for better profits. 
*/
