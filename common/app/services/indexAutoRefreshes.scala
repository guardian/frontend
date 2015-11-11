package services

import common.AutoRefresh
import model.TagIndexListings
import play.api.{Application, GlobalSettings}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration._
import scala.concurrent.{Future, blocking}
import scala.language.postfixOps

trait IndexListingsLifecycle extends GlobalSettings {
  override def onStart(app: Application): Unit = {
    super.onStart(app)

    KeywordSectionIndexAutoRefresh.start()
    KeywordAlphaIndexAutoRefresh.start()
    ContributorAlphaIndexAutoRefresh.start()
    NewspaperBookIndexAutoRefresh.start()
    NewspaperBookSectionIndexAutoRefresh.start()

  }
}

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

object NewspaperBookIndexAutoRefresh extends AutoRefresh[TagIndexListings](0 seconds, 5 minutes) {
  override protected def refresh(): Future[TagIndexListings] = Future {
    blocking {
      TagIndexesS3.getListingOrDie("newspaper_books")
    }
  }
}

object NewspaperBookSectionIndexAutoRefresh extends AutoRefresh[TagIndexListings](0 seconds, 5 minutes) {
  override protected def refresh(): Future[TagIndexListings] = Future {
    blocking {
      TagIndexesS3.getListingOrDie("newspaper_book_sections")
    }
  }
}
