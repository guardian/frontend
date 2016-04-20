package dfp

import com.google.api.ads.dfp.axis.v201508._
import common.Logging
import org.joda.time.{DateTime => JodaDateTime, DateTimeZone}

private[dfp] object ApiHelper extends Logging {

  def isPageSkin(dfpLineItem: LineItem) = {

    def hasA1x1Pixel(placeholders: Array[CreativePlaceholder]): Boolean = {
      placeholders.exists {
        _.getCompanions.exists { companion =>
          val size = companion.getSize
          size.getWidth == 1 && size.getHeight == 1
        }
      }
    }

    dfpLineItem.getRoadblockingType == RoadblockingType.CREATIVE_SET &&
      hasA1x1Pixel(dfpLineItem.getCreativePlaceholders)
  }

  def toJodaTime(time: DateTime): JodaDateTime = {
    val date = time.getDate
    new JodaDateTime(
      date.getYear,
      date.getMonth,
      date.getDay,
      time.getHour,
      time.getMinute,
      time.getSecond,
      DateTimeZone.forID(time.getTimeZoneID)
    )
  }

  def toSeq[A](as: Array[A]): Seq[A] = Option(as) map (_.toSeq) getOrElse Nil

  //noinspection IfElseToOption
  def optJavaInt(i: java.lang.Integer): Option[Int] = if (i == null) None else Some(i)
}
