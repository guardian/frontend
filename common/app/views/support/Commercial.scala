package views.support

import common.Edition
import common.dfp.AdSize.{leaderboardSize, responsiveSize}
import common.dfp.{AdSize, AdSlot, TopAboveNavSlot, TopSlot}
import conf.switches.Switches._
import model.MetaData

object Commercial {

  def shouldShowAds(metaData: MetaData): Boolean = metaData match {
    case c: model.Content if c.shouldHideAdverts => false
    case p: model.Page if p.section == "identity" => false
    case model.CommercialExpiryPage(_) => false
    case _ => true
  }

  private def hasAdOfSize(slot: AdSlot,
                          size: AdSize,
                          metaData: MetaData,
                          edition: Edition): Boolean = {
    metaData.sizeOfTakeoverAdsInSlot(slot, edition) contains size
  }

  object topAboveNavSlot {

    private def isBusinessFront(metaData: MetaData) = {
      metaData.id == "uk/business" || metaData.id == "us/business" || metaData.id == "au/business"
    }

    def adSizes(metaData: MetaData, edition: Edition): Map[String, Seq[String]] = {
      val desktopSizes = {
        if (FixedTopAboveNavAdSlotSwitch.isSwitchedOn && isBusinessFront(metaData)) {
          if (hasAdOfSize(TopAboveNavSlot, leaderboardSize, metaData, edition)) {
            Seq("728,90")
          } else if (hasAdOfSize(TopAboveNavSlot, responsiveSize, metaData, edition)) {
            Seq("88,70")
          } else {
            Seq("1,1", "900,250", "970,250")
          }
        } else Seq("1,1", "88,70", "728,90", "940,230", "900,250", "970,250")
      }
      Map(
        "mobile" -> Seq("1,1", "88,70", "728,90"),
        "desktop" -> desktopSizes
      )
    }

    def cssClasses(metaData: MetaData, edition: Edition): String = {
      val classes = Seq(
        "top-banner-ad-container",
        "top-banner-ad-container--desktop",
        "top-banner-ad-container--above-nav",
        "js-top-banner-above-nav")

      val sizeSpecificClass = {
        if (FixedTopAboveNavAdSlotSwitch.isSwitchedOn && isBusinessFront(metaData)) {
          if (hasAdOfSize(TopAboveNavSlot, leaderboardSize, metaData, edition)) {
            "top-banner-ad-container--small"
          } else if (hasAdOfSize(TopAboveNavSlot, responsiveSize, metaData, edition)) {
            "top-banner-ad-container--responsive"
          } else {
            "top-banner-ad-container--large"
          }
        } else {
          "top-banner-ad-container--reveal"
        }
      }

      (classes :+ sizeSpecificClass) mkString " "
    }
  }

  object topBelowNavSlot {

    def hasAd(metaData: MetaData, edition: Edition): Boolean = {
      metaData.hasAdInBelowTopNavSlot(edition)
    }
  }

  object topSlot {

    def hasResponsiveAd(metaData: MetaData, edition: Edition): Boolean = {
      hasAdOfSize(TopSlot, responsiveSize, metaData, edition)
    }
  }
}
