/**
 * Created by Gurjot Bhatti on 5/15/2017.
 */

"use strict";

let totalNodes = null;
let data = null;
let options = null;
let network = null;
let currNodeID = null;
let previewNodeID = null;
const DEFAULT_COLOR = '#70f36c';
const CURRENT_VERSION_COLOR = '#1c7ee6';
const SELECTED_COLOR = '#f3b7b7';
const HOVER_PREVIEW_COLOR = '#f3ac4f';

// create an array with edges
let nodes = new vis.DataSet();

// create an array with edges
let edges = new vis.DataSet();

// create a tree-network
let container = document.getElementById('treeDiv');

let spanElement = null;

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
    interaction:{
        navigationButtons: true,
        hover: true
    },
    physics: false,
    manipulation: {
        enabled: true,
        initiallyActive: true,
        addNode: false,
        addEdge: false,
        editEdge: false,
        editNode: function (data, callback) {
            // filling in the popup DOM elements
            document.getElementById('edit-operation').innerHTML = "Edit Node";
            document.getElementById('edit-label').value = data.label;
            document.getElementById('edit-save').onclick = saveNodeData.bind(this, data, callback);
            document.getElementById('edit-cancel').onclick = clearNodePopUp.bind();
            document.getElementById('edit-popUp').style.display = 'inline-block';
        },
        deleteNode: false,
        deleteEdge: false
    }
};

// This draws tree on the screen
function drawTree(phaserJSON) {
    destroyTree();

    // get total number of nodes from json
    totalNodes = phaserJSON.versions.length;
    currNodeID = totalNodes;
    // console.log(totalNodes);

    // Add nodes
    phaserJSON.versions.forEach(function (item) {
        nodes.add({id: item.id, label: item.label, borderWidth: 1, color: DEFAULT_COLOR, shape: 'box'});
    });

    // Add edges between nodes
    phaserJSON.versions.forEach(function (item) {
        // if (item.children) {
        //     item.children.forEach(function (i) {
        //         edges.add({from: i, to: item.id});
        //     });
        // }
        if (item.parent) {
            edges.add({from: item.parent, to: item.id});
        }
    });

    // initialize the tree-network!
    network = new vis.Network(container, data, options);

    spanElement = document.createElement('span');
    createSpanElement();


    // Double click event to change the version
    network.on("doubleClick", function (params) {

        // check if the value is null or not
        if (params.nodes[0]) {
            currNodeID = params.nodes[0];
        }
        GameState.readJSONAndChangeVersion(currNodeID);
    });

    // Select event to change color
    network.on("selectNode", function (params) {

        deleteSpanElement();

        // check if the value is null or not
        if (params.nodes[0]) {
            // console.log(params.nodes[0]);
        }
    });

    // Deselect event to change color
    network.on("deselectNode", function (params) {

        // createSpanElement after 1 second
        // This is done to execute this function after internal
        // vis-manipulation function is complete
        setTimeout(createSpanElement, 500);

    });

    network.on("hoverNode", function (params) {

        // check if the value is null or not
        if (params) {
            // call preview function
            previewNodeID = params.node;
            GameState.previewLevel(previewNodeID);
        }

    });

    network.on("blurNode", function (params) {
        // call disable preview function
        previewNodeID = 0;
        GameState.previewLevelDisabled();

    });

    // Set color before drawing the tree
    network.on("beforeDrawing", function (params) {
        if (nodes.length > 0) {
            // set the color of all other nodes
            for (let i in network.body.nodes) {
                let n = network.body.nodes[i];
                n.setOptions({
                    color: DEFAULT_COLOR
                });
            }

            // set the color of current version node
            let n = network.body.nodes[currNodeID];
            n.setOptions({
                color: CURRENT_VERSION_COLOR
            });

            // set the color of current selected node
            if (network.getSelectedNodes().length) {
                let sn = network.body.nodes[network.getSelectedNodes()[0]];
                sn.setOptions({
                    color: SELECTED_COLOR
                });
            }

            if (previewNodeID && previewNodeID !== currNodeID) {
                let sn = network.body.nodes[previewNodeID];
                sn.setOptions({
                    color: HOVER_PREVIEW_COLOR
                });
            }
        }

    });
}

// Destroy the tree-network
function destroyTree() {
    // Clear nodes and edges data
    nodes.clear();
    edges.clear();

    if (network === null) {
    } else {
        network.destroy();
        network = null;
    }
}

function changeVersion(val) {
    currNodeID = val;
}


function saveNodeData(data, callback) {
    // save node label
    data.label = document.getElementById('edit-label').value;
    // save new label value in the phaserJSON object
    GameState.phaserJSON.versions[data.id - 1].label = data.label;
    clearNodePopUp();
    callback(data);
}

function clearNodePopUp() {
    document.getElementById('edit-save').onclick = null;
    document.getElementById('edit-cancel').onclick = null;
    document.getElementById('edit-popUp').style.display = 'none';
}

function createSpanElement(){
    // spanElement = document.createElement('span');
    spanElement.innerHTML = "";
    spanElement.innerHTML = "Select Node to edit its label.";
    network.manipulation.manipulationDiv.appendChild(spanElement);
}

function deleteSpanElement() {
    if (network.manipulation.manipulationDiv.hasChildNodes()) {
        network.manipulation.manipulationDiv.removeChild(spanElement);
    }
}