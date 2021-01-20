package services

import akka.actor.ActorSystem
import app.LifecycleComponent
import common.AutoRefresh
import model.{TagDefinition, TagIndexListings}

import scala.concurrent.duration._
import scala.concurrent.{ExecutionContext, Future, blocking}
import scala.language.postfixOps

class NewspaperBooksAndSectionsAutoRefresh(
    newspaperBookSectionTagAgent: NewspaperBookSectionTagAgent,
    newspaperBookTagAgent: NewspaperBookTagAgent,
)(implicit actorSystem: ActorSystem, executionContext: ExecutionContext)
    extends LifecycleComponent {
  override def start(): Unit = {
    newspaperBookTagAgent.start()
    newspaperBookSectionTagAgent.start()
  }
}

trait NewspaperTags {
  val source: String
  def getTags(publication: String): Seq[TagDefinition] = {
    TagIndexesS3.getIndex(source, publication) match {
      case Right(tagPage) => tagPage.tags
      case _              => Seq.empty
    }
  }
}

class NewspaperBookTagAgent extends AutoRefresh[TagIndexListings](0 seconds, 5 minutes) with NewspaperTags {
  override val source = "newspaper_books"
  override protected def refresh()(implicit executionContext: ExecutionContext): Future[TagIndexListings] =
    Future {
      blocking {
        TagIndexesS3.getListingOrDie(source)
      }
    }
}

class NewspaperBookSectionTagAgent extends AutoRefresh[TagIndexListings](0 seconds, 5 minutes) with NewspaperTags {
  override val source = "newspaper_book_sections"
  override protected def refresh()(implicit executionContext: ExecutionContext): Future[TagIndexListings] =
    Future {
      blocking {
        TagIndexesS3.getListingOrDie(source)
      }
    }
}
