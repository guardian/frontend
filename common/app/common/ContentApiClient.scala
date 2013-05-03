package common

import com.gu.openplatform.contentapi.Api
import com.gu.openplatform.contentapi.connection.{Proxy => ContentApiProxy, HttpResponse}
import com.gu.management.{ CountMetric, Metric, TimingMetric }
import conf.Configuration
import java.util.concurrent.TimeoutException
import scala.concurrent.Future
import play.api.libs.concurrent.Execution.Implicits._
import play.api.libs.ws.WS
import com.gu.openplatform.contentapi.util.FutureInstances._

import com.gu.openplatform.contentapi.connection.Http

trait ApiQueryDefaults { self: Api[Future] =>

  val supportedTypes = "type/gallery|type/article|type/video"

  //NOTE - do NOT add body to this list
  val trailFields = "headline,trail-text,liveBloggingNow,thumbnail,hasStoryPackage,wordcount"

  val references = "pa-football-competition,pa-football-team,witness-assignment"

  val inlineElements = "picture,witness,video"

  //common fields that we use across most queries.
  def item(id: String, edition: Edition): ItemQuery = item.itemId(id)
    .edition(edition.id)
    .showTags("all")
    .showFields(trailFields)
    .showInlineElements(inlineElements)
    .showMedia("all")
    .showReferences(references)
    .showStoryPackage(true)
    .tag(supportedTypes)

  //common fields that we use across most queries.
  def search(edition: Edition): SearchQuery = search
    .edition(edition.id)
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

  object DogpileHitsCountMetric extends CountMetric(
    "performance",
    "content-api-dogpile-hits",
    "Content API dogpile hits",
    "Hits to the content api dogpile cache"
  )

  val all: Seq[Metric] = Seq(HttpTimingMetric, HttpTimeoutCountMetric, DogpileHitsCountMetric)
}

trait DelegateHttp extends Http[Future] {
  import System.currentTimeMillis
  import ContentApiMetrics._
  import Configuration.host
  import java.net.URLEncoder.encode

  private val wsHttp = new Http[Future] with Logging {
    override def GET(url: String, headers: Iterable[(String, String)]) = {
      val urlWithHost = url + s"&host-name=${encode(host.name, "UTF-8")}"

      val start = currentTimeMillis
      val response = WS.url(urlWithHost).withHeaders(headers.toSeq: _*).withTimeout(2000).get()

      // record metrics
      response.onSuccess{ case _ => HttpTimingMetric.recordTimeSpent(currentTimeMillis - start) }
      response.onFailure{ case e: Throwable if isTimeout(e) => HttpTimeoutCountMetric.increment }
      response
    }.map{ r => HttpResponse(r.body, r.status, r.statusText)}
  }

  private var _http: Http[Future] = wsHttp
  def http = _http
  def http_=(delegateHttp: Http[Future]) = _http = delegateHttp

  override def GET(url: String, headers: scala.Iterable[scala.Tuple2[String, String]]) = _http.GET(url, headers)

  private def isTimeout(e: Throwable): Boolean = Option(e.getCause)
    .map(_.getClass == classOf[TimeoutException])
    .getOrElse(false)
}

class ContentApiClient(configuration: GuardianConfiguration) extends Api[Future] with ApiQueryDefaults with DelegateHttp
    with Logging {

  import Configuration.contentApi
  override val targetUrl = contentApi.host
  apiKey = Some(contentApi.key)

  override protected def fetch(url: String, parameters: Map[String, Any]) = {
    checkQueryIsEditionalized(url, parameters)
    super.fetch(url, parameters + ("user-tier" -> "internal"))
  }

  private def checkQueryIsEditionalized(url: String, parameters: Map[String, Any]) {
    //you cannot editionalize tag queries                                                                                                                                  super.G
    if (!isTagQuery(url) && !parameters.isDefinedAt("edition")) throw new IllegalArgumentException(
      s"You should never, Never, NEVER create a query that does not include the edition. EVER: $url"
    )
  }

  private def isTagQuery(url: String) = url.endsWith("/tags")

}