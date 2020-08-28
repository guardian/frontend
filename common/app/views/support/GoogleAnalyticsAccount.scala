package views.support

import conf.Configuration.environment
import model.ApplicationContext

object GoogleAnalyticsAccount {

  // NOTE that the 'samples rates' when set to 0, seem to be 100%
  case class Tracker(
      trackingId: String,
      trackerName: String,
      samplePercentage: Int = 100,
      siteSpeedSamplePercentage: Double = 0.1,
  )

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

  private def useProdTracker(context: ApplicationContext) = environment.isProd && !context.isPreview

  def editorialTracker(context: ApplicationContext): Tracker =
    if (useProdTracker(context)) editorialProd else editorialTest

}
