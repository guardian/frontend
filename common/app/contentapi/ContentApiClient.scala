package contentapi

import akka.actor.ActorSystem
import akka.pattern.CircuitBreaker
import com.gu.contentapi.client.ContentApiClientLogic
import com.gu.contentapi.client.model._
import com.gu.contentapi.client.model.v1.{Edition => _, _}
import com.gu.contentapi.client.utils.CapiModelEnrichment.RichCapiDateTime
import common._
import conf.Configuration
import conf.Configuration.contentApi
import conf.switches.Switches.CircuitBreakerSwitch
import model.{Content, Trail}
import org.joda.time.DateTime
import org.scala_tools.time.Implicits._

import scala.concurrent.duration.{Duration, MILLISECONDS}
import scala.concurrent.{ExecutionContext, Future}
import scala.util.Try

object QueryDefaults extends implicits.Collections {
  // NOTE - do NOT add body to this list
  val trailFieldsList = List[String](
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
    "productionOffice")

  val mainField = List[String]("main")

  val trailFields = trailFieldsList.mkString(",")

  //main field is needed for Main Media Atom data required by InlineYouTubeDisplayElement
  val trailFieldsWithMain: String = (trailFieldsList ::: mainField).mkString(",")

  val references = List(
    "pa-football-competition",
    "pa-football-team",
    "witness-assignment",
    "esa-cricket-match"
  ).mkString(",")

  val leadContentMaxAge = 1.day

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
    .showAtoms("media")

  //common fields that we use across most queries.
  def search(edition: Edition): SearchQuery = search
    .showTags("all")
    .showReferences(QueryDefaults.references)
    .showFields(QueryDefaults.trailFieldsWithMain)
    .showElements("all")
    .showAtoms("media")
}

// This trait extends ContentApiClientLogic with Cloudwatch metrics that monitor
// the average response time, and the number of timeouts, from Content Api.
trait MonitoredContentApiClientLogic extends ContentApiClientLogic with ApiQueryDefaults with Logging {

  val httpClient: HttpClient
  val _httpClient = httpClient //TODO: to delete once ContentApiClient fully uses DI

  override def get(url: String, headers: Map[String, String])(implicit executionContext: ExecutionContext): Future[HttpResponse] = {
    val futureContent = _httpClient.GET(url, headers) map { response: Response =>
      HttpResponse(response.body, response.status, response.statusText)
    }
    futureContent.onFailure{ case t =>
      val tryDecodedUrl: String = Try(java.net.URLDecoder.decode(url, "UTF-8")).getOrElse(url)
      log.error(s"$t: $tryDecodedUrl")}
    futureContent
  }
}

final case class CircuitBreakingContentApiClient(
  override val httpClient: HttpClient,
  override val targetUrl: String,
  apiKey: String
)(implicit executionContext: ExecutionContext)
  extends MonitoredContentApiClientLogic {

  private val circuitBreakerActorSystem = ActorSystem("content-api-client-circuit-breaker")

  // http://doc.akka.io/docs/akka/snapshot/common/circuitbreaker.html
  private val circuitBreaker = new CircuitBreaker(
    scheduler = circuitBreakerActorSystem.scheduler,
    maxFailures = contentApi.circuitBreakerErrorThreshold,
    callTimeout = contentApi.timeout,
    resetTimeout = contentApi.circuitBreakerResetTimeout
  )

  circuitBreaker.onOpen(
    log.error(s"CAPI circuit breaker: reached error threshold (${contentApi.circuitBreakerErrorThreshold}). Breaker is OPEN!")
  )

  circuitBreaker.onHalfOpen(
    log.info(s"CAPI circuit breaker: Reset timeout (${contentApi.circuitBreakerResetTimeout}) finished. Entered half open state.")
  )

  circuitBreaker.onClose(
    log.info("CAPI circuit breaker: Content API Client looks healthy again, circuit breaker is closed.")
  )

  override def fetch(url: String)(implicit executionContext: ExecutionContext): Future[Array[Byte]] = {
    if (CircuitBreakerSwitch.isSwitchedOn) {
      circuitBreaker.withCircuitBreaker(super.fetch(url)(executionContext))
    } else {
      super.fetch(url)
    }
  }
}

class ContentApiClient(httpClient: HttpClient)(implicit executionContext: ExecutionContext) extends ApiQueryDefaults {

  // Public val for test.
  val thriftClient = CircuitBreakingContentApiClient(
    httpClient = httpClient,
    targetUrl = contentApi.contentApiHost,
    apiKey = contentApi.key.getOrElse("")
  )

  private def getClient: CircuitBreakingContentApiClient = {
    thriftClient
  }

  def item(id: String): ItemQuery = getClient.item(id)
  def tags: TagsQuery = getClient.tags
  def search: SearchQuery = getClient.search
  def sections: SectionsQuery = getClient.sections
  def editions: EditionsQuery = getClient.editions

  def getResponse(itemQuery: ItemQuery): Future[ItemResponse] = getClient.getResponse(itemQuery)

  def getResponse(searchQuery: SearchQuery): Future[SearchResponse] = getClient.getResponse(searchQuery)

  def getResponse(tagsQuery: TagsQuery): Future[TagsResponse] = getClient.getResponse(tagsQuery)

  def getResponse(sectionsQuery: SectionsQuery): Future[SectionsResponse] = getClient.getResponse(sectionsQuery)

  def getResponse(editionsQuery: EditionsQuery): Future[EditionsResponse] = getClient.getResponse(editionsQuery)
}

// The Admin server uses this PreviewContentApi to check the preview environment.
// The Preview server uses the standard ContentApiClient object, configured with preview settings.
class PreviewContentApi(httpClient: HttpClient)(implicit executionContext: ExecutionContext) extends ContentApiClient(httpClient) {
  override val thriftClient = CircuitBreakingContentApiClient(
    httpClient = httpClient,
    targetUrl = Configuration.contentApi.previewHost,
    apiKey = contentApi.key.getOrElse("")
  )
}
