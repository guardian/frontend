package controllers.admin

import contentapi.{CapiHttpClient, PreviewContentApi}
import play.api.mvc.{Action, AnyContent, Controller}
import common.{ExecutionContexts, Logging}
import model.{ApplicationContext, NoCache}
import play.api.libs.ws.WSClient
import tools.LoadBalancer

import scala.concurrent.Future
import scala.concurrent.duration._

case class EndpointStatus(name: String, isOk: Boolean, messages: String*)

object TestPassed{
  def apply(name: String) = EndpointStatus(name, true)
}
object TestFailed{
  def apply(name: String, messages: String*) = EndpointStatus(name, false, messages:_*)
}

class TroubleshooterController(wsClient: WSClient)(implicit context: ApplicationContext) extends Controller with Logging with ExecutionContexts {

  val previewContentApi = new PreviewContentApi(new CapiHttpClient(wsClient))

  def index() = Action{ implicit request =>
    NoCache(Ok(views.html.troubleshooter(LoadBalancer.all.filter(_.testPath.isDefined))))
  }

  def test(id: String, testPath: String): Action[AnyContent] = Action.async{ implicit request =>

    val pathToTest = if(testPath.startsWith("/")) testPath else s"/$testPath" // appending leading '/' if user forgot to include it

    val loadBalancers = LoadBalancer.all.filter(_.testPath.isDefined)

    val thisLoadBalancer = loadBalancers.find(_.project == id)

    val directToLoadBalancer = thisLoadBalancer.map(testOnLoadBalancer(_, pathToTest, id))
      .getOrElse(Future.successful(TestFailed("Can find the appropriate loadbalancer")))
    val viaWebsite = testOnGuardianSite(pathToTest, id)
    val directToContentApi = testOnContentApi(pathToTest, id)
    val directToRouter = testOnRouter(pathToTest, id)
    val directToPreviewContentApi = testOnPreviewContentApi(pathToTest, id)
    val viaPreviewWebsite = testOnPreviewSite(pathToTest, id)

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

    def fetchWithRouterUrl(url: String) = {
      val result = httpGet("Can fetch directly from Router load balancer", s"http://$url$testPath")
      result.map{ result =>
        if (result.isOk)
          result
        else
          TestFailed(result.name, result.messages :+
            "NOTE: if hitting the Router you MUST set Host header to 'www.theguardian.com' or else you will get '403 Forbidden'":_*)
      }
    }

    LoadBalancer("frontend-router")
      .flatMap(_.url)
      .map(fetchWithRouterUrl)
      .getOrElse(Future.successful(TestFailed("Can get Frontend router url")))

  }

  private def testOnLoadBalancer(thisLoadBalancer: LoadBalancer, testPath: String, id: String): Future[EndpointStatus] = {
    thisLoadBalancer.url.map { url =>
      httpGet(s"Can fetch directly from ${thisLoadBalancer.name} load balancer", s"http://$url$testPath")
    }.getOrElse(Future(TestFailed(s"Can get ${thisLoadBalancer.name}'s loadbalancer url")))
  }

  private def testOnContentApi(testPath: String, id: String): Future[EndpointStatus] = {
    val testName = "Can fetch directly from Content API"
    val request = previewContentApi.client.item(testPath, "UK").showFields("all")
    previewContentApi.client.getResponse(request).map {
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
    val request = previewContentApi.client.item(testPath, "UK").showFields("all")
    previewContentApi.client.getResponse(request).map {
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
    httpGet("Can fetch from www.theguardian.com", s"https://www.theguardian.com$testPath")
  }

  private def testOnPreviewSite(testPath: String, id: String): Future[EndpointStatus] = {
    httpGet("Can fetch from preview.gutools.co.uk", s"https://preview.gutools.co.uk$testPath")
  }

  private def httpGet(testName: String, url: String) =  {
    wsClient.url(url).withVirtualHost("www.theguardian.com").withRequestTimeout(5.seconds).get().map {
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

