const graphStyles = [
  {
    selector: 'node[type="pc"]',
    style: {
      label: "data(id)",
      width: 60,
      height: 60,
      "background-color": "#3498db",
      color: "white",
      "text-valign": "center",
      "text-halign": "center",
      "font-size": 14
    }
  },

  {
    selector: 'node[type="router"]',
    style: {
      label: "data(id)",
      width: 80,
      height: 80,
      "background-color": "#e74c3c",
      color: "white",
      "text-valign": "center",
      "text-halign": "center",
      "font-size": 14
    }
  },

  {
    selector: 'node[type="switch"]',
    style: {
      label: "data(id)",
      width: 70,
      height: 70,
      "background-color": "#2ecc71",
      color: "white",
      "text-valign": "center",
      "text-halign": "center",
      "font-size": 14
    }
  },

  // ⭐ selected node style
  {
    selector: ":selected",
    style: {
      "border-width": 8,
      "border-color": "#f1c40f",
      "border-opacity": 1
    }
  },

  {
    selector: "edge",
    style: {
      width: 3,
      "line-color": "#999"
    }
  }
];

export default graphStyles;