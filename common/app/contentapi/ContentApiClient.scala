package contentapi

import akka.actor.ActorSystem
import akka.pattern.CircuitBreaker
import com.gu.contentapi.client.ContentApiClientLogic
import com.gu.contentapi.client.model.v1.ItemResponse
import com.gu.contentapi.client.model._
import com.gu.contentapi.client.utils.CapiModelEnrichment.RichCapiDateTime
import common._
import conf.Configuration
import conf.Configuration.contentApi
import conf.switches.Switches.{CircuitBreakerSwitch, ContentApiUseThrift}
import metrics.{CountMetric, TimingMetric}
import model.{Content, Trail}
import org.joda.time.DateTime
import org.scala_tools.time.Implicits._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration.{Duration, MILLISECONDS}
import scala.concurrent.{ExecutionContext, Future}
import scala.util.Try

object QueryDefaults extends implicits.Collections {
  // NOTE - do NOT add body to this list
  val trailFields = List(
    "byline",
    "headline",
    "trail-text",
    "liveBloggingNow",
    "thumbnail",
    "hasStoryPackage",
    "wordcount",
    "shortUrl",
    "commentable",
    "commentCloseDate",
    "starRating",
    "productionOffice"
  ).mkString(",")

  val references = List(
    "pa-football-competition",
    "pa-football-team",
    "witness-assignment",
    "esa-cricket-match"
  ).mkString(",")

  val leadContentMaxAge = 1.day

  object EditorsPicsOrLeadContentAndLatest {
    def apply(result: Future[ItemResponse]): Future[Seq[Trail]] =
      result.map { r =>
        val leadContentCutOff = DateTime.now.toLocalDate - leadContentMaxAge

        val results = r.results.getOrElse(Nil).map(Content(_))
        val editorsPicks = r.editorsPicks.getOrElse(Nil).map(Content(_))

        val leadContent = if (editorsPicks.isEmpty)
            r.leadContent.getOrElse(Nil).filter(content => {
              content.webPublicationDate
                .map(date => date.toJodaDateTime)
                .map(_ >= leadContentCutOff.toDateTimeAtStartOfDay)
                .exists(identity)
            }).map(Content(_)).take(1)
          else
            Nil

        (editorsPicks ++ leadContent ++ results).distinctBy(_.metadata.id).map(_.trail)
      }
  }

  object FaciaDefaults {
    val tag = "tag=type/gallery|type/article|type/video|type/sudoku"
    val editorsPicks = "show-editors-picks=true"
    val showInlineFields = s"show-fields=$trailFields"
    val showFields = "trailText,headline,shortUrl,liveBloggingNow,thumbnail,commentable,commentCloseDate,shouldHideAdverts,lastModified,byline,standfirst,starRating,showInRelatedContent,internalContentCode,internalPageCode"
    val showFieldsWithBody = showFields + ",body"

    val all = Seq(tag, editorsPicks, showInlineFields, showFields)

    def generateContentApiQuery(id: String): String =
      "%s?&%s"
        .format(id, all.mkString("", "&", ""))
  }
}

trait ApiQueryDefaults extends Logging {

  def item(id:String): ItemQuery
  def search: SearchQuery

  def item(id: String, edition: Edition): ItemQuery = item(id, edition.id)

  //common fields that we use across most queries.
  def item(id: String, edition: String): ItemQuery = item(id)
    .edition(edition)
    .showSection(true)
    .showTags("all")
    .showFields(QueryDefaults.trailFields)
    .showElements("all")
    .showReferences(QueryDefaults .references)
    .showPackages(true)
    .showRights("syndicatable")

  //common fields that we use across most queries.
  def search(edition: Edition): SearchQuery = search
    .showTags("all")
    .showReferences(QueryDefaults.references)
    .showFields(QueryDefaults.trailFields)
    .showElements("all")
}

// This trait extends ContentApiClientLogic with Cloudwatch metrics that monitor
// the average response time, and the number of timeouts, from Content Api.
trait MonitoredContentApiClientLogic extends ContentApiClientLogic with ApiQueryDefaults with Logging {

  def httpTimingMetric: TimingMetric
  def httpTimeoutMetric: CountMetric

  var _http: Http = new WsHttp(httpTimingMetric, httpTimeoutMetric)

  override def get(url: String, headers: Map[String, String])(implicit executionContext: ExecutionContext): Future[HttpResponse] = {
    val futureContent = _http.GET(url, headers) map { response: Response =>
      HttpResponse(response.body, response.status, response.statusText)
    }
    futureContent.onFailure{ case t =>
      val tryDecodedUrl: String = Try(java.net.URLDecoder.decode(url, "UTF-8")).getOrElse(url)
      log.error(s"$t: $tryDecodedUrl")}
    futureContent
  }
}

