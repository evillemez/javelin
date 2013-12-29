'use strict';

var path = require('path'),
    http = require('http-server')
;

module.exports = function(grunt) {
    grunt.registerTask('javelin-docs-server', 'Serve Javelin API documentation locally.', function() {
        //http server options
        var opts = {
            root: [path.resolve(__dirname, '..'), 'build', 'docs'].join(path.sep),
            port: 8585,
            host: '127.0.0.1',
            showDir: true,
            autoIndex: true,
            runInBackground: false
        };

        var done = this.async();

        //create & listen
        var server = http.createServer(opts);
        server.listen(opts.port, opts.host, function() {
            grunt.log.writeln("Javelin docs available at ", opts.host + ":" + opts.port);
            grunt.log.writeln("Press CTRL-C to stop the server.");
        });

        //kill server on CTRL-C
        process.on('SIGINT', function() {
            server.close();
            grunt.log.writeln("Javelin docs server stopped.");
            done();
        });
    });
};