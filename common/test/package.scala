package test

import conf.{Configuration, ContentApi}
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

  val originalHttp = ContentApi.http

  ContentApi.http = new Http[Future] {

    if (DigestUtils.sha256Hex(Configuration.contentApi.host) != "b9648d72721756bad977220f11d5c239e17cb5ca34bb346de506f9b145ac39d1") {

      // the println makes it easier to spot what is wrong in tests
      println()
      println("----------- YOU ARE NOT USING THE CORRECT CONTENT API HOST -----------")
      println()

      throw new RuntimeException("You are not using the correct content api host...")
    }

    if (DigestUtils.sha256Hex(Configuration.contentApi.key) != "a4eb3e728596c7d6ba43e3885c80afcb16bc24d22fc0215409392bac242bed96") {

      // the println makes it easier to spot what is wrong in tests
      println()
      println("----------- YOU ARE NOT USING THE CORRECT CONTENT API KEY -----------")
      println()

      throw new RuntimeException("You are not using the correct content api key...")
    }

    override def GET(url: String, headers: scala.Iterable[scala.Tuple2[java.lang.String, java.lang.String]]) = {
      recorder.load(url, headers.toMap) {
        originalHttp.GET(url, headers)
      }
    }
  }
}

/**
 * Executes a block of code in a running server, with a test HtmlUnit browser.
 */
class EditionalisedHtmlUnit extends TestSettings {

  // the default is I.E 7 which we do not support
  BrowserVersion.setDefault(BrowserVersion.FIREFOX_3_6)

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
  def apply(): FakeRequest[play.api.mvc.AnyContentAsEmpty.type] = {
    TestRequest("localhost:9000")
  }

  def apply(host: String): FakeRequest[play.api.mvc.AnyContentAsEmpty.type] = {
    FakeRequest().withHeaders("host" -> host)
  }
}