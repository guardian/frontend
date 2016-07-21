package views.support

import conf.Configuration.environment

object GoogleAnalyticsAccount {

  case class Tracker(trackingId: String, trackerName: String)

  // The "All editorial" property in the main GA account ("GNM Universal")
  val editorialProd = Tracker("UA-78705427-1", "allEditorialPropertyTracker")

  // The "Guardian Test" property in the "Guardian Test" account.
  // I recommend using this until you're sure your GA events are working as intended,
  // to avoid polling the production GA property with incorrect data.
  val editorialTest = Tracker("UA-33592456-1", "guardianTestPropertyTracker")

  // Dedicated property just for header bidding events
  val headerBidding = Tracker("UA-78705427-6", "headerBiddingPropertyTracker")

  private val useProdTracker = environment.isProd && !environment.isPreview

  val editorialTracker: Tracker = if (useProdTracker) editorialProd else editorialTest

}
