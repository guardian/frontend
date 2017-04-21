package model.merchandise.books

import akka.actor.{Actor, Props}
import commercial.model.merchandise.books.MagentoService
import common.Logging
import play.api.libs.json.JsValue

import scala.concurrent.ExecutionContext

class BookJsonActor(magentoService: MagentoService) extends Actor with Logging {

  implicit val ec: ExecutionContext = context.system.dispatcher

  private val bookCache = scala.collection.mutable.Map[String, JsValue]()
  private val bookCacheJobs = scala.collection.mutable.Set[String]()

  def receive: PartialFunction[Any, Unit] = {

    case isbn: String => {

      val cachedBook: Option[JsValue] = bookCache.get(isbn)

      cachedBook match {
        case Some(json) => {
          log.info(s"Cache hit for ISBN: $isbn.")
          sender() ! Some(json)
        }
        case None => {
          log.info(s"Cache miss for ISBN: $isbn.")

          if (bookCacheJobs.contains(isbn))
            log.info(s"ISBN lookup is already due for $isbn. Not running Magento Service.")
          else {
            log.info(s"Looking up ISBN $isbn with Magento Service.")
            magentoService.findByIsbn(isbn) map (_.foreach { json: JsValue => bookCache.put(isbn, json) })
            bookCacheJobs += isbn
          }
          sender() ! None
        }
      }
    }
  }
}

object BookJsonActor {

  def props(magentoService: MagentoService) = Props(classOf[BookJsonActor], magentoService)
}
