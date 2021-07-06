package controllers.admin

import com.amazonaws.services.ec2.model.{DescribeInstancesRequest, Filter}
import com.amazonaws.services.ec2.{AmazonEC2, AmazonEC2ClientBuilder}
import common.{GuLogging, ImplicitControllerExecutionContext}
import conf.Configuration.aws.credentials
import contentapi.{CapiHttpClient, ContentApiClient, PreviewContentApi, PreviewSigner}
import model.{ApplicationContext, NoCache}
import play.api.Mode
import play.api.libs.ws.WSClient
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}
import tools.LoadBalancer

import scala.collection.JavaConverters._
import scala.concurrent.Future
import scala.concurrent.duration._
import scala.util.Random

case class EndpointStatus(name: String, isOk: Boolean, messages: String*)

object TestPassed {
  def apply(name: String): EndpointStatus = EndpointStatus(name, true)
}
object TestFailed {
  def apply(name: String, messages: String*): EndpointStatus = EndpointStatus(name, false, messages: _*)
}

class TroubleshooterController(wsClient: WSClient, val controllerComponents: ControllerComponents)(implicit
    appContext: ApplicationContext,
) extends BaseController
    with GuLogging
    with ImplicitControllerExecutionContext {

  private val capiLiveHttpClient = new CapiHttpClient(wsClient)
  private val capiPreviewHttpClient = new CapiHttpClient(wsClient) { override val signer = Some(PreviewSigner()) }
  val contentApi = new ContentApiClient(capiLiveHttpClient)
  val previewContentApi = new PreviewContentApi(capiPreviewHttpClient)

  private lazy val awsEc2Client: Option[AmazonEC2] = credentials.map { credentials =>
    AmazonEC2ClientBuilder
      .standard()
      .withCredentials(credentials)
      .withRegion(conf.Configuration.aws.region)
      .build()
  }

  def index(): Action[AnyContent] =
    Action { implicit request =>
      NoCache(Ok(views.html.troubleshooter(LoadBalancer.all.filter(_.testPath.isDefined))))
    }

  def test(id: String, testPath: String): Action[AnyContent] =
    Action.async { implicit request =>
      val pathToTest =
        if (testPath.startsWith("/")) testPath else s"/$testPath" // appending leading '/' if user forgot to include it

      val loadBalancers = LoadBalancer.all.filter(_.testPath.isDefined)

      val thisLoadBalancer = loadBalancers.find(_.project == id)

      val directToLoadBalancer = thisLoadBalancer
        .map(testOnLoadBalancer(_, pathToTest, id))
        .getOrElse(Future.successful(TestFailed("Can find the appropriate loadbalancer")))
      val viaWebsite = testOnGuardianSite(pathToTest, id)
      val directToContentApi = testOnContentApi(pathToTest, id)
      val directToRouter = testOnRouter(pathToTest, id)
      val directToPreviewContentApi = testOnPreviewContentApi(pathToTest, id)
      val viaPreviewWebsite = testOnPreviewSite(pathToTest, id)

      // NOTE - the order of these is important, they are ordered so that the first failure is furthest 'back'
      // in the stack
      Future
        .sequence(
          Seq(
            directToContentApi,
            directToLoadBalancer,
            directToRouter,
            viaWebsite,
            directToPreviewContentApi,
            viaPreviewWebsite,
          ),
        )
        .map { results =>
          NoCache(Ok(views.html.troubleshooterResults(thisLoadBalancer, results)))
        }
    }

  private def testOnRouter(testPath: String, id: String): Future[EndpointStatus] = {

    def fetchWithRouterUrl(url: String) = {
      val result = httpGet("Can fetch directly from Router load balancer", s"http://$url$testPath")
      result.map { result =>
        if (result.isOk)
          result
        else
          TestFailed(
            result.name,
            result.messages :+
              "NOTE: if hitting the Router you MUST set Host header to 'www.theguardian.com' or else you will get '403 Forbidden'": _*,
          )
      }
    }

    val routerUrl = if (appContext.environment.mode == Mode.Prod) {
      // Workaround in PROD:
      // Getting the private dns of one of the router instances because
      // the Router ELB can only be accessed via its public IP/DNS from Fastly or Guardian VPN/office, not from an Admin instance
      // However Admin instances can access router instances via private IPs
      // This is of course not very fast since it has to make a call to AWS API before to fetch the url
      // but the troubleshooter is an admin only tool
      val tagsAsFilters = Map(
        "Stack" -> "frontend",
        "App" -> "router",
        "Stage" -> "PROD",
      ).map {
        case (name, value) => new Filter("tag:" + name).withValues(value)
      }.asJavaCollection
      val instancesDnsName: Seq[String] = awsEc2Client
        .map(
          _.describeInstances(new DescribeInstancesRequest().withFilters(tagsAsFilters)).getReservations.asScala
            .flatMap(_.getInstances.asScala)
            .map(_.getPrivateDnsName),
        )
        .toSeq
        .flatten
      Random.shuffle(instancesDnsName).headOption
    } else {
      LoadBalancer("frontend-router").flatMap(_.url)
    }

    routerUrl
      .map(fetchWithRouterUrl)
      .getOrElse(Future.successful(TestFailed("Can get Frontend router url")))

  }

  private def testOnLoadBalancer(
      thisLoadBalancer: LoadBalancer,
      testPath: String,
      id: String,
  ): Future[EndpointStatus] = {
    thisLoadBalancer.url
      .map { url =>
        httpGet(s"Can fetch directly from ${thisLoadBalancer.name} load balancer", s"http://$url$testPath")
      }
      .getOrElse(Future(TestFailed(s"Can get ${thisLoadBalancer.name}'s loadbalancer url")))
  }

  private def testOnContentApi(testPath: String, id: String): Future[EndpointStatus] = {
    val testName = "Can fetch directly from Content API"
    val request = contentApi.item(testPath, "UK").showFields("all")
    contentApi
      .getResponse(request)
      .map { response =>
        if (response.status == "ok") {
          TestPassed(testName)
        } else {
          TestFailed(testName, request.toString)
        }
      }
      .recoverWith {
        case t: Throwable => Future.successful(TestFailed("Direct to content api", t.getMessage, request.toString))
      }
  }

  private def testOnPreviewContentApi(testPath: String, id: String): Future[EndpointStatus] = {
    val testName = "Can fetch directly from Preview Content API"
    val request = previewContentApi.item(testPath, "UK").showFields("all")
    previewContentApi
      .getResponse(request)
      .map { response =>
        if (response.status == "ok") {
          TestPassed(testName)
        } else {
          TestFailed(testName, request.toString)
        }
      }
      .recoverWith {
        case t: Throwable =>
          Future.successful(TestFailed("Direct to Preview Content API", t.getMessage, request.toString))
      }
  }

  private def testOnGuardianSite(testPath: String, id: String): Future[EndpointStatus] = {
    httpGet("Can fetch from www.theguardian.com", s"https://www.theguardian.com$testPath")
  }

  private def testOnPreviewSite(testPath: String, id: String): Future[EndpointStatus] = {
    httpGet(
      "Can fetch from preview.gutools.co.uk",
      s"https://preview.gutools.co.uk$testPath",
      Some("preview.gutools.co.uk"),
    )
  }

  private def httpGet(testName: String, url: String, virtualHost: Option[String] = Some("www.theguardian.com")) = {
    wsClient
      .url(url)
      .withVirtualHost(virtualHost.getOrElse(""))
      .withRequestTimeout(5.seconds)
      .get()
      .map { response =>
        if (response.status == 200) {
          TestPassed(testName)
        } else {
          TestFailed(testName, s"Status: ${response.status}", url)
        }
      }
      .recoverWith {
        case t: Throwable => Future.successful(TestFailed(testName, t.getMessage, url))
      }
  }
}
