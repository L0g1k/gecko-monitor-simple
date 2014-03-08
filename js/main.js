/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, forin: true, maxerr: 50, regexp: true */
/*global dojo, ko, phantom, require, page, define, $, WebSocket, FileError, window, XMLHttpRequest */

define([
    "dojo/_base/declare",
    "knockout",
    "dojo/topic",
    "./model/Trader"
], function(declare, ko, topic, Trader){
    return declare(null, {


        accountBalance: ko.observable("Loading..."),
        startStopLabel: ko.observable(),
        traders: ko.observableArray([]),
        _traders: ko.observableArray([]),
        positions: ko.observableArray([]),
        _started: ko.observable(false),
        _connected: ko.observable(false),
        _socketReady: $.Deferred(),

        ws: null,

        constructor: function() {
            window.app = this; // debug only
        },

        init: function(){

            this.startStopLabel = ko.computed(function(){
                return this._started() ? "Stop" : "Start"
            }, this)

            this.events();
            this.connectToServer();

            this.positions.subscribe(dojo.hitch(this, "_syncPositions"))
            this._traders.subscribe(dojo.hitch(this, "_syncTraders"))

            ko.applyBindings(this);


        },

        events: function() {
            var socketReady = this._socketReady;
            topic.subscribe("command", function(){
                var details = arguments;
                socketReady.then(function(websocket){
                    var send = details[0]
                    send += "(";
                    for (var i = 1; i < details.length; i++) {
                        var arg = details[i];
                        send += arg;
                        if(i != details.length) {
                            send += ")";
                        }
                    }
                    websocket.send(send);
                })
            })
        },

        getTraderById: function (id) {
            var filter = this.traders().filter(function (trader) {
                return trader.id() == id
            });
            return filter.length ? filter[0] : null;
        },

        setTraderProperty: function(id, property, value) {
            this.getTraderById(id)[property](value);
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
                try {
                    new Function("this." + payload).call(this);
                } catch (e) {
                    console.warn("Couldn't process string: " + m.data, e.stack);
                }
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
                this._socketReady.resolve(this.ws);
                console.debug("Monitor connected");
            }.bind(this)
            this.ws.onclose = function() {
                this._connected(false);
            }.bind(this)
        }


    })();
});