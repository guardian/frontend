package test

import conf.{ElasticSearchContentApi, Configuration, ContentApi}
import java.net.URLEncoder
import play.api.test._
import play.api.test.Helpers._
import org.openqa.selenium.htmlunit.HtmlUnitDriver
import java.net.{ HttpURLConnection, URL }
import java.io.File
import com.gu.openplatform.contentapi.connection.Http
import recorder.ContentApiHttpRecorder
import com.gu.management.play.InternalManagementPlugin
import play.api.GlobalSettings
import concurrent.Future
import org.apache.commons.codec.digest.DigestUtils
import com.gargoylesoftware.htmlunit.BrowserVersion

trait TestSettings {
  def globalSettingsOverride: Option[GlobalSettings] = None
  def testPlugins: Seq[String] = Nil
  def disabledPlugins: Seq[String] = Seq(
    classOf[InternalManagementPlugin].getName,
    "conf.SwitchBoardPlugin"
  )

  val recorder = new ContentApiHttpRecorder {
    override lazy val baseDir = new File(System.getProperty("user.dir"), "data/database")
  }

  private def verify(property: String, hash: String, message: String) {
    if (DigestUtils.sha256Hex(property) != hash) {

      // the println makes it easier to spot what is wrong in tests
      println()
      println(s"----------- $message -----------")
      println()

      throw new RuntimeException(message)
    }

  }

  private def toRecorderHttp(http: Http[Future]) = new Http[Future] {

    val originalHttp = http

    verify(
      Configuration.contentApi.host,
      "b9648d72721756bad977220f11d5c239e17cb5ca34bb346de506f9b145ac39d1",
      "YOU ARE NOT USING THE CORRECT CONTENT API HOST"
    )

    verify(
      Configuration.contentApi.elasticSearchHost,
      "973dff7baa408e6f2334e3cf4ca36a960f1743b6d09911ff68723db9cbe62163",
      "YOU ARE NOT USING THE CORRECT ELASTIC SEARCH CONTENT API HOST"
    )

    verify(
      Configuration.contentApi.key,
      "a4eb3e728596c7d6ba43e3885c80afcb16bc24d22fc0215409392bac242bed96",
      "YOU ARE NOT USING THE CORRECT CONTENT API KEY"
    )

    override def GET(url: String, headers: scala.Iterable[scala.Tuple2[java.lang.String, java.lang.String]]) = {
      recorder.load(url, headers.toMap) {
        originalHttp.GET(url, headers)
      }
    }
  }

  ContentApi.http = toRecorderHttp(ContentApi.http)
  ElasticSearchContentApi.http = toRecorderHttp(ElasticSearchContentApi.http)
}

/**
 * Executes a block of code in a running server, with a test HtmlUnit browser.
 */
class EditionalisedHtmlUnit extends TestSettings {

  // the default is I.E 7 which we do not support
  BrowserVersion.setDefault(BrowserVersion.CHROME)

  val host = "http://localhost:9000"


  val Port = """.*:(\d*)$""".r

  def apply[T](path: String)(block: TestBrowser => T): T = UK(path)(block)

  def UK[T](path: String)(block: TestBrowser => T): T = goTo(path, host)(block)

  def US[T](path: String)(block: TestBrowser => T): T = {
    val editionPath = if (path.contains("?")) s"$path&_edition=US" else s"$path?_edition=US"
    goTo(editionPath, host)(block)
  }

  private def testConnection(url: String): Boolean = {

    // Check that the test server is accepting connections.
    val connection = (new URL(url)).openConnection.asInstanceOf[HttpURLConnection]
    try {
      connection.connect
      assert(HttpURLConnection.HTTP_OK == connection.getResponseCode, s"Invalid response: ${connection.getResponseCode}")
      return true
    }
    finally {
      connection.disconnect
    }
    return false
  }

  protected def goTo[T](path: String, host: String)(block: TestBrowser => T): T = {

    val port = host match {
      case Port(p) => p.toInt
      case _ => 9000
    }

    running(TestServer(port,
      FakeApplication(additionalPlugins = testPlugins, withoutPlugins = disabledPlugins,
                      withGlobal = globalSettingsOverride)), HTMLUNIT) { browser =>

      // A test to check that the TestServer started by running() is accepting connections.
      val start = System.currentTimeMillis()
      while (!testConnection(host + path) && (System.currentTimeMillis - start < 10000)) {
        println("Waiting for test server to accept connections...")
        Thread.sleep(2000)
      }

      // http://stackoverflow.com/questions/7628243/intrincate-sites-using-htmlunit
      browser.webDriver.asInstanceOf[HtmlUnitDriver].setJavascriptEnabled(false)

      browser.goTo(host + path)
      block(browser)
    }
  }
}

object WithHost {
  def apply(path: String): String = UK(path)
  def UK(path: String): String = s"http://localhost:9000$path"
  def US(path: String): String = s"http://127.0.0.1:9000$path"
}

object DesktopVersionLink {
  def apply(path: String) = s"http://localhost:9000/preference/platform/desktop?page=${URLEncoder.encode(s"$path?view=desktop", "UTF-8")}"
}

/**
 * Executes a block of code in a FakeApplication.
 */
trait FakeApp extends TestSettings {

  def apply[T](block: => T): T = running(
    FakeApplication(
      withoutPlugins = disabledPlugins,
      withGlobal = globalSettingsOverride,
      additionalPlugins = testPlugins
    )
  ) { block }
}

object TestRequest {
  def apply(path: String): FakeRequest[play.api.mvc.AnyContentAsEmpty.type] = {
    FakeRequest("GET", path)
  }
}