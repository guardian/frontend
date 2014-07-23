package services

import common.AutoRefresh
import model.TagIndexListings

import scala.concurrent.{Future, blocking}
import scala.concurrent.duration._
import scala.concurrent.ExecutionContext.Implicits.global
import scala.language.postfixOps

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
