/**
 * Created by Gurjot Bhatti on 5/15/2017.
 */

"use strict";

let Tree = function(val, id) {
    let self = this;

    self.phaserJSON = val;
    self.totalNodes = null;
    self.data = null;
    self.options = null;
    self.network = null;
    self.currNodeID = null;
    self.previewNodeID = null;
    self.DEFAULT_COLOR = '#70f36c';
    self.CURRENT_VERSION_COLOR = '#8bc3fb';
    self.SELECTED_COLOR = '#f3b7b7';
    self.HOVER_PREVIEW_COLOR = '#f3ac4f';

    // create an array with edges
    self.nodes = new vis.DataSet();

    // create an array with edges
    self.edges = new vis.DataSet();

    // create a tree-network
    self.container = document.getElementById(id);

    // provide the data in the vis format
    self.data = {
        nodes: this.nodes,
        edges: this.edges
    };
    this.options = {
        edges: {
            smooth: {
                type: 'cubicBezier',
                roundness: 0.4
            }
        },
        layout: {
            hierarchical: {
                direction: 'UD',
                sortMethod: 'directed'
            }
        },
        interaction:{
            navigationButtons: true,
            hover: true
        },
        physics: false
    };

    self.drawTree = function () {
        self.destroyTree();

        // get total number of nodes from json
        self.totalNodes = self.phaserJSON.versions.length;
        self.currNodeID = self.totalNodes;
        // console.log(totalNodes);

        // Add nodes
        self.phaserJSON.versions.forEach(function (item) {
            self.nodes.add({id: item.id, label: item.label, borderWidth: 1, color: self.DEFAULT_COLOR, shape: 'box'});
        });

        // Add edges between nodes
        self.phaserJSON.versions.forEach(function (item) {
            if (item.parent) {
                self.edges.add({from: item.parent, to: item.id});
            }
        });

        // initialize the tree-network!
        self.network = new vis.Network(self.container, self.data, self.options);

        // Set color before drawing the tree
        self.network.on("beforeDrawing", function (params) {
            if (self.nodes.length > 0) {
                // set the color of all other nodes
                for (let i in self.network.body.nodes) {
                    let n = self.network.body.nodes[i];
                    n.setOptions({
                        color: self.DEFAULT_COLOR
                    });
                }

                // set the color of current version node
                let n = self.network.body.nodes[self.currNodeID];
                n.setOptions({
                    color: self.CURRENT_VERSION_COLOR
                });

                // set the color of current selected node
                if (self.network.getSelectedNodes().length) {
                    let sn = self.network.body.nodes[self.network.getSelectedNodes()[0]];
                    sn.setOptions({
                        color: self.SELECTED_COLOR
                    });
                }

                if (self.previewNodeID && self.previewNodeID !== self.currNodeID) {
                    let sn = self.network.body.nodes[self.previewNodeID];
                    sn.setOptions({
                        color: self.HOVER_PREVIEW_COLOR
                    });
                }
            }

        });
    };

    self.destroyTree = function () {
        // Clear nodes and edges data
        self.nodes.clear();
        self.edges.clear();

        if (self.network === null) {
        } else {
            self.network.destroy();
            self.network = null;
        }
    };

    self.changeVersion = function (val) {
        self.currNodeID = val;
    }

};

let t1 = new Tree(JSON.parse(localStorage.getItem('v-play')), 'treeDiv-1');
t1.drawTree();
let t2 = new Tree(JSON.parse(localStorage.getItem('v-every-change')), 'treeDiv-2');
t2.drawTree();
let t3 = new Tree(JSON.parse(localStorage.getItem('v-explicit')), 'treeDiv-3');
t3.drawTree();
let t4 = new Tree(JSON.parse(localStorage.getItem('v-3-changes')), 'treeDiv-4');
t4.drawTree();
let t5 = new Tree(JSON.parse(localStorage.getItem('v-time')), 'treeDiv-5');
t5.drawTree();