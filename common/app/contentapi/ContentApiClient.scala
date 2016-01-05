package contentapi

import akka.actor.ActorSystem
import com.gu.contentapi.client.ContentApiClientLogic
import com.gu.contentapi.client.model.{ErrorResponse, ItemQuery, ItemResponse, SearchQuery}
import common.ContentApiMetrics.ContentApiCircuitBreakerOnOpen
import conf.switches.Switches
import scala.concurrent.{ExecutionContext, Future}
import common._
import model.{Content, Trail}
import org.joda.time.DateTime
import org.scala_tools.time.Implicits._
import conf.Configuration.contentApi
import com.gu.contentapi.client.model.{SearchQuery, ItemQuery, ItemResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration.{Duration, MILLISECONDS}
import akka.pattern.{CircuitBreakerOpenException, CircuitBreaker}

trait QueryDefaults extends implicits.Collections {
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

        val results = r.results.map(Content(_))
        val editorsPicks = r.editorsPicks.map(Content(_))

        val leadContent = if (editorsPicks.isEmpty)
            r.leadContent.filter(content => {
              content.webPublicationDate
                .map(date => new DateTime(date.dateTime))
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


trait ApiQueryDefaults extends QueryDefaults with implicits.Collections with Logging { self: ContentApiClientLogic =>
  def item(id: String, edition: Edition): ItemQuery = item(id, edition.id)

  //common fields that we use across most queries.
  def item(id: String, edition: String): ItemQuery = item(id)
    .edition(edition)
    .showTags("all")
    .showFields(trailFields)
    .showElements("all")
    .showReferences(references)
    .showStoryPackage(true)
    .showRights("syndicatable")

  //common fields that we use across most queries.
  def search(edition: Edition): SearchQuery = search
    .showTags("all")
    .showReferences(references)
    .showFields(trailFields)
    .showElements("all")
}

trait ContentApiClient extends ContentApiClientLogic with ApiQueryDefaults with DelegateHttp with Logging {
  override val apiKey = contentApi.key.getOrElse("")
}

trait CircuitBreakingContentApiClient extends ContentApiClient {
  private final val circuitBreakerActorSystem = ActorSystem("content-api-client-circuit-breaker")

  /** Read this:
    *
    * http://doc.akka.io/docs/akka/snapshot/common/circuitbreaker.html
    */
  private final val circuitBreaker = new CircuitBreaker(
    scheduler = circuitBreakerActorSystem.scheduler,
    maxFailures = contentApi.circuitBreakerErrorThreshold,
    callTimeout = Duration(contentApi.timeout, MILLISECONDS),
    resetTimeout = Duration(contentApi.circuitBreakerResetTimeout, MILLISECONDS)
  )

  circuitBreaker.onOpen({
    log.error("Reached error threshold for Content API Client circuit breaker - breaker is OPEN!")
    ContentApiCircuitBreakerOnOpen.increment()
  })

  circuitBreaker.onHalfOpen({
    log.info("Reset timeout finished. Entered half open state for Content API Client circuit breaker.")
  })

  circuitBreaker.onClose({
    log.info("Content API Client looks healthy again, circuit breaker is closed.")
  })

  override def fetch(url: String)(implicit executionContext: ExecutionContext) = {
    if (Switches.CircuitBreakerSwitch.isSwitchedOn) {
      val future = circuitBreaker.withCircuitBreaker(super.fetch(url)(executionContext))

      future onFailure {
        case e: CircuitBreakerOpenException =>
          ContentApiMetrics.ContentApiCircuitBreakerRequestsMetric.record()
      }

      future
    } else {
      super.fetch(url)
    }
  }
}

class LiveContentApiClient extends CircuitBreakingContentApiClient {
  lazy val httpTimingMetric = ContentApiMetrics.ElasticHttpTimingMetric
  lazy val httpTimeoutMetric = ContentApiMetrics.ElasticHttpTimeoutCountMetric
  override val targetUrl = contentApi.contentApiLiveHost
}

object ErrorResponseHandler {

  private val commercialExpiryMessage = "The requested resource has expired for commercial reason."

  def isCommercialExpiry(error: ErrorResponse): Boolean = {
    error.message == commercialExpiryMessage
  }
}
