package common

import com.gu.openplatform.contentapi.{ApiError, Api}
import com.gu.openplatform.contentapi.connection.{Proxy => ContentApiProxy, HttpResponse}
import com.gu.management.{ CountMetric, Metric, TimingMetric }
import conf.Configuration
import java.util.concurrent.TimeoutException
import scala.concurrent.Future
import play.api.libs.concurrent.Execution.Implicits._
import play.api.libs.ws.WS
import com.gu.openplatform.contentapi.util.FutureInstances

import com.gu.openplatform.contentapi.connection.Http


trait ApiQueryDefaults { self: Api[Future] =>

  val supportedTypes = "type/gallery|type/article|type/video"

  //NOTE - do NOT add body to this list
  val trailFields = "headline,trail-text,liveBloggingNow,thumbnail,hasStoryPackage,wordcount"

  val references = "pa-football-competition,pa-football-team"

  val inlineElements = "picture,witness,video"

  //common fileds that we use across most queries.
  def item(id: String, edition: String): ItemQuery = item.itemId(id)
    .edition(edition)
    .showTags("all")
    .showFields(trailFields)
    .showInlineElements(inlineElements)
    .showMedia("all")
    .showReferences(references)
    .showStoryPackage(true)
    .tag(supportedTypes)

  //common fields that we use across most queries.
  def search(edition: String): SearchQuery = search
    .edition(edition)
    .showTags("all")
    .showInlineElements(inlineElements)
    .showReferences(references)
    .showFields(trailFields)
    .showMedia("all")
    .tag(supportedTypes)
}

object ContentApiMetrics {
  object HttpTimingMetric extends TimingMetric(
    "performance",
    "content-api-calls",
    "Content API calls",
    "outgoing requests to content api"
  ) with TimingMetricLogging

  object HttpTimeoutCountMetric extends CountMetric(
    "timeout",
    "content-api-timeouts",
    "Content API timeouts",
    "Content api calls that timeout"
  )

  val all: Seq[Metric] = Seq(HttpTimingMetric, HttpTimeoutCountMetric)
}

trait DelegateHttp extends Http[Future] {
  import System.currentTimeMillis
  import ContentApiMetrics._

  private val dispatch = new Http[Future] with Logging {
    override def GET(url: String, headers: Iterable[(String, String)]) = {
      val start = currentTimeMillis
      val response = WS.url(url).withHeaders(headers.toSeq: _*).withTimeout(2000).get()

      // record metrics
      // TODO count timeouts
      response.onSuccess{
        case _ => HttpTimingMetric.recordTimeSpent(currentTimeMillis - start)
      }

      response.map{ r => HttpResponse(r.body, r.status, r.statusText)}
    }
  }

  private var _http: Http[Future] = dispatch
  def http = _http
  def http_=(delegateHttp: Http[Future]) = _http = delegateHttp

  override def GET(url: String, headers: scala.Iterable[scala.Tuple2[String, String]]) = _http.GET(url, headers)

  private def isTimeout(e: Throwable): Boolean = Option(e.getCause)
    .map(_.getClass == classOf[TimeoutException])
    .getOrElse(false)
}



import FutureInstances._

class ContentApiClient(configuration: GuardianConfiguration) extends Api[Future] with ApiQueryDefaults with DelegateHttp
    with Logging {

  import Configuration.contentApi
  override val targetUrl = contentApi.host
  apiKey = Some(contentApi.key)

  override protected def fetch(url: String, parameters: Map[String, Any]) = {

    checkQueryIsEditionalized(url, parameters)

    //TODO measure me
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

