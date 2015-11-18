package services

import common.AutoRefresh
import model.TagIndexListings
import play.api.{Application, GlobalSettings}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration._
import scala.concurrent.{Future, blocking}
import scala.language.postfixOps

trait NewspaperBooksAndSectionsAutoRefresh extends GlobalSettings {
  override def onStart(app: Application): Unit = {
    super.onStart(app)
    NewspaperBookTagAgent.start()
    NewspaperBookSectionTagAgent.start()
  }
}

trait NewspaperTags {
  val source: String
  def getTags(publication: String) = {
    TagIndexesS3.getIndex(source, publication) match {
      case Right(tagPage) => {
        tagPage.tags
      }
      case _ => Seq.empty
    }
  }
}

object NewspaperBookTagAgent extends AutoRefresh[TagIndexListings](0 seconds, 5 minutes) with NewspaperTags {
  override val source = "newspaper_books"
  override protected def refresh(): Future[TagIndexListings] = Future {
    blocking {
      TagIndexesS3.getListingOrDie(source)
    }
  }
}

object NewspaperBookSectionTagAgent extends AutoRefresh[TagIndexListings](0 seconds, 5 minutes) with NewspaperTags {
  override val source = "newspaper_book_sections"
  override protected def refresh(): Future[TagIndexListings] = Future {
    blocking {
      TagIndexesS3.getListingOrDie(source)
    }
  }
}
