package views.support

import common.Edition
import common.dfp.Size
import conf.Switches._
import model.MetaData

object Commercial {

  def shouldShowAds(metaData: MetaData): Boolean = metaData match {
    case c: model.Content if c.shouldHideAdverts => false
    case p: model.Page if p.section == "identity" => false
    case _ => true
  }

  object topAboveNavSlot {

    private def isNetworkFront(metaData: MetaData) = {
      metaData.id == "uk" || metaData.id == "us" || metaData.id == "au"
    }

    private def hasAdOfSize(size: Size, metaData: MetaData, edition: Edition): Boolean = {
      metaData.sizesOfAdInTopAboveNavSlot(edition).exists(_ contains size)
    }

    private def hasSmallAd(metaData: MetaData, edition: Edition): Boolean = {
      hasAdOfSize(Size(728, 90), metaData, edition)
    }

    private def hasResponsiveAd(metaData: MetaData, edition: Edition): Boolean = {
      hasAdOfSize(Size(88, 70), metaData, edition)
    }

    def adSizes(metaData: MetaData, edition: Edition): Map[String, Seq[String]] = {
      Map(
        "mobile" -> Seq("1,1", "88,70", "728,90"),
        "desktop" -> {
          if (FixedTopAboveNavAdSlotSwitch.isSwitchedOn && isNetworkFront(metaData)) {
            if (hasSmallAd(metaData, edition)) {
              Seq("728,90")
            } else if (hasResponsiveAd(metaData, edition)) {
              Seq("88,70")
            } else {
              Seq("1,1", "900,250", "970,250")
            }
          } else {
            Seq("1,1", "88,70", "728,90", "940,230", "900,250", "970,250")
          }
        }
      )
    }

    def cssClasses(metaData: MetaData, edition: Edition): String = {
      val classes = Seq(
        "top-banner-ad-container",
        "top-banner-ad-container--desktop",
        "top-banner-ad-container--above-nav")

      val sizeSpecificClass = {
        if (FixedTopAboveNavAdSlotSwitch.isSwitchedOn && isNetworkFront(metaData)) {
          if (hasSmallAd(metaData, edition)) {
            "top-banner-ad-container--small"
          } else if (hasResponsiveAd(metaData, edition)) {
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
}
