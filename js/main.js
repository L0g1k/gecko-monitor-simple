/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, forin: true, maxerr: 50, regexp: true */
/*global dojo, ko, phantom, require, page, define, $, WebSocket, FileError, window, XMLHttpRequest */

define([
    "dojo/_base/declare",
    "knockout",
    "./model/Trader"
], function(declare, ko, Trader){
    return declare(null, {


        accountBalance: ko.observable("Loading..."),
        startStopLabel: ko.observable(),
        traders: ko.observableArray([]),
        _traders: ko.observableArray([]),
        positions: ko.observableArray([]),
        _started: ko.observable(false),
        _connected: ko.observable(false),
        ws: null,

        init: function(){

            this.startStopLabel = ko.computed(function(){
                return this._started() ? "Stop" : "Start"
            }, this)

            this.connectToServer();

            this.positions.subscribe(dojo.hitch(this, "_syncPositions"))
            this._traders.subscribe(dojo.hitch(this, "_syncTraders"))

            ko.applyBindings(this);



            window.app = this;

        },

        startStop: function() {
            this.sendMessage(this._started() ? "stop" : "start")
        },

        _syncTraders: function(traders){
            this.traders(traders.map(function(data){
                return new Trader(data);
            }))
        },


        _syncPositions: function(positions){
            this.traders().forEach(function(trader){
                var _positions = []
                positions.forEach(function(position){
                    if(position.instrumentID == trader.instrumentID()) {
                        _positions.push(position)
                    }
                })
                trader.positions(_positions);
            })
            console.debug("I now have " + positions.length + " positions");
        },

        onmessage: function(m) {
            var payload = JSON.parse(m.data);
            console.log(payload);
            if(typeof payload == "string") {
                new Function("this." + payload).call(this);
            } else {
                for(var key in payload) {
                    if(payload.hasOwnProperty(key)) {
                        this[key](payload[key])
                    }
                }
            }

        },

        sendMessage: function(message) {
            this.ws.send(message)
        },

        connectToServer: function () {
            this.ws = new WebSocket("ws://localhost:9000");
            this.ws.onmessage = dojo.hitch(this, "onmessage")
            this.ws.onopen = function () {
                this.sendMessage("init");
                this._connected(true);
                console.debug("Monitor connected");
            }.bind(this)
            this.ws.onclose = function() {
                this._connected(false);
            }.bind(this)
        }


    })();
});