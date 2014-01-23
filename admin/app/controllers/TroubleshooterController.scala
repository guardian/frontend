package controllers.admin

import play.api.mvc.Controller
import common.{ExecutionContexts, Logging}
import model.NoCache
import controllers.AuthLogging
import tools.LoadBalancer
import play.api.libs.ws.WS
import scala.concurrent.Future
import conf.SwitchingContentApi

case class EndpointStatus(name: String, isOk: Boolean, messages: String*)
object TestPassed{
  def apply(name: String) = EndpointStatus(name, true)
}
object TestFailed{
  def apply(name: String, messages: String*) = EndpointStatus(name, false, messages:_*)
}

object TroubleshooterController extends Controller with Logging with AuthLogging with ExecutionContexts {

  def index() = Authenticated{ request =>
    NoCache(Ok(views.html.troubleshooter(LoadBalancer.all.filter(_.testPath.isDefined))))
  }

  def test(id: String, testPath: String) = Authenticated.async{ request =>

    val loadBalancers = LoadBalancer.all.filter(_.testPath.isDefined)

    val thisLoadBalancer = loadBalancers.find(_.project == id).head

    val viaWebsite = testOnGuardianSite(testPath, id)

    val directToContentApi = testOnContentApi(testPath, id)

    val directToLoadBalancer = testOnLoadBalancer(thisLoadBalancer, testPath, id)

    val directToRouter = testOnRouter(testPath, id)

    // NOTE - the order of these is important, they are ordered so that the first failure is furthest 'back'
    // in the stack
    Future.sequence(Seq(directToContentApi, directToLoadBalancer, directToRouter, viaWebsite)).map{ results =>
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
    val request = SwitchingContentApi().item(testPath, "UK").showFields("all")
    request.response.map {
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

  private def testOnGuardianSite(testPath: String, id: String): Future[EndpointStatus] = {
    httpGet("Can fetch from www.theguardian.com", s"http://www.theguardian.com$testPath?view=mobile")
  }

  private def httpGet(testName: String, url: String) =  {
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

