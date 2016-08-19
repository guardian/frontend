package views.support

import conf.Configuration.environment

object GoogleAnalyticsAccount {

  case class Tracker(trackingId: String, trackerName: String, samplePercentage: Int = 100)

  // The "All editorial" property in the main GA account ("GNM Universal")
  val editorialProd = Tracker("UA-78705427-1", "allEditorialPropertyTracker")

  /*
  The "Guardian Test" property in the "Guardian Test" account.
  I recommend using this until you're sure your GA events are working as intended,
  to avoid polling the production GA property with incorrect data.

  Sample rate is set to 5% so we don't send too many events to the test tracker.
  Sending too many events risks bumping us into a higher tier and costing us money.
  */
  val editorialTest = Tracker("UA-33592456-1", "guardianTestPropertyTracker", 5)

  // Dedicated property just for header bidding events
  val headerBidding = Tracker("UA-78705427-6", "headerBiddingPropertyTracker")

  private val useProdTracker = environment.isProd && !environment.isPreview

  val editorialTracker: Tracker = if (useProdTracker) editorialProd else editorialTest

}
