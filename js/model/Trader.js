/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global ko, require, define, brackets: true, $, window, navigator, Mustache, chrome */

define(["dojo/_base/declare", "knockout", "knockout-mapping", "jquery", "dojo/topic"],
    function(declare, ko, mapping, $, topic){

    "use strict";

    return declare(null, {

        name: null,
        id: null,
        positions: null,
        strategy: null,
        _paused: null,

        constructor: function(data) {
            declare.safeMixin(this, mapping.fromJS(data));
            this.positions = ko.observableArray([]);
            this._paused = ko.observable(false);
        },

        pause: function(pause) {
            var command = this._paused() ? "unpause" : "pause";
            topic.publish("command", command, this.id())
        }
    })

});
