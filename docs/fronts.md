# Fronts Architecture

![Fronts architecture](/docs/images/fronts-archirecture.png)

## Service Level Metrics

### Succesive press failures - CRON presser (facia-press)

* __Detail__ : every three minutes, the Admin app puts the ids of every front on an SQS queue. These are pulled in bunches (of up ot 10) every 10 seconds by Presser instances, and `pressed.json` files are re-created for each front and stored on S3. Both preview and live versions are pressed.  

* __Metric__  : if the number of *consecutive* failures to produce a `pressed.json` file exceeds N, the healhcheck fails on that Presser instance. The counter is reset by any succesful pressing. 

* __Consequence__ : Terminate the instance.

### Succesive press failures - MANUAL presser (facia-tool)

* __Detail__ : immediately after a collection is edited within the Fronts Editor, the manual Presser is invoked to re-create the `pressed.json` files for any front containing that collection. Both preview and live versions are pressed.

* __Metrics__  : if the number of *consecutive* failures of the manual Presser to produce a `pressed.json` file exceeds N, the healhcheck fails. The counter is reset by any succesful pressing. 

* __Consequence__ : Terminate the instance.

### Statictical press failures - CRON presser (facia-press)

* __Detail__ : on occasion - due to momentary ContentApi unavailability or increased latency somewhere in the network - pressing will fail. Above a certain frequency, these failures should be considered as indicative of a operational problem.   

* __Metrics__  : 50 failures within 15 minutes, monitored in CloudWatch.

* __Consequence__ : PagerDuty alarm

### Statictical press failures - MANUAL presser (facia-tool)

* __Detail__ : on occasion - due to momentary ContentApi unavailability or increased latency somewhere in the network - pressing will fail. Above a certain frequency, these failures should be considered as indicative of a operational problem.   

* __Metrics__  : 50 failures within 15 minutes, monitored in CloudWatch. 

* __Consequence__ : PagerDuty alarm

### ContentAPI invalid responses

* __Detail__ : the Presser (and also the fronts tools) are dependent on ContentApi results being well-formed. Occasionally ContentApi returns intermittently mal-formed results.

* __Metrics__  : (a) 50 mal-formed results within 15 minutes, monitored in CloudWatch; (b) a single malformed result monitored bu the facia-tool UI.

* __Consequence__ : (a) PagerDuty alarm; (b) a "red" alert in the UI with an option to "try again".

### Update within 10 seconds of edit (not incl. cache)

* __Detail__ : immediately after a collection is edited within the Fronts Editor, the Presser is invoked to re-create the `pressed.json` files for all fronts containing that collection. Both preview and live versions are pressed. The files are written to S3 and will immediately back requests for those fronts, that are subsequently made to the Facia app. The end-to-end the process should take under 10 seconds; it typically takes about 3 under normal network conditions.

* __Metric__  : measured as the difference between the most recent timestamp of a front's various `collection.json` files, and the timestamp of that front's `pressed.json` file. This is checked 10 seconds after an edit, and should itself be below 10 seconds.

* __Consequence__ : 10 seconds after any edit, if the metric exceeds 10 seconds there is an "orange" alert in the tool UI with an option to "try again". The condition occurs on occasion due to momentary high latency somewhere in network, and generally does not reproduce itself on retry. There is no healhcheck to simulate this; it is an editor-facing alert only; this condition is covered by the "press faliures" healthchecks, above.

