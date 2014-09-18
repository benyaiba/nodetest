var extend = require("xtend");
var mysql = require('mysql');
var baseDatas = require('./baseData').datas;
var Deferred = require("Deferred");
var async = require("async");

var conn = null;

var params = {
    mads_id: 1,
    air_times: [ "2014-10-16", "2014-10-17"],
    category_id: 2
}
var response_monitor_base = extend(baseDatas.monitor_base, {
    "mads_id": params.mads_id,
    "external_media_id": 4,
    "monitor_category_id": params.category_id
});

function createConnection(next) {
    conn = mysql.createConnection({
        host: '192.168.196.10',
        port: '9918',
        database: "monoliths_master_db",
        user: 'd_signage',
        password: 'signage'
    });
    conn.connect(function(err) {
        next(err);
    });
}

function startTransaction(next) {
    conn.beginTransaction(function(txErr) {
        next(txErr);
    });
}

function insertMonitor(next) {
    var sql = "insert into monitor set ? ";
    conn.query(sql, response_monitor_base, function(err, result) {
        var insertId = null;
        if (!err) {
            insertId = result.insertId;
        }
        next(err, insertId);
    })
}

function updateMonitorName(monitorId, next) {
    var sql = "update monitor set monitor_name = ? ";
    var name = "感知式モニタ" + monitorId;
    conn.query(sql, name, function(err) {
        next(err, monitorId);
    })
}

function insertRelayResponseMonitor(monitorId, next) {
    var sql = "insert into relay_response_monitor set ?";
    var obj = {
        "monitor_id": monitorId,
        // "response_device_id": null,
        "max_count": 4,
        "update_time": "2014-03-08 03:08:00",
        "create_time": "2014-03-08 03:08:00"
    }
    conn.query(sql, obj, function(err, result) {
        next(err, monitorId);
    })

}

function insertResponseMonitorSchedule(monitorId, next) {
    async.eachSeries(params.air_times, function(airtime, eachNext) {
        insertResponseMonitorScheduleOne(monitorId, airtime, eachNext)
    }, function(err) {
        next(err, monitorId);
    });
}

function insertResponseMonitorScheduleOne(monitorId, airtime, next) {
    var sql = "insert into response_monitor_schedule set ?";
    var obj = {
        "monitor_id": monitorId,
        "airtime": airtime,
        "airtime_status": 1,
        "update_time": "2014-03-08 03:08:00",
        "create_time": "2014-03-08 03:08:00"
    }
    conn.query(sql, obj, function(err) {
        next(err, monitorId);
    })

}

function main() {
    async.waterfall([ createConnection, startTransaction, insertMonitor, updateMonitorName, insertRelayResponseMonitor,
            insertResponseMonitorSchedule ], function(err, monitorId) {
        if (err) {
            console.error("error in water fall, rollback !", err);
            conn.rollback();
            conn.end();
        } else {
            conn.commit();
            conn.end();
            console.info("all done ...");
            console.info("monitor_id: ", monitorId);
        }
    });
}

main();
