/**
 * Created by Gurjot Bhatti on 5/15/2017.
 */

let totalNodes = null;
let data = null;
let options = null;
let network = null;

// create an array with edges
let nodes = new vis.DataSet();

// create an array with edges
let edges = new vis.DataSet();

// create a tree-network
let container = document.getElementById('treeDiv');

// This draws tree on the screen
function drawTree() {
    destroyTree();

    // get total number of nodes from json
    totalNodes = phaserJSON.versions.length;

    // provide the data in the vis format
    data = {
        nodes: nodes,
        edges: edges
    };
    options = {
        edges: {
            smooth: {
                type: 'cubicBezier',
                // forceDirection: 'horizontal',
                roundness: 0.4
            }
        },
        layout: {
            hierarchical: {
                direction: 'UD'
            }
        },
        physics: false
    };

    // Add nodes
    phaserJSON.versions.forEach(function (item) {
        nodes.add({id: item.id, label: 'Node ' + item.id});
    });

    // Add edges between nodes
    phaserJSON.versions.forEach(function (item) {
        if (item.children) {
            item.children.forEach(function (i) {
                edges.add({from: i, to: item.id});
            });
        }
    });

    // initialize the tree-network!
    network = new vis.Network(container, data, options);

    // Double click event to change the version
    network.on("doubleClick", function (params) {
        GameState.readJSONAndChangeVersion(params.nodes[0]);
    });
}

// Destroy the tree-network
function destroyTree() {
    if (network === null) {
    } else {
        network.destroy();
        network = null;
    }
}
