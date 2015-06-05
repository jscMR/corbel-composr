'use strict';


var app = require('../bin/composer');

// Unit
require('./unit/test-suite.js');
// Integration
require('./integration/test-suite.js')(app);
