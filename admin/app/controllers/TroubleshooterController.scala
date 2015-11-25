package controllers.admin

import contentapi.CircuitBreakingContentApiClient
import play.api.mvc.Controller
import common.{ContentApiMetrics, ExecutionContexts, Logging}
import model.NoCache
import controllers.AuthLogging
import tools.LoadBalancer
import play.api.libs.ws.WS
import scala.concurrent.Future
import conf.{AdminConfiguration, LiveContentApi}
import LiveContentApi.getResponse

case class EndpointStatus(name: String, isOk: Boolean, messages: String*)

object TestPassed{
  def apply(name: String) = EndpointStatus(name, true)
}
object TestFailed{
  def apply(name: String, messages: String*) = EndpointStatus(name, false, messages:_*)
}

object PreviewContentApi extends CircuitBreakingContentApiClient {
  lazy val httpTimingMetric = ContentApiMetrics.ElasticHttpTimingMetric
  lazy val httpTimeoutMetric = ContentApiMetrics.ElasticHttpTimeoutCountMetric
  override val targetUrl = AdminConfiguration.contentapi.previewHost
}

object TroubleshooterController extends Controller with Logging with AuthLogging with ExecutionContexts {

  def index() = AuthActions.AuthActionTest{ request =>
    NoCache(Ok(views.html.troubleshooter(LoadBalancer.all.filter(_.testPath.isDefined))))
  }

  def test(id: String, testPath: String) = AuthActions.AuthActionTest.async{ request =>

    val loadBalancers = LoadBalancer.all.filter(_.testPath.isDefined)

    val thisLoadBalancer = loadBalancers.find(_.project == id).head

    val viaWebsite = testOnGuardianSite(testPath, id)

    val directToContentApi = testOnContentApi(testPath, id)

    val directToLoadBalancer = testOnLoadBalancer(thisLoadBalancer, testPath, id)

    val directToRouter = testOnRouter(testPath, id)

    val directToPreviewContentApi = testOnPreviewContentApi(testPath, id)

    val viaPreviewWebsite = testOnPreviewSite(testPath, id)

    // NOTE - the order of these is important, they are ordered so that the first failure is furthest 'back'
    // in the stack
    Future.sequence(
      Seq(directToContentApi,
        directToLoadBalancer,
        directToRouter,
        viaWebsite,
        directToPreviewContentApi,
        viaPreviewWebsite)
    ).map { results =>
      NoCache(Ok(views.html.troubleshooterResults(thisLoadBalancer, results)))
    }
  }


  private def testOnRouter(testPath: String, id: String): Future[EndpointStatus] = {
    val router = LoadBalancer.all.find(_.project == "frontend-router").flatMap(_.url).head
    val result = httpGet("Can fetch directly from Router load balancer", s"http://$router$testPath")
    result.map{ result =>
      if (result.isOk)
        result
      else
        TestFailed(result.name, result.messages.toSeq :+
          "NOTE: if hitting the Router you MUST set Host header to 'www.theguardian.com' or else you will get '403 Forbidden'":_*)
    }
  }

  private def testOnLoadBalancer(thisLoadBalancer: LoadBalancer, testPath: String, id: String): Future[EndpointStatus] = {
    httpGet(s"Can fetch directly from ${thisLoadBalancer.name} load balancer", s"http://${thisLoadBalancer.url.head}$testPath")
  }

  private def testOnContentApi(testPath: String, id: String): Future[EndpointStatus] = {
    val testName = "Can fetch directly from Content API"
    val request = LiveContentApi.item(testPath, "UK").showFields("all")
    getResponse(request).map {
      response =>
        if (response.status == "ok") {
          TestPassed(testName)
        } else {
          TestFailed(testName, request.toString)
        }
    }.recoverWith {
      case t: Throwable => Future.successful(TestFailed("Direct to content api", t.getMessage, request.toString))
    }
  }

  private def testOnPreviewContentApi(testPath: String, id: String): Future[EndpointStatus] = {
    val testName = "Can fetch directly from Preview Content API"
    val request = PreviewContentApi.item(testPath, "UK").showFields("all")
    getResponse(request).map {
      response =>
        if (response.status == "ok") {
          TestPassed(testName)
        } else {
          TestFailed(testName, request.toString)
        }
    }.recoverWith {
      case t: Throwable => Future.successful(TestFailed("Direct to Preview Content API", t.getMessage, request.toString))
    }
  }

  private def testOnGuardianSite(testPath: String, id: String): Future[EndpointStatus] = {
    httpGet("Can fetch from www.theguardian.com", s"http://www.theguardian.com$testPath")
  }

  private def testOnPreviewSite(testPath: String, id: String): Future[EndpointStatus] = {
    httpGet("Can fetch from preview.gutools.co.uk", s"http://preview.gutools.co.uk$testPath")
  }

  private def httpGet(testName: String, url: String) =  {
    import play.api.Play.current
    WS.url(url).withVirtualHost("www.theguardian.com").withRequestTimeout(2000).get().map {
      response =>
        if (response.status == 200) {
          TestPassed(testName)
        } else {
          TestFailed(testName, s"Status: ${response.status}", url)
        }
    }.recoverWith {
      case t: Throwable => Future.successful(TestFailed(testName, t.getMessage, url))
    }
  }
}

