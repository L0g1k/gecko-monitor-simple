/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, forin: true, maxerr: 50, regexp: true */
/*global dojo, ko, phantom, require, page, define, $, WebSocket, FileError, window, XMLHttpRequest */

define([
    "dojo/_base/declare",
    "lib/knockout-3.0.0"
], function(declare, ko){
    return declare(null, {


        accountBalance: ko.observable("Loading..."),
        startStopLabel: ko.observable(),
        _started: ko.observable(false),
        _connected: ko.observable(false),
        ws: null,

        init: function(){

            this.startStopLabel = ko.computed(function(){
                return this._started() ? "Stop" : "Start"
            }, this)

            this._started.subscribe(function(started){
                this.sendMessage(started ? "start" : "stop")
            }, this)

            this.connectToServer();

            ko.applyBindings(this);

        },

        onmessage: function(m) {
            var payload = JSON.parse(m.data);
            console.log(payload);
            for(var key in payload) {
                if(payload.hasOwnProperty(key)) {
                    this[key](payload[key])
                }
            }
        },

        startStop: function() {
            this._started(!this._started());
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