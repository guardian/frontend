# Incident Response & Triage

The scope of this document is to prescribe a generic pattern of investigation, tools and
techniques for finding the cause of issues with the Frontend stack.

## Sources of Truth

All of our Frontend metrics, alerts and monitoring are available in two places:

* [CloudWatch](https://eu-west-1.console.aws.amazon.com/cloudwatch/) for health and performance metrics
* [Kibana](https://logs.gutools.co.uk/app/kibana) for application logs

You may also want to look at the [Fastly dashboard](https://manage.fastly.com/) for service www.theguardian.com
and the  [CAPI Dashboard](http://status.capi.gutools.co.uk/)

## Process and roles

Response to potential site incidents will involve in general the following steps

1. Initial reaction
2. Determine which apps are affected
3. Investigate whether the affected apps are _slow_ or _failing_
4. Judge whether to scale up, roll back
5. Pinpoint an exact cause
6. Cleaning up after the incident is over

Depending on the severity of the incident you should have a response team of
up to three people:

* One person should focus on communication with other parties and handle initial response
* One person should focus on the technical analysis of the problem
* One person should shadow and support the analyst

## Initial reaction

[Follow the P1 checklist for communications and process information](https://docs.google.com/document/d/1sAq378Oqm5NUG2_FJORDSd_Tag6gUUUsZaE9zUsgWHc/edit?usp=sharing)

## Determine which apps are affected

You will want to start by determining which Frontend apps are affected. You can
see this from the overview boards. Pay close attention to the charts for 'errors by
app' and 'latency by app' in Kibana.

* [Kibana Overview Board](https://logs.gutools.co.uk/goto/9d096c4c18e63c8496f6bd92529af1d0)
* [CloudWatch Overview Board](https://eu-west-1.console.aws.amazon.com/cloudwatch/home?region=eu-west-1#dashboards:name=xOverview)

## Investigate whether the affected apps are _slow_ or _failing_

* [See the xApp CloudWatch dashboards](https://eu-west-1.console.aws.amazon.com/cloudwatch/home?region=eu-west-1#dashboards:)

Errors and Latency are highly linked. When apps begin to return errors, Fastly
will make more requests to it, causing additional latency. When apps have high
latency they will begin to return errors when they can no longer handle the level
of incoming traffic.

Check what _kind_ of errors are contained in the Kibana logs for those apps. You
may be able to see a large number of suspect stack traces that relate to a problem
with the app itself that point to a software problem.

Check whether REAL traffic is increasing to the app. As discussed above, Fastly
itself will send more requests when apps start to return a non-200 response. You can
use the [Fastly Dashboard](https://manage.fastly.com/) along with the CloudWatch dashboard
for the app in question to try to find out if you are experiencing more real user
traffic vs extra 'synthetic' traffic from Fastly.

Check the number of EC2 instances for the affected apps, and what state they are in.
You can see this from the [CloudWatch overview board](https://eu-west-1.console.aws.amazon.com/cloudwatch/home?region=eu-west-1#dashboards:name=xOverview) which has a chart for number of healthy/unhealthy
instances over time. If there are no healthy instances the app may be failing to start.

## Judge whether to scale up, roll back

### Scaling Up

In nearly all cases, scaling up an app is a good interim solution to problems in
general. There are only two cases where you may not want to scale up: when apps
are failing to even start (new ec2 instances never become healthy), or when an upstream
or downstream dependency is the cause of your problems (in these cases scaling up
may cause that dependency to come under even more load).

If you are seeing an increase in REAL traffic (i.e. not just due to Fastly making
more requests because your app is not returning 200s), you should scale up.

If instances are maxing their CPU (as seen in the xApp CloudWatch dashboards) you
should scale up.

If you are seeing high latency, no application errors in particular, and new instances
are coming up healthy, you should scale up.

### Rolling back

If you are seeing application errors in Kibana that point to a software bug, you
should roll back by using Riff-Raff to deploy a previous build.

## Pinpoint an exact cause

### For traffic related issues

If you are experiencing high user traffic in general, this may be due to an increased
number of cache misses on fastly. You can see the cache hit rate on the [Fastly dashboard](https://manage.fastly.com/)

You might be experiening a single user flooding the app with thousands of requests.
You can drill into the source-api chart on the [Kibana Overview Board](https://logs.gutools.co.uk/app/kibana#/dashboard/00349ef0-06a1-11e8-a56d-a31118fab969?_g=(refreshInterval%3A(display%3AOff%2Cpause%3A!f%2Cvalue%3A0)%2Ctime%3A(from%3Anow-15m%2Cmode%3Aquick%2Cto%3Anow)))
to see if this is the case.

### For High Latency without high traffic

If your apps are mysteriously slowing down, this could be due to an upstream/downstream
dependency, such as CAPI, becomming slow. You can see the CAPI team dashboard [here](http://status.capi.gutools.co.uk/).
Our own Kibana dashboards _also_ show CAPI latency, but it can be misleading as it
incorporates our own latency into the measure, in other words if we are slow talking to
CAPI, then it will be reported as 'CAPI being slow' even though the latency is within our own
app.

### Analysing Instances Directly

If you suspect that there is a real issue with an app you can connect directly to the instance
using to try and collect more runtime information.

You should look for things like:

* The application logs
* Running ```top``` to get memory and cpu usage
* Check diskspace with ```df -h```
* Get the number of open file descriptors with ```lsof | wc -l```
* Get a thread dump using ```jstack```

If you are doing a more lengthy analysis of the machine, you should detach the instance from
the load balancer so that it doesn't get killed or interfered with.

## Cleaning up after the incident is over

[Keep following the P1 checklist for communications and process information after the incident is resolved](https://docs.google.com/document/d/1sAq378Oqm5NUG2_FJORDSd_Tag6gUUUsZaE9zUsgWHc/edit?usp=sharing)

If you scaled frontend apps up, you should wait for latency and error rates have returned to normal
before scaling back down again by setting the desired instances back to normal - the scaling policy
will slowly remove instances until it reaches that number.

If you rolled back because of a software defect, merge the fix into `main`, test it on CODE and then
deploy to production.

At this point you can unblock deploys and re-enable CI.

# Appendix

## How to scale services up/down

On the AWS console for frontend, go to EC2 > Auto Scaling Groups > search for the app + prod

Double the number of desired instances in the scaling group configuration. Note that no riff-raff deploys
will work at this point because a riff-raff deploy would double the desired instances again, exceeding
the number of max instances and fail, but you will have blocked deploys anyway.
