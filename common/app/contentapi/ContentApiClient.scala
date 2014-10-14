package contentapi

import akka.actor.ActorSystem
import com.gu.openplatform.contentapi.Api
import common.ContentApiMetrics.ContentApiCircuitBreakerOnOpen
import conf.Switches
import scala.concurrent.Future
import common._
import model.{Content, Trail}
import org.joda.time.DateTime
import org.scala_tools.time.Implicits._
import conf.Configuration.contentApi
import com.gu.openplatform.contentapi.model.ItemResponse

import scala.concurrent.duration.{Duration, SECONDS, MILLISECONDS}
import akka.pattern.{CircuitBreakerOpenException, CircuitBreaker}

trait QueryDefaults extends implicits.Collections with ExecutionContexts {
  // NOTE - do NOT add body to this list
  val trailFields = List(
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

  val inlineElements = List(
    "picture",
    "witness",
    "video",
    "embed"
  ).mkString(",")

  val leadContentMaxAge = 1.day

  object EditorsPicsOrLeadContentAndLatest {

    def apply(result: Future[ItemResponse]): Future[Seq[Trail]] =
      result.map{ r =>
        val leadContentCutOff = DateTime.now.toLocalDate - leadContentMaxAge

        val results = r.results.map(Content(_))
        val editorsPicks = r.editorsPicks.map(Content(_))

        val leadContent = if (editorsPicks.isEmpty)
            r.leadContent.filter(_.webPublicationDate >= leadContentCutOff.toDateTimeAtStartOfDay).map(Content(_)).take(1)
          else
            Nil

        (editorsPicks ++ leadContent ++ results).distinctBy(_.id)
      }
  }

  object FaciaDefaults {
    val tag = "tag=type/gallery|type/article|type/video|type/sudoku"
    val editorsPicks = "show-editors-picks=true"
    val showInlineFields = s"show-fields=$trailFields"
    val showFields = "trailText,headline,shortUrl,liveBloggingNow,thumbnail,commentable,commentCloseDate,shouldHideAdverts,lastModified,byline,standfirst,starRating,showInRelatedContent,internalContentCode"
    val showFieldsWithBody = showFields + ",body"

    val all = Seq(tag, editorsPicks, showInlineFields, showFields)

    def generateContentApiQuery(id: String): String =
      "%s?&%s"
        .format(id, all.mkString("", "&", ""))
  }
}


trait ApiQueryDefaults extends QueryDefaults with implicits.Collections with Logging { self: Api =>
  def item(id: String, edition: Edition): ItemQuery = item(id, edition.id)

  //common fields that we use across most queries.
  def item(id: String, edition: String): ItemQuery = item.itemId(id)
    .edition(edition)
    .showTags("all")
    .showFields(trailFields)
    .showInlineElements(inlineElements)
    .showElements("all")
    .showReferences(references)
    .showStoryPackage(true)

  //common fields that we use across most queries.
  def search(edition: Edition): SearchQuery = search
    .edition(edition.id)
    .showTags("all")
    .showInlineElements(inlineElements)
    .showReferences(references)
    .showFields(trailFields)
    .showElements("all")
}

trait ContentApiClient extends Api with ApiQueryDefaults with DelegateHttp with Logging {
  override val apiKey = contentApi.key

  override def fetch(url: String, parameters: Map[String, String]) = {
    checkQueryIsEditionalized(url, parameters)

    super.fetch(url, parameters + ("user-tier" -> "internal"))
  }

  private def checkQueryIsEditionalized(url: String, parameters: Map[String, Any]) {
    //you cannot editionalize tag queries
    if (!isTagQuery(url) && !parameters.isDefinedAt("edition")) throw new IllegalArgumentException(
      s"You should never, Never, NEVER create a query that does not include the edition. EVER: $url"
    )
  }

  private def isTagQuery(url: String) = url.endsWith("/tags")
}

trait CircuitBreakingContentApiClient extends ContentApiClient {
  private final val circuitBreakerActorSystem = ActorSystem("content-api-client-circuit-breaker")

  /** Read this:
    *
    * http://doc.akka.io/docs/akka/snapshot/common/circuitbreaker.html
    */
  private final val circuitBreaker = new CircuitBreaker(
    scheduler = circuitBreakerActorSystem.scheduler,
    maxFailures = 5,
    callTimeout = Duration(contentApi.timeout, MILLISECONDS),
    resetTimeout = Duration(20, SECONDS)
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

  override def fetch(url: String, parameters: Map[String, String]) = {
    if (Switches.CircuitBreakerSwitch.isSwitchedOn) {
      val future = circuitBreaker.withCircuitBreaker(super.fetch(url, parameters))

      future onFailure {
        case e: CircuitBreakerOpenException =>
          ContentApiMetrics.ContentApiCircuitBreakerRequestsMetric.record()
      }

      future
    } else {
      super.fetch(url, parameters)
    }
  }
}

class ElasticSearchLiveContentApiClient extends CircuitBreakingContentApiClient {
  lazy val httpTimingMetric = ContentApiMetrics.ElasticHttpTimingMetric
  lazy val httpTimeoutMetric = ContentApiMetrics.ElasticHttpTimeoutCountMetric
  override val targetUrl = contentApi.contentApiLiveHost
}
