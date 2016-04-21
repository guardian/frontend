package commercial

import commercial.feeds._
import common.{AkkaAsync, ExecutionContexts, Jobs, Logging}
import model.commercial.jobs.Industries
import model.commercial.events.MasterclassTagsAgent
import model.commercial.money.BestBuysAgent
import model.commercial.travel.Countries
import play.api.{Application => PlayApp, GlobalSettings}

import scala.concurrent.Future
import scala.concurrent.duration._
import scala.util.Random
import scala.util.control.NonFatal

import akka.agent.Agent

trait CommercialLifecycle extends GlobalSettings with Logging with ExecutionContexts {

  private val refreshJobs: List[RefreshJob] = List(
    MasterClassTagsRefresh,
    CountriesRefresh,
    IndustriesRefresh,
    MoneyBestBuysRefresh
  )

  private def recordEvent(feedName: String, eventName: String, maybeDuration: Option[Duration]): Unit = {
    val key = s"${feedName.toLowerCase.replaceAll("[\\s/]+", "-")}"
    val duration = maybeDuration map (_.toMillis.toDouble) getOrElse -1d
    log.info(s"The key is this : $key")
//    CommercialMetrics.metrics.put(Map(s"$key" -> duration))
    log.info(s"$key $eventName  ame took $duration ms")
  }

  val fetchSuccessCount = Agent(0.0)
  val fetchFailureCount = Agent(0.0)
  val parseSuccessCount = Agent(0.0)
  val parseFailureCount = Agent(0.0)


  private def recordSuccess(eventName:String): Double = eventName match{
    case "fetch" =>
      fetchSuccessCount send (_ + 1.0)
      val successResult = fetchSuccessCount.get()
      log.info(s"logging a success now, agent:(fetch) $successResult")
      successResult
    case "parse" =>
      parseSuccessCount send (_ + 1.0)
      val successResult = parseSuccessCount.get()
      log.info(s"logging a success now, agent:(parse) $successResult")
      successResult
  }

  private def recordFailure(eventName:String): Double = eventName match{
    case "fetch" =>
      fetchFailureCount send (_ + 1.0)
      val failureResult = fetchFailureCount.get()
      log.info(s"logging a failure now , agent:(fetch) $failureResult")
      failureResult

    case "parse" =>
      parseFailureCount send (_ +1.0)
      val failureResult = parseFailureCount.get()
      log.info(s"logging a failure now , agent:(parse) $failureResult")
      failureResult
  }

  private def successUploader(eventName:String): Future[Unit] =  eventName match{
    case "fetch"=>
    val currentFetchCount = recordSuccess("fetch")
    val f: Future[Unit] = Future {
      CommercialMetrics.metrics.put(Map(s"successful-fetches" -> currentFetchCount))
      log.info(s"uploading the success count to cloud: Count :(fetch) $currentFetchCount")
    }
    fetchSuccessCount send (_ - currentFetchCount)
    f

    case "parse" =>
      val currentParseCount = recordSuccess("parse")
      val f: Future[Unit] = Future {
        CommercialMetrics.metrics.put(Map(s"successful-parses" -> currentParseCount))
        log.info(s"uploading the success count to cloud: Count :(parse) $currentParseCount")
      }
      parseSuccessCount send (_ - currentParseCount)
      f
  }

  private def failureUploader(eventName:String): Future[Unit] = eventName match {
    case "fetch" =>
    val currentFetchCount = recordFailure("fetch")
    val f: Future[Unit] = Future {
      CommercialMetrics.metrics.put(Map(s"failed-fetches" -> currentFetchCount))
      log.info(s"uploading the failure count to cloud: Count :(fetch) $currentFetchCount")
    }
    fetchFailureCount send (_ - currentFetchCount)
    f
    case "parse" =>
      val currentParseCount = recordFailure("parse")
      val f: Future[Unit] = Future {
        CommercialMetrics.metrics.put(Map(s"failed-parses" -> currentParseCount))
        log.info(s"uploading the failure count to cloud: Count :(parse) $currentParseCount")
      }
      parseFailureCount send (_ - currentParseCount)
      f
  }


