import com.gu.crosswords.api.client.models.{Entry, Across, Down}
import com.gu.crosswords.api.client.{Response, ApiClient, Http}
import common.ExecutionContexts
import conf.Configuration
import play.api.Play.current
import play.api.libs.ws.WS

import scala.concurrent.Future

package object crosswords extends ExecutionContexts {
  val maybeApi = Configuration.crosswords.apiKey map { key =>
    ApiClient(key, new Http {
      override def get(uri: String): Future[Response] = WS.url(uri).get map { wsResponse =>
        Response(wsResponse.status, wsResponse.statusText, wsResponse.body)
      }
    })
  }

  implicit class RichEntry(crosswordEntry: Entry) {
    def allPositions = (0 until crosswordEntry.length).toList map { i =>
      crosswordEntry.direction match {
        case Across => crosswordEntry.position.copy(x = crosswordEntry.position.x + i)
        case Down => crosswordEntry.position.copy(y = crosswordEntry.position.y + i)
      }
    }
  }
}
