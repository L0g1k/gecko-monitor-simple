/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global ko, require, define, brackets: true, $, window, navigator, Mustache, chrome */

define(["dojo/_base/declare", "knockout", "knockout-mapping", "jquery"],
    function(declare, ko, mapping, $){

    "use strict";

    return declare(null, {

        name: null,
        positions: null,
        strategy: null,
        constructor: function(data) {
            declare.safeMixin(this, mapping.fromJS(data));
        }
    })

});
