import { useState, useRef } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import graphStyles from "./graphStyles";
import "./App.css";

function App() {

  // ======================
  // STATES
  // ======================

  const [elements, setElements] = useState([
    { data: { id: "router", type: "router", depth: 0 }, position: { x: 0, y: 0 } },
    { data: { id: "switch", type: "switch", depth: 1 }, position: { x: -150, y: 150 } },
    { data: { id: "pc1", type: "pc", depth: 2 }, position: { x: -300, y: 300 } },
    { data: { id: "pc2", type: "pc", depth: 2 }, position: { x: 0, y: 300 } },

    { data: { source: "router", target: "switch" } },
    { data: { source: "switch", target: "pc1" } },
    { data: { source: "switch", target: "pc2" } }
  ]);

  const [pcCount, setPcCount] = useState(3);
  const [routerCount, setRouterCount] = useState(2);
  const [switchCount, setSwitchCount] = useState(2);

  const [selectedNode, setSelectedNode] = useState(null);

  const [selectedInfo, setSelectedInfo] = useState({
    id: "",
    type: "",
    connectedTo: []
  });

  // ======================
  // NETWORK STATISTICS
  // ======================

  const routers = elements.filter(
    element => element.data.type === "router"
  ).length;

  const switches = elements.filter(
    element => element.data.type === "switch"
  ).length;

  const pcs = elements.filter(
    element => element.data.type === "pc"
  ).length;

  const connections = elements.filter(
    element => element.data.source
  ).length;

  const totalDevices = routers + switches + pcs;

  // ======================
  // ADD PC
  // ======================

  function addPC() {

    if (!selectedNode) {
      alert("Select a switch first!");
      return;
    }

    if (!selectedNode.startsWith("switch")) {
      alert("PCs connect only to switches!");
      return;
    }

    const pcId = `pc${pcCount}`;
    
    // Get position of selected switch and offset new PC nearby
    let position = { x: 0, y: 0 };
    if (window.cy) {
      const switchNode = window.cy.getElementById(selectedNode);
      if (switchNode && switchNode.position()) {
        const switchPos = switchNode.position();
        position = {
          x: switchPos.x + (Math.random() - 0.5) * 150,
          y: switchPos.y + (Math.random() - 0.5) * 150 + 100
        };
      }
    }

    setElements(prev => [
      ...prev,
      {
        data: {
          id: pcId,
          type: "pc",
          depth: 2
        },
        position
      },
      {
        data: {
          source: selectedNode,
          target: pcId
        }
      }
    ]);

    setPcCount(prev => prev + 1);
  }

  // ======================
  // ADD ROUTER
  // ======================

  function addRouter() {

    const routerId = `router${routerCount}`;
    
    // Spawn router near viewport center or spread them out
    let position = { x: 0, y: 0 };
    if (window.cy) {
      const pan = window.cy.pan();
      const zoom = window.cy.zoom();
      const width = window.cy.width();
      const height = window.cy.height();
      
      // Calculate viewport center in world coordinates
      position = {
        x: (width / 2 - pan.x) / zoom + (Math.random() - 0.5) * 200,
        y: (height / 2 - pan.y) / zoom + (Math.random() - 0.5) * 200
      };
    }

    setElements(prev => [
      ...prev,
      {
        data: {
          id: routerId,
          type: "router",
          depth: 0
        },
        position
      }
    ]);

    setRouterCount(prev => prev + 1);

  }

  // ======================
  // ADD SWITCH
  // ======================

  function addSwitch() {

    if (!selectedNode) {
      alert("Select a router first!");
      return;
    }

    if (!selectedNode.startsWith("router")) {
      alert("Switches connect only to routers!");
      return;
    }

    const switchId = `switch${switchCount}`;
    
    // Get position of selected router and offset new switch nearby
    let position = { x: 0, y: 0 };
    if (window.cy) {
      const routerNode = window.cy.getElementById(selectedNode);
      if (routerNode && routerNode.position()) {
        const routerPos = routerNode.position();
        position = {
          x: routerPos.x + (Math.random() - 0.5) * 150,
          y: routerPos.y + (Math.random() - 0.5) * 150 + 100
        };
      }
    }

    setElements(prev => [
      ...prev,
      {
        data: {
          id: switchId,
          type: "switch",
          depth:1
        },
        position
      },
      {
        data: {
          source: selectedNode,
          target: switchId
        }
      }
    ]);

    setSwitchCount(prev => prev + 1);

  }

  // ======================
  // DELETE NODE
  // ======================

  function deleteNode() {

    if (!selectedNode) {
      alert("Select a node first!");
      return;
    }

    setElements(prev =>
      prev.filter(element => {

        if (
          element.data.id === selectedNode ||
          element.data.source === selectedNode ||
          element.data.target === selectedNode
        ) {
          return false;
        }

        return true;
      })
    );

    setSelectedNode(null);

    setSelectedInfo({
      id: "",
      type: "",
      connectedTo: []
    });
 }
    function saveTopology(){

      const jsonData = JSON.stringify(
        elements,
        null,
        2
      );
        const blob = new Blob(
          [jsonData],
          {
            type: "application/json"
          }
        );

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;

        link.download = "topology.json";

        link.click();

        URL.revokeObjectURL(url);
    }

    // ======================
// LOAD TOPOLOGY
// ======================

function loadTopology(event) {

  const file = event.target.files[0];

  if (!file) {
    return;
  }

  const reader = new FileReader();

  reader.onload = (e) => {

    const jsonData = JSON.parse(
      e.target.result
    );

    // Load graph
    setElements(jsonData);

    // Update counters
    const pcNum = jsonData.filter(
      item => item.data.type === "pc"
    ).length;

    const routerNum = jsonData.filter(
      item => item.data.type === "router"
    ).length;

    const switchNum = jsonData.filter(
      item => item.data.type === "switch"
    ).length;

    setPcCount(pcNum + 1);
    setRouterCount(routerNum + 1);
    setSwitchCount(switchNum + 1);

    // Reset selection
    setSelectedNode(null);

    setSelectedInfo({
      id: "",
      type: "",
      connectedTo: []
    });

  };

  reader.readAsText(file);

}

 

  return (
    <div className="app">

      <h1>Network Topology Visualizer</h1>

      <div className="toolbar">

        <button onClick={addPC}>Add PC</button>

        <button onClick={addRouter}>Add Router</button>

        <button onClick={addSwitch}>Add Switch</button>

        <button onClick={deleteNode}>Delete Selected</button>

        <button onClick={saveTopology}>Save Topology</button>

        <label className="load-button">Load Topology
          <input
            type="file"
            accept=".json"
            onChange={loadTopology}
            hidden
          />
        </label>

      </div>

      <h2>
        Selected Node: {selectedNode || "None"}
      </h2>

      <div className="graph-container">

        <div className="sidebar">

          <div className="info-panel">

            <h2>Device Information</h2>

            {
              selectedNode ?

                <>
                  <p>
                    <strong>Name:</strong> {selectedInfo.id}
                  </p>

                  <p>
                    <strong>Type:</strong> {selectedInfo.type}
                  </p>

                  <h3>Connected To</h3>

                  <ul>

                    {
                      selectedInfo.connectedTo.map(device => (

                        <li key={device}>
                          {device}
                        </li>

                      ))
                    }

                  </ul>

                </>

                :

                <p>No node selected.</p>
            }

          </div>

          <div className="stats-panel">

            <h2>Network Statistics</h2>

            <p><strong>Routers:</strong> {routers}</p>

            <p><strong>Switches:</strong> {switches}</p>

            <p><strong>PCs:</strong> {pcs}</p>

            <p><strong>Connections:</strong> {connections}</p>

            <p><strong>Total Devices:</strong> {totalDevices}</p>

          </div>

        </div>

        <CytoscapeComponent
            cy={(cy) => {
              window.cy = cy;
            }}
          elements={elements}

          cy={(cy) => {

            cy.on("tap", "node", (event) => {

              const node = event.target;

              const neighbors =
                node
                  .neighborhood("node")
                  .map(n => n.id());

              setSelectedNode(node.id());

              setSelectedInfo({
                id: node.id(),
                type: node.data("type"),
                connectedTo: neighbors
              });

            });

          }}

          boxSelectionEnabled={false}
          autounselectify={false}

          layout={{
            name: "preset",
            directed: true
          }}

          style={{
            width: "100%",
            height: "100%"
          }}

          stylesheet={graphStyles}

        />

      </div>

    </div>
  );
}

export default App;