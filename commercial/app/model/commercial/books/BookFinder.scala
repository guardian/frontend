package model.commercial.books

import common.{AkkaAgent, ExecutionContexts, Logging}
import conf.Configuration
import play.api.Play.current
import play.api.libs.json._
import play.api.libs.oauth.{ConsumerKey, OAuthCalculator, RequestToken}
import play.api.libs.ws.WS

import scala.concurrent.Future

object BookFinder extends ExecutionContexts {

  private lazy val agent = AkkaAgent[Map[String, Book]](Map.empty[String, Book])

  def findByIsbn(isbn: String): Future[Option[Book]] = {
    val book = agent.get().get(isbn)
    if (book.isDefined) {
      Future.successful(book)
    } else {
      MagentoService.findByIsbn(isbn) map {
        _ map { foundBook =>
          agent.send { books => books + (isbn -> foundBook)}
          foundBook
        }
      }
    }
  }
}


object MagentoService extends ExecutionContexts with Logging {

  private case class MagentoProperties(oauth: OAuthCalculator, urlPrefix: String)

  private val magentoProperties = {
    for {
      domain <- Configuration.commercial.magento.domain
      path <- Configuration.commercial.magento.isbnLookupPath
      consumerKey <- Configuration.commercial.magento.consumerKey
      consumerSecret <- Configuration.commercial.magento.consumerSecret
      token <- Configuration.commercial.magento.accessToken
      tokenSecret <- Configuration.commercial.magento.accessTokenSecret
    } yield MagentoProperties(
      oauth = OAuthCalculator(
        consumerKey = ConsumerKey(consumerKey, consumerSecret),
        token = RequestToken(token, tokenSecret)
      ),
      urlPrefix = s"http://$domain/$path"
    )
  }

  def findByIsbn(isbn: String): Future[Option[Book]] = {

    val result = magentoProperties map { props =>
      val url = s"${props.urlPrefix}/$isbn"
      val futureResponse = WS.url(url)
        .sign(props.oauth)
        .withRequestTimeout(5000)
        .get()

      futureResponse map { response =>
        if (response.status == 200 || response.status == 404) {
          val json = response.json
          json.validate[Book] match {
            case JsError(e) =>
              MagentoException(json) match {
                case Some(me) if me.code == 404 => log.warn(s"MagentoService could not find isbn $isbn")
                case Some(me) => log.error(s"MagentoService failed to get $url: ${me.code}: ${me.message}")
                case None => log.error(s"MagentoService failed to parse $url: ${JsError.toFlatJson(e).toString()}")
              }
              None
            case JsSuccess(book, _) => Some(book)
          }
        } else {
          log.error(s"MagentoService failed to get $url: ${response.status}: ${response.statusText}")
          None
        }
      } recover {
        case e: Exception =>
          log.error(s"MagentoService failed to get $url: ${e.getMessage}")
          None
      }
    }

    result getOrElse {
      log.warn("MagentoService is not configured")
      Future.successful(None)
    }
  }
}
