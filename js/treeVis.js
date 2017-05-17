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

// create a network
let container = document.getElementById('treeDiv');

function drawTree() {
    destroy();

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

    phaserJSON.versions.forEach(function (item) {
        nodes.add({id: item.id, label: 'Node ' + item.id});
    });

    phaserJSON.versions.forEach(function (item) {
        if (item.children) {
            // console.log(item.children);
            item.children.forEach(function (i) {
                // console.log(i);
                edges.add({from: i, to: item.id});
            });
        }

    });

    // initialize your network!
    network = new vis.Network(container, data, options);
}

function destroy() {
    if (network === null) {
    } else {
        network.destroy();
        network = null;
    }
}

// nodes.add({id: item.id, label: 'Node ' + item.id, items:[{"x":100, "y":100}, {"x":400, "y":400}, {"x":0, "y":256}]});
// edges.add({from: item.id, to: item.children[0]});