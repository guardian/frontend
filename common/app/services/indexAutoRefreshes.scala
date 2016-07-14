package services

import app.LifecycleComponent
import common.AutoRefresh
import model.TagIndexListings

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration._
import scala.concurrent.{Future, blocking}
import scala.language.postfixOps

class IndexListingsLifecycle extends LifecycleComponent {
  override def start(): Unit = {
    KeywordSectionIndexAutoRefresh.start()
    KeywordAlphaIndexAutoRefresh.start()
    ContributorAlphaIndexAutoRefresh.start()
  }
}
object IndexListingsLifecycle extends IndexListingsLifecycle

object KeywordSectionIndexAutoRefresh extends AutoRefresh[TagIndexListings](0 seconds, 5 minutes) {
  override protected def refresh(): Future[TagIndexListings] = Future {
    blocking {
      TagIndexesS3.getListingOrDie("keywords_by_section")
    }
  }
}

object KeywordAlphaIndexAutoRefresh extends AutoRefresh[TagIndexListings](0 seconds, 5 minutes) {
  override protected def refresh(): Future[TagIndexListings] = Future {
    blocking {
      TagIndexesS3.getListingOrDie("keywords")
    }
  }
}

object ContributorAlphaIndexAutoRefresh extends AutoRefresh[TagIndexListings](0 seconds, 5 minutes) {
  override protected def refresh(): Future[TagIndexListings] = Future {
    blocking {
      TagIndexesS3.getListingOrDie("contributors")
    }
  }
}
