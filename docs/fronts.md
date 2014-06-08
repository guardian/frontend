# Fronts Architecture

![Fronts architecture](/docs/images/fronts-archirecture.png)

## Service Level Metrics & Alerts

The metrics primcipally relate to the production of `pressed.json` files. Each one of these serves as a complete data aggregation for a single front. After a collection is edited within the Fronts Editor, the Presser re-creates a `pressed.json` file for each front containing that collection. Additionally, every front is periodically queued for re-pressing. The `pressed.json` files - one for each front - are stored on S3. Both preview and live versions are produced. Each one comprises all the ContentApi data, override data, and configuration metdata for every article and collection on that front. Each of these files serve as the single blocking call - made by the Facia app - to service a request for a particular front.

### Succesive press failures - MANUAL presser (facia-tool)

* __Detail__ : immediately after a collection is edited within the Fronts Editor, the manual Presser is invoked to re-create the `pressed.json` files for any front containing that collection.

* __Metrics__  : if the number of *consecutive* failures of the Presser to produce `pressed.json` files exceeds N, the healhcheck fails. The counter is immediately reset by any succesful pressing. 

* __Consequence__ : Instance terminates.

### Succesive press failures - CRON presser (facia-press)

* __Detail__ : every three minutes, the Admin app puts the ids of every front on an SQS queue. These are pulled in bunches (of up ot 10) every 10 seconds by Presser instances, and `pressed.json` files are re-created for each front.

* __Metrics__  : if the number of *consecutive* failures of the Presser to produce `pressed.json` files exceeds N, the healhcheck fails. The counter is immediately reset by any succesful pressing. 

* __Consequence__ : Instance terminates.

### Statictical press failures - CRON presser (facia-press)

* __Detail__ : due to momentary ContentApi unavailability or increased latency somewhere in the network - pressing will on occasion fail. Above a certain frequency, these failures should be considered as indicative of a operational issue.   

* __Metrics__  : 50 failures within 15 minutes, monitored in CloudWatch.

* __Consequence__ : PagerDuty alarm

### Statictical press failures - MANUAL presser (facia-tool)

* __Detail__ : due to momentary ContentApi unavailability or increased latency somewhere in the network - pressing will on occasion fail. Above a certain frequency, these failures should be considered as indicative of a operational issue.   

* __Metrics__  : 50 failures within 15 minutes, monitored in CloudWatch. 

* __Consequence__ : PagerDuty alarm

### ContentAPI invalid responses

* __Detail__ : the Presser (and also the fronts tools) are dependent on ContentApi results being well-formed. Occasionally ContentApi returns intermittently malformed results.

* __Metrics__  : (a) 50 malformed results within 15 minutes, monitored in CloudWatch; (b) a single malformed result monitored by the facia-tool UI.

* __Consequence__ : (a) PagerDuty alarm; (b) a "red" alert in the UI with an option to "try again".

### Pressed.json updates within 10 seconds of edit (not incl. cache time)

* __Detail__ : The end-to-end process from invoking the Presser to producing a `pressed.json` file - after a collection is manually edited - should be under 10 seconds. (It typically takes about 3 seconds under normal network conditions.)

* __Metric__  : the difference between the most recent timestamp of a front's various `collection.json` files, and the timestamp of that front's `pressed.json` file. This is checked 10 seconds after any edit; the result itself should be below 10 seconds.

* __Consequence__ : if the metric exceeds 10 seconds, an "orange" alert appears in the tool UI with an option to "try again". The condition occurs on occasion due to momentary high latency somewhere in network, and generally does not reproduce itself on retry.
