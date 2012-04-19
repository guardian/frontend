package conf

import com.gu.conf.ConfigurationFactory
import com.gu.management.{Switchable, TimingMetric, Healthcheck}
import play.api.Logger

object `package` {
  implicit def string2ToIntOption(s: String) = new {
    lazy val toIntOption: Option[Int] = try {
      Some(s.toInt)
    } catch {
      case _ => None
    }
  }
}

object Configuration {

  private val configuration = ConfigurationFactory.getConfiguration("frontend-article", webappConfDirectory = "env")

  object plugins {
    lazy val location = configuration.getStringProperty("plugins.location").getOrElse {
      throw new IllegalStateException("Plugins Location not configured")
    }
  }

  object contentApi {
    lazy val host = configuration.getStringProperty("content.api.host") getOrElse {
      throw new IllegalStateException("Content Api Host not configured")
    }

    lazy val key = configuration.getStringProperty("content.api.key") getOrElse {
      throw new IllegalStateException("Content Api Key not configured")
    }
  }

  object proxy {
    lazy val isDefined: Boolean = hostOption.isDefined && portOption.isDefined

    private lazy val hostOption = Option(System.getProperty("http.proxyHost"))
    private lazy val portOption = Option(System.getProperty("http.proxyPort")) flatMap { _.toIntOption }

    lazy val host: String = hostOption getOrElse {
      throw new IllegalStateException("HTTP proxy host not configured")
    }

    lazy val port: Int = portOption getOrElse {
      throw new IllegalStateException("HTTP proxy port not configured")
    }
  }

  override def toString(): String = configuration.toString
}

object Switches {
  //  val switch = new DefaultSwitch("name", "Description Text")
  val all: Seq[Switchable] = List(Healthcheck.switch)
}

object Metrics {
  //  val metric = new TimingMetric("frontend-article", "name", "title", "Description Text")
  val all: Seq[TimingMetric] = Nil
}

