package pagepresser

import java.io.{File, PrintWriter}

import common.Logging
import org.jsoup.Jsoup
import play.api.Play.current
import play.api.libs.concurrent.Execution.Implicits._
import play.api.libs.ws.WS
import services.{R2TemporaryArchiveForTesting, S3}

object Presser extends Logging{

  def press(url: String, outputLocation: String) = {
    WS.url(url).get().map { response =>
      response.status match {
        case 200 => {
          val cleanedHtml = HtmlCleaner.clean(Jsoup.parse(response.body))
          R2TemporaryArchiveForTesting.putPublic(outputLocation, cleanedHtml.toString, "text/html")
        }
        case non200 => {
          log.error(s"Unexpected response from $url, status code: $non200")
        }
      }

    }
  }

}
