package contentapi

import java.util.concurrent.TimeUnit

import akka.actor.ActorSystem
import com.github.nscala_time.time.Implicits._
import com.gu.contentapi.client.model._
import com.gu.contentapi.client.model.v1.{Edition => _, _}
import com.gu.contentapi.client.{
  BackoffStrategy,
  Retryable,
  RetryableContentApiClient,
  ScheduledExecutor,
  ContentApiClient => CapiContentApiClient,
}
import common._
import concurrent.CircuitBreakerRegistry
import conf.Configuration
import conf.Configuration.contentApi
import conf.switches.Switches.CircuitBreakerSwitch

import scala.concurrent.duration.{Duration, MILLISECONDS}
import scala.concurrent.{ExecutionContext, Future}
import scala.util.Try

object QueryDefaults {
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
    "productionOffice",
  )

  val mainField = List[String]("main")

  val trailFields = trailFieldsList.mkString(",")

  //main field is needed for Main Media Atom data required by InlineYouTubeDisplayElement
  val trailFieldsWithMain: String = (trailFieldsList ::: mainField).mkString(",")

  val references = List(
    "pa-football-competition",
    "pa-football-team",
    "witness-assignment",
    "esa-cricket-match",
  ).mkString(",")

  val leadContentMaxAge = 1.day

  object FaciaDefaults {
    val tag = "tag=type/gallery|type/article|type/video|type/sudoku"
    val editorsPicks = "show-editors-picks=true"
    val showInlineFields = s"show-fields=$trailFields"
    val showFields =
      "trailText,headline,shortUrl,liveBloggingNow,thumbnail,commentable,commentCloseDate,shouldHideAdverts,lastModified,byline,standfirst,starRating,showInRelatedContent,internalContentCode,internalPageCode"
    val showFieldsWithBody = showFields + ",body"

    val all = Seq(tag, editorsPicks, showInlineFields, showFields)

    def generateContentApiQuery(id: String): String =
      "%s?&%s"
        .format(id, all.mkString("", "&", ""))
  }
}

trait ApiQueryDefaults extends GuLogging {

  def item(id: String): ItemQuery = CapiContentApiClient.item(id)

  def item(id: String, edition: Edition): ItemQuery = item(id, edition.id)

  //Strip unnecessary leading slash in path, as this affects signing of IAM requests
  def item(id: String, edition: String): ItemQuery =
    item(id.stripPrefix("/"))
    //common fields that we use across most queries.
      .edition(edition)
      .showSection(true)
      .showTags("all")
      .showFields(QueryDefaults.trailFields)
      .showElements("all")
      .showReferences(QueryDefaults.references)
      .showPackages(true)
      .showRights("syndicatable")
      .showAtoms("media")

  //common fields that we use across most queries.
  def search(): SearchQuery =
    CapiContentApiClient.search
      .showTags("all")
      .showReferences(QueryDefaults.references)
      .showFields(QueryDefaults.trailFieldsWithMain)
      .showElements("all")
      .showAtoms("media")
}

// This trait extends ContentApiClient with Cloudwatch metrics that monitor
// the average response time, and the number of timeouts, from Content Api.
trait MonitoredContentApiClientLogic extends CapiContentApiClient with ApiQueryDefaults with GuLogging {

  val httpClient: HttpClient

  def get(url: String, headers: Map[String, String])(implicit
      executionContext: ExecutionContext,
  ): Future[HttpResponse] = {
    val futureContent = httpClient.GET(url, headers) map { response: Response =>
      HttpResponse(response.body, response.status, response.statusText)
    }
    futureContent.failed.foreach { t =>
      val tryDecodedUrl: String = Try(java.net.URLDecoder.decode(url, "UTF-8")).getOrElse(url)
      log.error(s"$t: $tryDecodedUrl")
    }
    futureContent
  }
}

final case class CircuitBreakingContentApiClient(
    override val httpClient: HttpClient,
    override val targetUrl: String,
    apiKey: String,
)(implicit executionContext: ExecutionContext)
    extends MonitoredContentApiClientLogic
    with RetryableContentApiClient {
  override implicit val executor = ScheduledExecutor()
  val retryDuration = Duration(250L, TimeUnit.MILLISECONDS)
  val retryAttempts = 3
  override val backoffStrategy: Retryable = BackoffStrategy.constantStrategy(retryDuration, retryAttempts)

  private[this] val circuitBreaker = CircuitBreakerRegistry.withConfig(
    name = "content-api-client",
    system = ActorSystem("content-api-client-circuit-breaker"),
    maxFailures = contentApi.circuitBreakerErrorThreshold,
    callTimeout = contentApi.timeout + Duration
      .create(400, MILLISECONDS), // +400 to differentiate between circuit breaker and capi timeouts
    resetTimeout = contentApi.circuitBreakerResetTimeout,
  )

  override def get(url: String, headers: Map[String, String])(implicit
      executionContext: ExecutionContext,
  ): Future[HttpResponse] = {
    if (CircuitBreakerSwitch.isSwitchedOn) {
      circuitBreaker.withCircuitBreaker(super.get(url, headers)(executionContext))
    } else {
      super.get(url, headers)
    }
  }
}

class ContentApiClient(httpClient: HttpClient)(implicit executionContext: ExecutionContext) extends ApiQueryDefaults {

  // Public val for test.
  val thriftClient = CircuitBreakingContentApiClient(
    httpClient = httpClient,
    targetUrl = contentApi.contentApiHost,
    apiKey = contentApi.key.getOrElse(""),
  )

  private def getClient: CircuitBreakingContentApiClient = {
    thriftClient
  }

  def tags: TagsQuery = CapiContentApiClient.tags
  def sections: SectionsQuery = CapiContentApiClient.sections
  def editions: EditionsQuery = CapiContentApiClient.editions

  def getResponse(itemQuery: ItemQuery): Future[ItemResponse] = getClient.getResponse(itemQuery)

  def getResponse(searchQuery: SearchQuery): Future[SearchResponse] = getClient.getResponse(searchQuery)

  def getResponse(tagsQuery: TagsQuery): Future[TagsResponse] = getClient.getResponse(tagsQuery)

  def getResponse(sectionsQuery: SectionsQuery): Future[SectionsResponse] = getClient.getResponse(sectionsQuery)

  def getResponse(editionsQuery: EditionsQuery): Future[EditionsResponse] = getClient.getResponse(editionsQuery)

  def getResponse(atomUsageQuery: AtomUsageQuery): Future[AtomUsageResponse] = getClient.getResponse(atomUsageQuery)
}

// The Admin server uses this PreviewContentApi to check the preview environment.
// The Preview server uses the standard ContentApiClient object, configured with preview settings.
class PreviewContentApi(httpClient: HttpClient)(implicit executionContext: ExecutionContext)
    extends ContentApiClient(httpClient) {
  override val thriftClient = CircuitBreakingContentApiClient(
    httpClient = httpClient,
    targetUrl = Configuration.contentApi.previewHost.getOrElse(Configuration.contentApi.contentApiHost),
    apiKey = contentApi.key.getOrElse(""),
  )
}
