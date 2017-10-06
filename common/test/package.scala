package test

import java.io.File

import akka.actor.ActorSystem
import akka.stream.Materializer
import com.gargoylesoftware.htmlunit.html.HtmlPage
import com.gargoylesoftware.htmlunit.{BrowserVersion, Page, WebClient, WebResponse}
import common.{Lazy}
import contentapi.{CapiHttpClient, ContentApiClient, HttpClient, Response}
import model.{ApplicationContext, ApplicationIdentity}
import org.openqa.selenium.htmlunit.HtmlUnitDriver
import org.scalatest.{BeforeAndAfterAll, TestSuite}
import org.scalatestplus.play._
import org.scalatestplus.play.guice.GuiceOneServerPerSuite
import play.api._
import play.api.http.HttpConfiguration
import play.api.libs.crypto.{CSRFTokenSigner, CSRFTokenSignerProvider, CookieSigner, CookieSignerProvider}
import play.api.libs.ws.WSClient
import play.api.libs.ws.ahc.AhcWSClient
import play.api.test._
import play.filters.csrf.{CSRFAddToken, CSRFCheck, CSRFConfig}
import recorder.ContentApiHttpRecorder
import rendering.core.Renderer

import scala.concurrent.{ExecutionContext, Future}
import scala.util.{Failure, Success, Try}

trait ConfiguredTestSuite extends TestSuite with ConfiguredServer with ConfiguredBrowser {

  lazy val webClient = new WebClient(BrowserVersion.CHROME)
  lazy val host = s"http://localhost:$port"
  lazy val htmlUnitDriver = webDriver.asInstanceOf[HtmlUnitDriver]
  lazy val testBrowser = TestBrowser(webDriver, None)
  lazy val appId = "409128287"

  def apply[T](path: String)(block: TestBrowser => T): T = UK(path)(block)

  def UK[T](path: String)(block: TestBrowser => T): T = goTo(path)(block)

  def US[T](path: String)(block: TestBrowser => T): T = {
      val editionPath = if (path.contains("?")) s"$path&_edition=US" else s"$path?_edition=US"
      goTo(editionPath)(block)
  }

  def AU[T](path: String)(block: TestBrowser => T): T = {
    val editionPath = if (path.contains("?")) s"$path&_edition=AU" else s"$path?_edition=AU"
    goTo(editionPath)(block)
  }

  protected def goTo[T](path: String)(block: TestBrowser => T): T = {
      // http://stackoverflow.com/questions/7628243/intrincate-sites-using-htmlunit
      htmlUnitDriver.setJavascriptEnabled(false)
      testBrowser.goTo(host + path)
      block(testBrowser)
  }

  /**
  * `HTMLUnit` doesn't support [[org.fluentlenium.core.domain.FluentWebElement.html]]
  * via TestBrowser, so use [[WebClient]] to retrieve a [[WebResponse]] instead, so
  * we can use [[WebResponse.getContentAsString]]
   */
  protected def getContentString[T](path: String)(block: String => T): T = {
    webClient.getOptions.setJavaScriptEnabled(false)

    val page: HtmlPage = webClient.getPage(host + path)
    block(page.getWebResponse().getContentAsString)
  }

  def withHost(path: String): String = s"http://localhost:$port$path"

}

trait SingleServerSuite extends TestSuite with GuiceOneServerPerSuite with OneBrowserPerSuite with HtmlUnitFactory {

  BrowserVersion.setDefault(BrowserVersion.CHROME)

  lazy val initialSettings: Map[String, AnyRef] = Map(
    ("application.secret", "this_is_not_a_real_secret_just_for_tests"),
    ("guardian.projectName", "test-project"),
    ("ws.compressionEnabled", Boolean.box(true)),
    ("ws.timeout.connection", "10000"), // when running healthchecks on a cold app it can time out
    ("ws.timeout.idle", "10000"),
    ("ws.timeout.request", "10000"))

  implicit override lazy val app: Application = {
    val environment = Environment.simple()
    val settings = Try(this.getClass.getClassLoader.loadClass("TestAppLoader")) match {
      case Success(_) => initialSettings + ("play.application.loader" -> "TestAppLoader")
      case Failure(_) => initialSettings
    }
    val context = ApplicationLoader.createContext(
      environment = environment,
      initialSettings = settings
    )
    ApplicationLoader.apply(context).load(context)
  }

}

object TestRequest {
  // MOST of the time we do not care what path is set on the request - only need to override where we do
  def apply(path: String = "/does-not-matter"): FakeRequest[play.api.mvc.AnyContentAsEmpty.type] = {
    FakeRequest("GET", if (!path.startsWith("/")) s"/$path" else path)
  }
}

trait WithTestExecutionContext {
  implicit val testExecutionContext: ExecutionContext = scala.concurrent.ExecutionContext.Implicits.global
}

trait WithTestApplicationContext {
  implicit val testApplicationContext = ApplicationContext(Environment.simple(), ApplicationIdentity("tests"))
}

trait WithMaterializer {
  def app: Application
  implicit lazy val materializer: Materializer = app.materializer
}

trait WithTestWsClient {
  self: WithTestWsClient with BeforeAndAfterAll with WithMaterializer =>

  private val lazyWsClient = Lazy(AhcWSClient())
  lazy val wsClient: WSClient = lazyWsClient

  override def afterAll(): Unit = if(lazyWsClient.isDefined) lazyWsClient.close
}

trait WithTestContentApiClient extends WithTestExecutionContext {
  def wsClient: WSClient

  val httpRecorder = new ContentApiHttpRecorder {
    override lazy val baseDir = new File(System.getProperty("user.dir"), "data/database")
  }

  class recorderHttpClient(originalHttpClient: HttpClient) extends HttpClient {
    override def GET(url: String, headers: Iterable[(String, String)]): Future[Response] = {
      httpRecorder.load(url.replaceAll("api-key=[^&]*", "api-key=none"), headers.toMap) {
        originalHttpClient.GET(url, headers)
      }
    }
  }

  lazy val recorderHttpClient = new recorderHttpClient(new CapiHttpClient(wsClient))
  lazy val testContentApiClient = new ContentApiClient(recorderHttpClient)
}

trait WithTestCSRF {
  def app: Application
  val httpConfiguration: HttpConfiguration = HttpConfiguration.createWithDefaults()
  lazy val cookieSigner: CookieSigner = new CookieSignerProvider(httpConfiguration.secret).get
  lazy val csrfTokenSigner: CSRFTokenSigner = new CSRFTokenSignerProvider(cookieSigner).get
  lazy val csrfConfig: CSRFConfig = CSRFConfig.fromConfiguration(app.configuration)
  lazy val csrfAddToken = new CSRFAddToken(csrfConfig, csrfTokenSigner, httpConfiguration.session)
  lazy val csrfCheck = new CSRFCheck(csrfConfig, csrfTokenSigner, httpConfiguration.session)
}

trait WithTestRenderer {
  def testExecutionContext: ExecutionContext

  val testRenderer: Renderer = {
    new Renderer()(
      ActorSystem("TestRenderer"),
      testExecutionContext,
      ApplicationContext(Environment.simple(), ApplicationIdentity("TestRenderer"))
    )
  }
}
