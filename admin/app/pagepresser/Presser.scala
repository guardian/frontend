package pagepresser

import common.Logging
import org.jsoup.Jsoup
import play.api.Play.current
import play.api.libs.concurrent.Execution.Implicits._
import play.api.libs.ws.WS
import services.{R2ArchiveOriginals, R2Archive}

object Presser extends Logging{

  def press(url: String) = {
    val request = WS.url(url)
    val path = request.uri.getPath

    request.get().map { response =>
      response.status match {
        case 200 => {


          val originalBody = response.body
          //R2ArchiveOriginals.putPublic(path, originalBody, "text/html")
          val cleanedHtml = HtmlCleaner.clean(Jsoup.parse(originalBody))
          //R2Archive.putPublic(path, cleanedHtml.toString, "text/html") //write switch to do this
        }
        case non200 => {
          log.error(s"Unexpected response from $url, status code: $non200")
        }
      }

    }
  }

}
