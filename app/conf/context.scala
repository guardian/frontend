package conf

import com.gu.conf.ConfigurationFactory
import com.gu.openplatform.contentapi.connection.MultiThreadedApacheHttpClient
import com.gu.openplatform.contentapi.model.Content
import com.gu.openplatform.contentapi.{ ApiError, Api }
import content.Article
import play.api.Logger

object `package` extends Logging {
  implicit def content2IsArticle(content: Content) = new {
    lazy val isArticle = content.tags.exists(_.id == "type/article")
  }

  implicit def string2ToIntOption(s: String) = new {
    lazy val toIntOption: Option[Int] = try {
      Some(s.toInt)
    } catch {
      case _ => None
    }
  }

  def suppressApi404(block: => Option[Article]) = {
    try {
      block
    } catch {
      case ApiError(404, _) =>
        log.info("Got a 404 while calling content api")
        None
    }
  }
}

object Configuration {

  private val configuration = ConfigurationFactory getConfiguration "frontend-article"

  object contentApi {
    lazy val host = configuration.getStringProperty("content.api.host") getOrElse {
      throw new IllegalStateException("Content Api Host not configured")
    }

    lazy val key = configuration.getStringProperty("content.api.key") getOrElse {
      throw new IllegalStateException("Content Api Key not configured")
    }
  }

  object proxy {
    lazy val isDefined = hostOption.isDefined && portOption.isDefined

    private lazy val hostOption = Option(System.getProperty("http.proxyHost"))
    private lazy val portOption = Option(System.getProperty("http.proxyPort")) flatMap { _.toIntOption }

    lazy val host = hostOption.get
    lazy val port = portOption.get
  }
}

object ContentApi extends Api with MultiThreadedApacheHttpClient with Logging {
  import Configuration._

  override val targetUrl = contentApi.host
  apiKey = Some(contentApi.key)

  maxConnections(1000)

  def setProxy(host: String, port: Int) {
    httpClient.getHostConfiguration.setProxy(host, port)
  }

  if (proxy.isDefined) {
    log.info("Setting HTTP proxy to: %s:%s".format(proxy.host, proxy.port))
    setProxy(proxy.host, proxy.port)
  }

  override protected def fetch(url: String, parameters: Map[String, Any]) = {
    super.fetch(url, parameters + ("user-tier" -> "internal"))
  }
}

trait Logging {
  val log = Logger(getClass)
}
