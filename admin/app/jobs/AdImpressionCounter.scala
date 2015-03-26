package jobs

import common.{ExecutionContexts, Logging}
import conf.Configuration.environment
import conf.Switches.MetricsSwitch
import layout.{Breakpoint, Desktop, Mobile, Tablet}
import model.commercial._
import model.diagnostics.CloudWatch
import model.{ArticleType, ContentType, SectionFrontType}
import services.OphanApi

import scala.concurrent.Future
import scala.util.control.NonFatal

object AdImpressionCounter extends ExecutionContexts with Logging {

  def count(): Unit = {

    def count(breakpoint: Breakpoint,
              adSlot: AdSlot,
              country: String,
              contentType: ContentType): Future[(String, Int)] = {
      val key = s"ads-$adSlot-$contentType-$breakpoint-$country"
      val eventualCount = OphanApi.getAdImpressionCount(adSlot, breakpoint, country, contentType)
      eventualCount onFailure {
        case NonFatal(e) => log.error(s"Count of $key failed: ${e.getMessage}")
      }
      eventualCount map (count => key -> count)
    }

    def sendToCloudWatch(counts: Map[String, Int]): Unit = {
      val normalizedCounts = counts map {
        case (key, count) => (key, count.toDouble)
      }
      normalizedCounts.grouped(10) foreach { batch =>
        try {
          CloudWatch.put("Commercial", batch)
        } catch {
          case e: Exception =>
            log.error(
              s"Failed to write batch of ad impression counts to Cloudwatch: ${e.getMessage}"
            )
        }
      }
    }

    if (environment.isProd || MetricsSwitch.isSwitchedOn) {

      val countriesToMonitor = Seq("gb", "us", "au")

      def zipWithCountries(breakpoint: Breakpoint, adSlot: AdSlot, contentType: ContentType) = {
        countriesToMonitor map ((breakpoint, adSlot, _, contentType))
      }

      val desktopSlots = {
        def desktopSlots(contentType: ContentType, adSlot: AdSlot) = {
          zipWithCountries(Desktop, adSlot, contentType)
        }
        desktopSlots(ArticleType, TopAboveNav) ++
          desktopSlots(ArticleType, Right) ++
          desktopSlots(ArticleType, Inline1) ++
          desktopSlots(ArticleType, Inline3) ++
          desktopSlots(SectionFrontType, TopAboveNav) ++
          desktopSlots(SectionFrontType, Inline1) ++
          desktopSlots(SectionFrontType, Inline2)
      }

      val tabletSlots = {
        def tabletSlots(contentType: ContentType, adSlot: AdSlot) = {
          zipWithCountries(Tablet, adSlot, contentType)
        }
        tabletSlots(ArticleType, Top) ++
          tabletSlots(ArticleType, Inline1) ++
          tabletSlots(ArticleType, Inline2) ++
          tabletSlots(ArticleType, Inline3) ++
          tabletSlots(SectionFrontType, Top) ++
          tabletSlots(SectionFrontType, Inline1) ++
          tabletSlots(SectionFrontType, Inline2)
      }

      val mobileSlots = {
        def mobileSlots(contentType: ContentType, adSlot: AdSlot) = {
          zipWithCountries(Mobile, adSlot, contentType)
        }
        mobileSlots(ArticleType, Top) ++
          mobileSlots(ArticleType, Inline1) ++
          mobileSlots(ArticleType, Inline2) ++
          mobileSlots(ArticleType, Inline3) ++
          mobileSlots(SectionFrontType, Top) ++
          mobileSlots(SectionFrontType, Inline1) ++
          mobileSlots(SectionFrontType, Inline2)
      }

      val slotsToMonitor = desktopSlots ++ tabletSlots ++ mobileSlots

      val eventualCounts = slotsToMonitor map (count _).tupled

      Future.sequence(eventualCounts) foreach { counts =>
        sendToCloudWatch(counts.toMap)
      }
    }
  }
}
