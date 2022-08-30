package test

import java.io.File
import java.net.URL
import akka.stream.Materializer
import com.gargoylesoftware.htmlunit.html.HtmlPage
import com.gargoylesoftware.htmlunit.{BrowserVersion, WebClient}
import common.Lazy
import concurrent.BlockingOperations
import contentapi._
import model.{ApplicationContext, ApplicationIdentity, PressedPage, PressedPageType}
import org.openqa.selenium.htmlunit.HtmlUnitDriver
import org.scalatest.{BeforeAndAfterAll, TestSuite}
import org.scalatestplus.play._
import org.scalatestplus.play.guice.GuiceOneServerPerSuite
import play.api._
import play.api.http.HttpConfiguration
import play.api.libs.crypto.{CSRFTokenSigner, CSRFTokenSignerProvider, CookieSigner, CookieSignerProvider}
import play.api.libs.json.Json
import play.api.libs.ws.WSClient
import play.api.libs.ws.ahc.AhcWSClient
import play.api.test._
import play.filters.csrf.{CSRFAddToken, CSRFCheck, CSRFConfig}
import recorder.{ContentApiHttpRecorder, HttpRecorder}
import services.fronts.FrontJsonFapiLive

import scala.concurrent.{ExecutionContext, Future}
import scala.io.Codec.UTF8
import scala.util.{Failure, Success, Try}

import akka.actor.ActorSystem

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

  def ignoringHost(path: String): String = new URL(path).getPath()
}

trait SingleServerSuite extends TestSuite with GuiceOneServerPerSuite with OneBrowserPerSuite with HtmlUnitFactory {

  // Fixes `Failed to listen for HTTP on /0.0.0.0:19001`
  System.setProperty("testserver.port", "0")

  BrowserVersion.setDefault(BrowserVersion.CHROME)

  lazy val settings: Map[String, AnyRef] = Map(
    ("application.secret", "this_is_not_a_real_secret_just_for_tests"),
    ("guardian.projectName", "test-project"),
    ("ws.compressionEnabled", Boolean.box(true)),
    ("ws.timeout.connection", "10000"), // when running healthchecks on a cold app it can time out
    ("ws.timeout.idle", "10000"),
    ("ws.timeout.request", "10000"),
  )

  implicit override lazy val app: Application = {
    val environment = Environment.simple()
    val settings2 = Try(this.getClass.getClassLoader.loadClass("TestAppLoader")) match {
      case Success(_) => settings + ("play.application.loader" -> "TestAppLoader")
      case Failure(_) => settings
    }
    val context = ApplicationLoader.Context.create(
      environment = environment,
      initialSettings = settings2,
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

  override def afterAll(): Unit = if (lazyWsClient.isDefined) lazyWsClient.close
}

trait WithTestContentApiClient extends WithTestExecutionContext {
  def wsClient: WSClient

  val httpRecorder = new ContentApiHttpRecorder {
    override lazy val baseDir = new File(System.getProperty("user.dir"), "data/database")
  }

  class recorderHttpClient(originalHttpClient: HttpClient) extends HttpClient {
    override def GET(url: String, headers: Iterable[(String, String)]): Future[Response] = {
      httpRecorder.load(url.replaceAll("api-key=[^&]*", "api-key=none"), headers.toMap - "User-Agent") {
        originalHttpClient.GET(url, headers)
      }
    }
  }

  lazy val recorderHttpClient = new recorderHttpClient(new CapiHttpClient(wsClient))
  lazy val previewRecorderHttpClient = new recorderHttpClient(new CapiHttpClient(wsClient) {
    override val signer = Some(PreviewSigner())
  })

  lazy val testContentApiClient = new ContentApiClient(recorderHttpClient)
  lazy val testPreviewContentApiClient = new PreviewContentApi(previewRecorderHttpClient)
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

trait WithTestFrontJsonFapi {

  // need a front api that stores S3 locally so it can run without deps in the unit tests
  class TestFrontJsonFapi(override val blockingOperations: BlockingOperations)
      extends FrontJsonFapiLive(blockingOperations) {

    override def get(path: String, pageType: PressedPageType)(implicit
        executionContext: ExecutionContext,
    ): Future[Option[PressedPage]] = {
      recorder.load(path, Map()) {
        super.get(path, pageType)
      }
    }

    val recorder = new HttpRecorder[Option[PressedPage]] {
      override lazy val baseDir = new File(System.getProperty("user.dir"), "data/pressedPage")

      //No transformation for now as we only store content that's there.
      override def toResponse(b: Array[Byte]): Option[PressedPage] =
        Json.parse(new String(b, UTF8.charSet)).asOpt[PressedPage]

      override def fromResponse(maybeResponse: Option[PressedPage]): Array[Byte] = {
        val response = maybeResponse getOrElse {
          throw new RuntimeException("seeing None.get locally? make sure you have S3 credentials")
        }
        Json.stringify(Json.toJson(response)).getBytes(UTF8.charSet)
      }
    }
  }

  lazy val actorSystem = ActorSystem()
  lazy val blockingOperations = new BlockingOperations(actorSystem)
  lazy val fapi = new TestFrontJsonFapi(blockingOperations)
}