  override def onStart(application: PlayApp): Unit = {

    def randomStartSchedule(minsLater: Int = 0) = s"0 ${Random.nextInt(15) + minsLater}/15 * * * ?"

    def fetchFeed(fetcher: FeedFetcher): Future[Unit] = {

      val feedName = fetcher.feedMetaData.name

      def recordFetch(maybeDuration: Option[Duration]): Unit = {
        recordEvent(feedName, "fetch", maybeDuration)
      }

      val msgPrefix = s"Fetching $feedName feed"
      log.info(s"$msgPrefix from ${fetcher.feedMetaData.url} ...")
      val eventualResponse = fetcher.fetch()
      eventualResponse onFailure {
        case e: SwitchOffException =>
          log.warn(s"$msgPrefix failed: ${e.getMessage}")
        case NonFatal(e) =>
          recordFetch(None)
          recordFailure("fetch")
          log.error(s"$msgPrefix failed: ${e.getMessage}", e)
      }
      eventualResponse onSuccess {
        case response =>
          S3FeedStore.put(feedName, response.feed)
          recordFetch(Some(response.duration))
          recordSuccess("fetch")
          log.info(s"$msgPrefix succeeded in ${response.duration}")
      }
      eventualResponse.map(_ => ())
    }

    def parseFeed[T](parser: FeedParser[T]): Future[Unit] = {

      val feedName = parser.feedMetaData.name

      def recordParse(maybeDuration: Option[Duration]): Unit = {
        recordEvent(feedName, "parse", maybeDuration)
      }

      val msgPrefix = s"Parsing $feedName feed"
      log.info(s"$msgPrefix ...")
      val parsedFeed = parser.parse(S3FeedStore.get(parser.feedMetaData.name))
      parsedFeed onFailure {
        case e: SwitchOffException =>
          log.warn(s"$msgPrefix failed: ${e.getMessage}")
        case NonFatal(e) =>
          recordParse(None)
          recordFailure("parse")
          log.error(s"$msgPrefix failed: ${e.getMessage}", e)
      }
      parsedFeed onSuccess {
        case feed =>
          recordParse(Some(feed.parseDuration))
          recordSuccess("parse")
          log.info(s"$msgPrefix succeeded: parsed ${feed.contents.size} $feedName in ${feed.parseDuration}")
      }
      parsedFeed.map(_ => ())
    }


    super.onStart(application)

    def mkJobName(feedName: String, task: String): String = s"${feedName.replaceAll("/", "-")}-$task-job"

    for (fetcher <- FeedFetcher.all) {
      val feedName = fetcher.feedMetaData.name
      val jobName = mkJobName(feedName, "fetch")
      Jobs.deschedule(jobName)
//      Jobs.scheduleEveryNMinutes(jobName, 15) {
//        fetchFeed(fetcher)
//      }
      Jobs.scheduleEveryNSeconds(jobName,10){
        fetchFeed(fetcher)
      }
    }

    for (parser <- FeedParser.all) {
      val feedName = parser.feedMetaData.name
      val jobName = mkJobName(feedName, "parse")
      Jobs.deschedule(jobName)
//      Jobs.scheduleEveryNMinutes(jobName, 15) {
//        parseFeed(parser)
//      }
      Jobs.scheduleEveryNSeconds(jobName, 10) {
        parseFeed(parser)
      }
    }
    /////////////////////////////////////WORKING ON THIS CURRENTLY//////////////////////////////////
    Jobs.scheduleEveryNSeconds("cloudwatchSuccessUpdate",10){
      successUploader("fetch")
      successUploader("parse")
    }
    Jobs.scheduleEveryNSeconds("cloudwatchFailureUpdate",10){
      failureUploader("fetch")
      failureUploader("parse")
    }

    Jobs.deschedule("cloudwatchUpload")
    Jobs.scheduleEveryNMinutes("cloudwatchUpload", 15) {
      CommercialMetrics.metrics.upload()
      Future.successful(())
    }

    refreshJobs.zipWithIndex foreach {
      case (job, i) => job.start(randomStartSchedule(minsLater = i))
    }

    AkkaAsync {

      MasterclassTagsAgent.refresh() onFailure {
        case NonFatal(e) => log.warn(s"Failed to refresh masterclass tags: ${e.getMessage}")
      }

      Countries.refresh() onFailure {
        case NonFatal(e) => log.warn(s"Failed to refresh travel offer countries: ${e.getMessage}")
      }

      Industries.refresh() onFailure {
        case NonFatal(e) => log.warn(s"Failed to refresh job industries: ${e.getMessage}")
      }

      BestBuysAgent.refresh()

      for (fetcher <- FeedFetcher.all) {
        fetchFeed(fetcher)
      }

      for (parser <- FeedParser.all) {
        parseFeed(parser)
      }
    }
  }

  override def onStop(app: PlayApp): Unit = {
    refreshJobs foreach (_.stop())

    for (fetcher <- FeedFetcher.all) {
      Jobs.deschedule(s"${fetcher.feedMetaData.name}FetchJob")
    }

    for (parser <- FeedParser.all) {
      Jobs.deschedule(s"${parser.feedMetaData.name}ParseJob")
    }

    Jobs.deschedule("cloudwatchUpload")

    super.onStop(app)
  }
}
