/**
 * MetricsCollector constructor.
 * 
 * @class MetricsCollector
 * @constructor
 */
var MetricsCollector = function(db, url) {
    // Records buffer logs in batches
    this.buffer = [];
    this.metrics = db;
};

MetricsCollector.prototype = {
    buffer: null,
    metrics: null,
    max: 4
};

/**
 * Collect metrics using Express' request object and additional input.
 * 
 * @method put
 * @param {Object} req Express request object
 * @param {Object} input Additional input to collect
 */
MetricsCollector.prototype.put = function(req, input) {
    
    // Create the record
    var record = {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        query: req.query 
    };
    
    // If too long clean half of the buffer
    if (this.buffer.length === 4) {
        this._cleanBuffer();
    }
    this.buffer.unshift(record);
};

/**
 * Clean the buffer & insert into the database
 * 
 * @method _cleanBuffer
 * @private
 */
MetricsCollector.prototype._cleanBuffer = function() {
    var records = this.buffer.splice((this.buffer.length / 2), this.buffer.length);
    this.metrics.collection('metrics', function(err, collection) {
        collection.insert(records, {safe:true}, function(err, result) {});
    });
};

/**
 * Returns the buffer
 * 
 * @method getBuffer
 * @return {Array} buffer the metrics buffer
 */
MetricsCollector.prototype.getBuffer = function () {
    return this.buffer;
};

// Node.js export
module.exports = MetricsCollector;