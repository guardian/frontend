package dfp

import com.google.api.ads.admanager.axis.v202011._
import common.GuLogging
import org.joda.time.{DateTime => JodaDateTime, DateTimeZone}

private[dfp] object ApiHelper extends GuLogging {

  def isPageSkin(dfpLineItem: LineItem): Boolean = {
    def hasA1x1Pixel(placeholders: Array[CreativePlaceholder]): Boolean = {
      placeholders.exists {
        _.getCompanions.exists { companion =>
          val size = companion.getSize
          size.getWidth == 1 && size.getHeight == 1
        }
      }
    }
    (dfpLineItem.getRoadblockingType == RoadblockingType.CREATIVE_SET) &&
    hasA1x1Pixel(dfpLineItem.getCreativePlaceholders)
  }

  def toSeq[A](as: Array[A]): Seq[A] = Option(as) map (_.toSeq) getOrElse Nil

  //noinspection IfElseToOption
  def optJavaInt(i: java.lang.Integer): Option[Int] = if (i == null) None else Some(i)
}
