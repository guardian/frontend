# Fronts Architecture

![Fronts architecture](/docs/images/fronts-archirecture.png)

## Success Metrics

### Update within 10 seconds of edit (not incl. cache)

* __Detail__ : immediately after an edit of a collection using the Fronts Editor, the Presser is invoked to re-create the `pressed.json` files for all fronts containing that collection. Both preview and live versions will be pressed. These files are written to S3 and will immediately back requests for those fronts that are made to the Facia app. The end-to-end the process should take under 10 seconds; it typically takes about 3 under normal network conditions.

* __Metric__  : the difference between the most recent timestamp of a front's various `collection.json` files, and the timestamp of that front's `pressed.json` file. This is measured 10 seconds after an edit, and should itself be below 10 seconds.

* __Alerting__ : 10 seconds after an edit, editors are alerted with a visual cue if the metric exceeds 10 seconds. They are offered the option to "try again". The condition occurs naturally on occasion due to momentary high latency somewhere in the archiecture's network, and generally does not reproduce itself following a retry. Currently there is no healhcheck to simulate this; it is an editor-facing alert only. The preferred way to catch this condition is with a "press faliure" metric, see below.

### Update within 10 seconds of edit (not incl. cache)

* __Detail__ : immediately after an edit of a collection using the Fronts Editor, the Presser is invoked to re-create the `pressed.json` files for all fronts containing that collection. Both preview and live versions will be pressed. These files are written to S3 and will immediately back requests for those fronts that are made to the Facia app. The end-to-end the process should take under 10 seconds; it typically takes about 3 under normal network conditions.

* __Metric__  : the difference between the most recent timestamp of a front's various `collection.json` files, and the timestamp of that front's `pressed.json` file. This is measured 10 seconds after an edit, and should itself be below 10 seconds.

* __Alerting__ : 10 seconds after an edit, editors are alerted with a visual cue if the metric exceeds 10 seconds. They are offered the option to "try again". The condition occurs naturally on occasion due to momentary high latency somewhere in the archiecture's network, and generally does not reproduce itself following a retry. Currently there is no healhcheck to simulate this; it is an editor-facing alert only. The preferred way to catch this condition is with a "press faliure" metric, see below.

 




