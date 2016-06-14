package commercial

import common.{AkkaAgent, Logging}

sealed trait FeedAction {}

object FeedAction {
  case object Fetch extends FeedAction { override def toString = "fetch" }
  case object Parse extends FeedAction { override def toString = "parse" }
}

private[commercial] case class CommercialFeedEvent(feedName: String, feedAction: FeedAction, success: Boolean) {

  val result: String = if (success) "success" else "failure"
  val actionAndResult: String = s"$feedAction-$result"
  val actionNameAndResult: String = s"$feedAction-$feedName-$result"
}

private object CommercialLifecycleMetrics extends Logging {

  val feedEvents = AkkaAgent[Seq[CommercialFeedEvent]](Seq.empty)

  private[commercial] def logMetric(metric: CommercialFeedEvent) = feedEvents.send(_ :+ metric)

  def updateMetrics(): Unit = {

    def toAggregatedMap(metricName: String, events: Seq[CommercialFeedEvent]) = metricName -> events.size.toDouble

    def pushAggregateMetrics() = {
      val metricsByActionAndResult = feedEvents.get groupBy (_.actionAndResult) map Function.tupled(toAggregatedMap _)
      log.info(s"Updating commercial feeds 'aggregate' metric: $metricsByActionAndResult")
      CommercialMetrics.metrics.put(metricsByActionAndResult)
    }

    def pushIndividualFeedMetrics() = {
      val failingFeedsByActionAndName = feedEvents.get filterNot (_.success) groupBy (_.actionNameAndResult) map Function.tupled(toAggregatedMap _)
      log.info(s"Updating commercial feeds 'failing' metric: $failingFeedsByActionAndName")
      CommercialMetrics.metrics.put(failingFeedsByActionAndName)
    }

    def resetMetrics(): Unit = feedEvents.send(Seq.empty)

    pushAggregateMetrics()
    pushIndividualFeedMetrics()
    CommercialMetrics.metrics.upload()
    resetMetrics()
  }
}
