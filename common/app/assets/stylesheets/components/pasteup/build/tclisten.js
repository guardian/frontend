var http = require('http'),
	deploy = require('./deploy'),
	child_pr  = require('child_process'),
	build = require('./build');

http.createServer(function(req, res) {
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.write('<p>Starting deploy...</p>');
	res.write('<p>Pulling from Github...');
	child_pr.exec('git pull', function(error, stdout, stderr) {
		res.write('<br>' + stdout + '</p>');
		res.write('<p>Building Pasteup...');
		build.go(function() {
			res.write('<br>Pasteup built</p>');
			res.write('<p>Deploying to CODE...');
			deploy.doFullDeploy('pasteup-code-play', function() {
				res.write('<br>Deploy complete</p>');
				res.write('<b>http://pasteup-code-play.s3.amazonaws.com/index.html</b>');
				res.end();
			});
		})
	});
}).listen(1980);

console.log('TC Listener running on http://0.0.0.0:1980');