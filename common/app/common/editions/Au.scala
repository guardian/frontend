package common.editions

import org.joda.time.DateTimeZone
import model.{TrailblockDescription, MetaData}
import common.{Zones, Sections, Edition}

//This object exists to be used with ItemTrailblockDescription and is not a real edition like the others.
//All that is really being used is Edition.id, which is AU
//It is not included in the Edition.all sequence
object Au extends Edition("AU", "Australia edition", DateTimeZone.forID("Australia/Sydney")) with Sections with Zones {

  val zones = Nil

  def navigation(metadata: MetaData) = Nil

  val configuredFronts = Map.empty[String, Seq[TrailblockDescription]]
}
