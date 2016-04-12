# Repressing fronts

## Tests
Tests are failing because of mis pressed data committed
* delete data/pressedPage/*
* check your frontend.properties facia stage is DEV (*not* prod!)
* check you are using your own switches file not the prod or code one. To do this, create your own properties file in the the S3 bucket named "aws-frontend-store". Add it to your frontend.properties like this: `switches.key=DEV/config/switches-nbaltazar.properties`
* set up your own sns queue in AWS and add to frontend.properties something like this: frontpress.sqs.tool_queue_url=https://sqs.eu-west-1.amazonaws.com/<id-here>/facia-tool-queue-<your name here>
* run admin locally
* turn on facia-press-on-demand switch
* run facia-press locally
* go to http://localhost:9000 just to get the switches file warmed up
* curl -v -X POST http://localhost:9000/press/live/music
* curl -v -X POST http://localhost:9000/press/live/inline-embeds
* curl -v -X POST http://localhost:9000/press/live/uk
* curl -v -X POST http://localhost:9000/press/live/au/media
* stop facia press and rerun the tests

## shipping
This is more tricky especially if you are making a breaking change (i.e. new facia can't work with the old format and old facia can't work with the new)

### Adding a new field
If you just ship new facia without pressing things will break until the presser kicks in.

#### Prepare the ground
* choose a quiet time of day, and this could take an hour
* if it's on, turn off auto deploy of preview (and CODE facia if you like)
* goo deploy block
* let the team know what you're doing
* merge to master

#### CODE: get the field into the pressed json
* deploy facia-press, turn on the facia-press-on-demand switch
* log into a facia presser and post to http://localhost:9000/press/draft/all (takes a couple of mins) to repress all the draft fronts (curl -v -X POST -H 'Content-Length: 0' http://localhost:9000/press/draft/all)
* go to frontend admin /press and click press all, then wait a while for all the live fronts to press (you can monitor the SQS queue size to know when it's done - it may be worth scaling the group to 2 while it's happening)
* check that code facia still works (e.g. /uk) (if you want to debug, go to a facia press load balancer: http://<frontend-faciapre-elb>/pressed/live/uk/money)

#### CODE: now that the field is there, both the new and old facia should work
* once you're happy, deploy facia and check things still work (/uk etc)
* deploy everything else in dotcom

#### PROD: get the field into the pressed json
* deploy facia-press, turn on the facia-press-on-demand switch
* log into a facia presser and post to http://localhost:9000/press/draft/all (takes a couple of mins) to repress all the draft fronts (curl -v -X POST -H 'Content-Length: 0' http://localhost:9000/press/draft/all)
* the fronts in prod are pressed automatically every 5 minutes, but if you like, use admin to press them
* point your local machine to PROD facia and make sure everything started working before you deploy for real
* deploy training/preview and check they still work
* deploy facia etc and check they still work
* deploy everything else and check they still work

#### important cleanup
* turn off the facia-press-on-demand switches again
* turn on auto deploys again
* change your local machine back to DEV facia bucket!
* have a beer

### Removing a field
Follow the above instructions, only deploy the new facia (that doesn't need the field) first, check it works, and then follow the presser steps to repress the fronts without the field.

### Renaming/changing a field
This is a real pain because at the moment you just have to ship one change to add the new field, and another to remove the old field.  If you hit this situation, you're going to need to think hard.
