# Repressing fronts

The JSON output created by `Facia-press` that is ingested by `Facia` does not have the properties that `Facia` is expecting. You need to re-press the fronts to re-create the JSON. [Read the Fronts architecture here](https://github.com/guardian/frontend/blob/d4422b4537165424e70a898d150db4e806ba04d6/docs/02-architecture/02-fronts-architecture.md).

## Tests failing (PR Build & Locally)

Tests are failing because of mis pressed data committed. In the Teamcity PR build, you can see things like:

- `FaciaMetaDataTest.should Include item list metadata`
- `FaciaMetaDataTest.should Include organisation metadata `
- `FaciaControllerTest.should render fronts in mf2 format`
- `FaciaControllerTest.should render fronts in mf2 format (no section provided)`
- `FaciaControllerTest.should render fronts with content that has been pre-fetched from facia-press`

### Repressing fronts locally.

#### Prerequisites

* Check your `facia.stage` property in your `frontend.conf` file is pointing at DEV (*not* PROD!)
* Check you are using your own switches file and not the `PROD` or `CODE` one.
	* To do this, create your own properties file in the the S3 bucket named `aws-frontend-store`. Add it to your `frontend.conf` like this: `switches.key=DEV/config/switches-nbaltazar.properties`
* Ensure you have the test AWS SQS queues in your `frontend.conf` properties
	* Add two properties: `frontpress.sqs.tool_queue_url` and `frontpress.sqs.cron_queue_url`
	* Set _both_ properties to the value `"https://sqs.eu-west-1.amazonaws.com/<id-here>/Frontend-TEST-page-presser-queue"`
	* You can get the correct ID by going to SQS in the AWS console and finding the `Frontend-TEST-page-presser-queue` and find the URL field in the details tab
* Ensure your CAPI endpoint is PROD (`content.api.host` in `frontend.conf`)

#### Let's go.

* Delete the files in `data/pressedPage/`
* Run the `admin` project locally and turn on `facia-press-on-demand` *and* `facia-inline-embeds` [switch](http://localhost:9000/dev/switchboard#Facia)
* Stop admin and run `facia-press` locally
* Go to `http://localhost:9000` just to get the switches file warmed up, then

```
curl -v -X POST http://localhost:9000/press/live/music
curl -v -X POST http://localhost:9000/press/live/inline-embeds
curl -v -X POST http://localhost:9000/press/live/uk
curl -v -X POST http://localhost:9000/press/live/au/media
```

* Stop facia press, switch to `facia` project and run `test`
	* Re-running the tests will recreate the JSON in the `data/pressedPage` folder - you'll need to commit those files.


## Shipping

This is more tricky especially if you are making a breaking change (i.e. new facia can't work with the old format and old facia can't work with the new)

### Adding a new field

If you just ship new facia without pressing things will break until the presser kicks in.

#### Prepare the ground

* Choose a quiet time of day, and this will take an hour
* Can you `ssh` onto the facia-press instances for `CODE` and `PROD`? [No?](https://github.com/guardian/platform/blob/master/doc/manual/chapters/1.04.ssh-keys.md)
* Turn off continuous integration of `Preview` and `CODE facia` (via riff-raff)
* Block deploys: Add a restriction to [Riff-Raff](https://riffraff.gutools.co.uk/deployment/restrictions)
* Let team know what you're doing
* Email core central prod to let them know preview fronts may error
* Merge to `main`

#### CODE: get the field into the pressed json

* Deploy facia-press & turn on the `facia-press-on-demand` switch in CODE gutools
* Set the `facia-press` AWS auto scaling group desired value to 2
* `SSH` into the facia presser instance and post to http://localhost:9000/press/draft/all (have patience, it takes a couple of mins) to repress all the draft fronts (`curl -v -X POST -H 'Content-Length: 0' http://localhost:9000/press/draft/all`)
	* The reason we SSH in and hit localhost instead of `curl`ing the ELB is because the curl request times out before the response.
* Back in CODE `frontend.gutools` go to `/press` and click `Standard Frequency Fronts For Press`, then wait a while for the most used CODE fronts to press
	* Monitor the SQS queue size to know when it's done (`frontend-CODE-FrontPressCronJobQueue-*`)
* Check that code facia still works (e.g. /uk and click around to some other fronts)
	* If you want to debug, go to a facia press load balancer: `http://<frontend-faciapre-elb>/pressed/live/uk/money` to see the JSON format
	* If you're adding a field, things will likely work fine as the old format should just ignore your new field.

#### CODE: now that the field is there, both the new and old facia should work

* Once you're happy, deploy `facia` and check things still work (/uk etc)
* Deploy everything else in `dotcom`

#### PROD: get the field into the pressed json
* Deploy facia-press & turn on the `facia-press-on-demand` switch in PROD gutools
* `SSH` into the facia presser instance and post to http://localhost:9000/press/draft/all (have patience, it takes a couple of mins) to repress all the draft fronts (`curl -v -X POST -H 'Content-Length: 0' http://localhost:9000/press/draft/all`)
* The fronts in prod are pressed automatically every 5 minutes, but if you like, use `frontend.gutools` to `/press` them - if you do just click `All Frequency Fronts For Press`. This will be speedy due to multiple instances.
* Point your local machine to `facia.stage=PROD` in `frontend.conf` and make sure everything is working before you deploy for real
* Deploy `preview` and check it still works
* Deploy facia etc and check they still work
* Deploy everything else and check they still work

#### Important Cleanup

* Turn off the `facia-press-on-demand` switches
* Set the `facia-press` AWS auto scaling group desired value back to what it was
* Turn on auto deploys again
* Change your local machine back to DEV facia bucket!
* Unblock deploys (remove the restriction in [Riff-Raff](https://riffraff.gutools.co.uk/deployment/restrictions))
* Let Central Prod know things are hunky-dory
* Celebrate! 🎉

### Removing a field

Follow the above instructions, only deploy the new facia (that doesn't need the field) first, check it works, and then follow the presser steps to repress the fronts without the field.

### Renaming/changing a field

This is a real pain because at the moment you just have to ship one change to add the new field, and another to remove the old field.  If you hit this situation, you're going to need to think hard.

### A front won't re-press and facia-press is returning not found

If you are seeing a `500` for a front and you can't re-press it try to access it via the elb (`http://<frontend-faciapre-elb>/pressed/live/uk/money`).

If it returns `Not found`:

* Check whether the fronts tool for that front has any error messages. If so - delete that item.
* Check the fronts tool `/editorial/config`
	* Open each item in the front and click `check` on each of the backfills
* If the backfills are fine, check the snaps
	* In the fronts tool `/editorial`, find the sections that contain snaps, the titles are surrounded by { curly braces }
	* In the fronts tool `/config` find the collections associated with those snap sections and go to `/config/<collection-id>` for each one
	* Make sure that all `snapUri` values, where the path is a realtive tag path and `snapType` is `latest`, return a valid response from internal CAPI
	* Eg: If `"snapUri": "lifeandstyle/series/modern-tribes"` check `http://<capi>/lifeandstyle/series/gardening-what-to-do-this-week`
	* When you find it... delete it from the fronts tool and refresh
