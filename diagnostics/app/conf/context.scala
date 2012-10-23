package conf

import common._
import play.api.libs.concurrent.Promise
import play.api.libs.ws.WS
import com.gu.conf.ConfigurationFactory
import com.gu.management.{ Manifest => ManifestFile }
import com.gu.management._
import com.gu.management.logback.LogbackLevelPage

class GuardianConfiguration

object Configuration {
  val application: String = "frontend-diagnostics"

  protected val configuration = ConfigurationFactory.getConfiguration(application, "env")

  object healthcheck {
    lazy val properties = configuration.getPropertyNames filter {
      _ matches """test\..*\.url"""
    }

    lazy val urls = properties map { property =>
      configuration.getStringProperty(property).get
    }
  }

  override def toString(): String = configuration.toString
}

object ManifestData {
  lazy val build = ManifestFile.asKeyValuePairs.getOrElse("Build", "DEV").dequote.trim
}

class UrlPagesHealthcheckManagementPage(val urls: List[String]) extends ManagementPage {
  val path = "/management/healthcheck"

  def get(req: HttpRequest) = {
    val checks = urls map { url =>
      WS.url(url).get() map { response => url -> response }
    }

    val sequenced = Promise sequence checks // List[Promise[...]] -> Promise[List[...]]
    val failed = sequenced map { _ filter { _._2.status / 100 != 2 } }

    failed.await.get match {
      case List() => PlainTextResponse("OK")
      case failures =>
        val message = failures map {
          case (url, response) =>
            "FAIL: %s (%s)" format (url, response.status)
        }
        ErrorResponse(503, message mkString "\n")
    }
  }
}

object Management extends com.gu.management.play.Management {
  val applicationName = Configuration.application

  lazy val pages = List(
    new ManifestPage,
    new UrlPagesHealthcheckManagementPage(Configuration.healthcheck.urls.toList),
    new PropertiesPage(Configuration.toString),
    new LogbackLevelPage(applicationName)
  )
}
