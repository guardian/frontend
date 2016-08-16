package test

import java.io.File
import java.net.URI

import com.gargoylesoftware.htmlunit.html.HtmlPage
import com.gargoylesoftware.htmlunit.{BrowserVersion, Page, WebClient, WebResponse}
import common.{ExecutionContexts, Lazy}
import conf.Configuration
import contentapi.{ContentApiClient, Http}
import org.apache.commons.codec.digest.DigestUtils
import org.openqa.selenium.htmlunit.HtmlUnitDriver
import org.scalatest.BeforeAndAfterAll
import org.scalatestplus.play._
import play.api._
import play.api.libs.ws.WSClient
import play.api.libs.ws.ning.{NingWSClient, NingWSClientConfig}
import play.api.test._
import recorder.{HttpRecorder, ContentApiHttpRecorder}

import scala.util.{Failure, Success, Try}

trait TestSettings {
  val recorder = new ContentApiHttpRecorder {
    override lazy val baseDir = new File(System.getProperty("user.dir"), "data/database")
  }

  private def toRecorderHttp(http: Http) = new Http {

    val originalHttp = http

    override def GET(url: String, headers: Iterable[(String, String)]) = {
      val normalisedUrl = HttpRecorder.normalise("capi", url).replaceAll("api-key=[^&]*", "api-key=none")
      recorder.load(normalisedUrl, headers.toMap) {
        originalHttp.GET(url, headers)
      }
    }
  }

  ContentApiClient.thriftClient._http = toRecorderHttp(ContentApiClient.thriftClient._http)
  ContentApiClient.jsonClient._http = toRecorderHttp(ContentApiClient.jsonClient._http)
}

trait ConfiguredTestSuite extends ConfiguredServer with ConfiguredBrowser with ExecutionContexts {
  this: ConfiguredTestSuite with org.scalatest.Suite =>

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

  def withHost(path: String) = s"http://localhost:$port$path"

}

trait SingleServerSuite extends OneServerPerSuite with TestSettings with OneBrowserPerSuite with HtmlUnitFactory {
  this: SingleServerSuite with org.scalatest.Suite =>

  BrowserVersion.setDefault(BrowserVersion.CHROME)

  lazy val initialSettings: Map[String, AnyRef] = Map(
    ("application.secret", "this_is_not_a_real_secret_just_for_tests"),
    ("guardian.projectName", "test-project"),
    ("ws.compressionEnabled", Boolean.box(true)),
    ("ws.timeout.connection", "10000"), // when running healthchecks on a cold app it can time out
    ("ws.timeout.idle", "10000"),
    ("ws.timeout.request", "10000"))

  implicit override lazy val app: Application = {
    val environment = Environment(new File("."), this.getClass.getClassLoader, Mode.Test)
    val settings = Try(this.getClass.getClassLoader.loadClass("TestAppLoader")) match {
      case Success(clazz) => initialSettings + ("play.application.loader" -> "TestAppLoader")
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

trait WithTestWsClient {
  self: WithTestWsClient with BeforeAndAfterAll =>

  private val lazyWsClient = Lazy(NingWSClient(NingWSClientConfig(maxRequestRetry = 0)))
  lazy val wsClient: WSClient = lazyWsClient

  override def afterAll() = if(lazyWsClient.isDefined) lazyWsClient.close
}