final case class CircuitBreakingContentApiClient(
  override val httpTimingMetric: TimingMetric,
  override val httpTimeoutMetric: CountMetric,
  override val targetUrl: String,
  override val apiKey: String,
  override val useThrift: Boolean) extends MonitoredContentApiClientLogic {

  private val circuitBreakerActorSystem = ActorSystem("content-api-client-circuit-breaker")

  // http://doc.akka.io/docs/akka/snapshot/common/circuitbreaker.html
  private val circuitBreaker = new CircuitBreaker(
    scheduler = circuitBreakerActorSystem.scheduler,
    maxFailures = contentApi.circuitBreakerErrorThreshold,
    callTimeout = Duration(contentApi.timeout, MILLISECONDS),
    resetTimeout = Duration(contentApi.circuitBreakerResetTimeout, MILLISECONDS)
  )

  circuitBreaker.onOpen({
    log.error("Reached error threshold for Content API Client circuit breaker - breaker is OPEN!")
  })

  circuitBreaker.onHalfOpen({
    log.info("Reset timeout finished. Entered half open state for Content API Client circuit breaker.")
  })

  circuitBreaker.onClose({
    log.info("Content API Client looks healthy again, circuit breaker is closed.")
  })

  override def fetch(url: String)(implicit executionContext: ExecutionContext) = {
    if (CircuitBreakerSwitch.isSwitchedOn) {
      circuitBreaker.withCircuitBreaker(super.fetch(url)(executionContext))
    } else {
      super.fetch(url)
    }
  }
}

object ContentApiClient extends ApiQueryDefaults {

  // Public val for test.
  val jsonClient = CircuitBreakingContentApiClient(
    httpTimingMetric = ContentApiMetrics.HttpLatencyTimingMetric,
    httpTimeoutMetric = ContentApiMetrics.HttpTimeoutCountMetric,
    targetUrl = contentApi.contentApiHost,
    apiKey = contentApi.key.getOrElse(""),
    useThrift = false)

  // Public val for test.
  val thriftClient = CircuitBreakingContentApiClient(
    httpTimingMetric = ContentApiMetrics.HttpLatencyTimingMetric,
    httpTimeoutMetric = ContentApiMetrics.HttpTimeoutCountMetric,
    targetUrl = contentApi.contentApiHost,
    apiKey = contentApi.key.getOrElse(""),
    useThrift = true)

  private def getClient: CircuitBreakingContentApiClient = {
    if (ContentApiUseThrift.isSwitchedOn) thriftClient else jsonClient
  }

  def item(id: String) = getClient.item(id)
  def tags = getClient.tags
  def search = getClient.search
  def sections = getClient.sections
  def editions = getClient.editions

  def getResponse(itemQuery: ItemQuery)(implicit context: ExecutionContext) = getClient.getResponse(itemQuery)

  def getResponse(searchQuery: SearchQuery)(implicit context: ExecutionContext) = getClient.getResponse(searchQuery)

  def getResponse(tagsQuery: TagsQuery)(implicit context: ExecutionContext) = getClient.getResponse(tagsQuery)

  def getResponse(sectionsQuery: SectionsQuery)(implicit context: ExecutionContext) = getClient.getResponse(sectionsQuery)

  def getResponse(editionsQuery: EditionsQuery)(implicit context: ExecutionContext) = getClient.getResponse(editionsQuery)

  // Used for testing, and training preview.
  def setHttp(http: Http): Unit ={
    thriftClient._http = http
    jsonClient._http = http
  }
}

object DraftContentApi {
  val client = CircuitBreakingContentApiClient(
    httpTimingMetric = ContentApiMetrics.HttpLatencyTimingMetric,
    httpTimeoutMetric = ContentApiMetrics.HttpTimeoutCountMetric,
    targetUrl = Configuration.contentApi.contentApiDraftHost,
    apiKey = contentApi.key.getOrElse(""),
    useThrift = false
  )
}

// The Admin server uses this PreviewContentApi to check the preview environment.
// The Preview server uses the standard ContentApiClient object, configured with preview settings.
object PreviewContentApi {
  val client = CircuitBreakingContentApiClient(
    httpTimingMetric = ContentApiMetrics.HttpLatencyTimingMetric,
    httpTimeoutMetric = ContentApiMetrics.HttpTimeoutCountMetric,
    targetUrl = Configuration.contentApi.previewHost,
    apiKey = contentApi.key.getOrElse(""),
    useThrift = false
  )
}
