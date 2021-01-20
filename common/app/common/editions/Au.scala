package common.editions

import java.util.Locale
import org.joda.time.DateTimeZone
import common._

//This object exists to be used with ItemTrailblockDescription and is not a real edition like the others.
//All that is really being used is Edition.id, which is AU
//It is not included in the Edition.all sequence
object Au
    extends Edition(
      id = "AU",
      displayName = "Australia edition",
      DateTimeZone.forID("Australia/Sydney"),
      locale = Locale.forLanguageTag("en-au"),
      networkFrontId = "au",
    ) {

  implicit val AU = Au
}
