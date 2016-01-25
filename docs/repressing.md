# Repressing fronts

## Tests
Tests are failing because of mis pressed data committed
* delete database/pressedPage/*
* check your frontend.properties facia stage is DEV (*not* prod!)
* check you are using your own switches file not the prod or code one
* set up your own sns queue in AWS and add to frontend.properties something like this: frontpress.sqs.tool_queue_url=https://sqs.eu-west-1.amazonaws.com/<id-here>/facia-tool-queue-<your name here>
* run admin locally
* turn on facia-press-on-demand switch
* run facia-press locally
* go to http://localhost:9000 just to get the switches file warmed up
* curl -v -X POST http://localhost:9000/press/live/music
* stop facia press and rerun the tests

## shipping
This is more tricky especially if you are making a breaking change (i.e. new facia can't work with the old format and old facia can't work with the new)
### Old facia can use new format, new facia can use the old: Y, Y
Nothing to worry about, just get shipping!
### Old facia can use new format, new facia can use the old: Y, N
If you just ship new facia without pressing things will break.
* turn off auto deploy of preview (and CODE facia if you like)
* goo deploy block
* merge to master
* when it's on CODE, turn on the facia-press-on-demand switch on CODE
* log into a code facia presser and post to http://localhost:9000/press/draft/all (takes a couple of mins) to repress all the code fronts
* go to frontend admin /press and click press all, then wait a while for all the live fronts to press
* check that code facia works now
* if you want to debug, go to a facia press load balancer: http://<frontend-faciapre-elb>/pressed/live/uk/money
When you are happy with everything on code:
* turn on facia press on demand switch on PROD
* deploy facia-press to PROD
* post to http://localhost:9000/press/draft/all on a prod facia presser
* command for the above is curl -v -X POST -H 'Content-Length: 0' http://localhost:9000/press/draft/all
* point your local machine to PROD facia and make sure everything started working before you deploy for real
* deploy training/preview and check they still work
* deploy facia etc
* turn off the facia-press-on-demand switches again
* turn on auto deploys again
* have a beer

### Old facia can use new format, new facia can use the old: N, N
You're a bit stuck, maybe find another way to do it!
