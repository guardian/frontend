package pagepresser

import common.Logging
import conf.switches.Switches
import org.jsoup.Jsoup
import play.api.Play.current
import play.api.libs.concurrent.Execution.Implicits._
import play.api.libs.ws.WS
import services.{R2ArchiveOriginals, R2Archive}

object Presser extends Logging{

  def press(url: String) = {
    val request = WS.url(url)
    request.get().map { response =>
      response.status match {
        case 200 => {
          val originalBody = response.body
          val cleanedHtml = BasicHtmlCleaner.clean(Jsoup.parse(originalBody))

          if(Switches.r2PressToS3Switch.isSwitchedOn) {
            val path = request.uri.getPath
            R2ArchiveOriginals.putPublic(path, originalBody, "text/html")
            R2Archive.putPublic(path, cleanedHtml.toString, "text/html")
          }
        }
        case non200 => {
          log.error(s"Unexpected response from $url, status code: $non200")
        }
      }

    }
  }

}
