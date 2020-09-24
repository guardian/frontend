package services

import akka.actor.ActorSystem
import app.LifecycleComponent
import common.AutoRefresh
import model.TagIndexListings

import scala.concurrent.duration._
import scala.concurrent.{ExecutionContext, Future, blocking}
import scala.language.postfixOps

class IndexListingsLifecycle(implicit actorSystem: ActorSystem, executionContext: ExecutionContext)
    extends LifecycleComponent {
  override def start(): Unit = {
    KeywordSectionIndexAutoRefresh.start()
    KeywordAlphaIndexAutoRefresh.start()
    ContributorAlphaIndexAutoRefresh.start()
  }
}

object KeywordSectionIndexAutoRefresh extends AutoRefresh[TagIndexListings](0 seconds, 5 minutes) {
  override protected def refresh()(implicit executionContext: ExecutionContext): Future[TagIndexListings] =
    Future {
      blocking {
        TagIndexesS3.getListingOrDie("keywords_by_section")
      }
    }
}

object KeywordAlphaIndexAutoRefresh extends AutoRefresh[TagIndexListings](0 seconds, 5 minutes) {
  override protected def refresh()(implicit executionContext: ExecutionContext): Future[TagIndexListings] =
    Future {
      blocking {
        TagIndexesS3.getListingOrDie("keywords")
      }
    }
}

object ContributorAlphaIndexAutoRefresh extends AutoRefresh[TagIndexListings](0 seconds, 5 minutes) {
  override protected def refresh()(implicit executionContext: ExecutionContext): Future[TagIndexListings] =
    Future {
      blocking {
        TagIndexesS3.getListingOrDie("contributors")
      }
    }
}
