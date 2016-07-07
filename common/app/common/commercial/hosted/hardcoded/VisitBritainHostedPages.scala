package common.commercial.hosted.hardcoded

import common.commercial.hosted._
import conf.switches.Switches

object VisitBritainHostedPages {

  private val activitiesPageName = "activities"
  private val cityPageName = "city"
  private val coastPageName = "coast"
  private val countrysidePageName = "countryside"
  private val imageUrlPrefix = "http://static.theguardian.com/commercial/hosted/visit-britain/"

  private val activityImages : List[HostedGalleryImage] = List(
    HostedGalleryImage (
      url = imageUrlPrefix + "activities/505635_6004330_OMGB_48sh_Images_Surf snowdonia.jpg",
      title = "Surf Snowdonia, Wales",
      caption = "© VisitBritain"
    ),
    HostedGalleryImage (
      url = imageUrlPrefix + "activities/England_Cumbria_Cycling_VE23598.jpg",
      title = "Eden Valley, Cumbria, England",
      caption = "© VisitEngland / Tony West Photography / Nurture Eden"
    ),
    HostedGalleryImage (
      url = imageUrlPrefix + "activities/England_Yorkshire_Goathland, home to Harry Potter's Hogsmeade Credit Alan Pratt_NYMR.jpg",
      title = "Goathland, North York Moors, Yorkshire, England",
      caption = "© Alan Pratt_NYMR"
    ),
    HostedGalleryImage (
      url = imageUrlPrefix + "activities/England_Cumbria_Swim_pm-5-103-final.jpg",
      title = "Lake District, Cumbria, England",
      caption = "© VisitEngland / Blacks"
    ),
    HostedGalleryImage (
      url = imageUrlPrefix + "activities/England_IsleofWight_Paddleboard_VE18617.jpg",
      title = "Alum Bay, Isle of Wight, England",
      caption = "© VisitEngland / Jeremy Congialosi"
    ),
    HostedGalleryImage (
      url = imageUrlPrefix + "activities/England_Dorset_Coasteering_VB34139944.jpg",
      title = "Stair Hole, Jurassic Coast, Dorset, England",
      caption = "© VisitBritain / Ben Selway"
    ),
    HostedGalleryImage (
      url = imageUrlPrefix + "activities/505635_6004330_OMGB_720x480_Images5_SurfSnowdonia.jpg",
      title = "Surf Snowdonia, Wales",
      caption = "© VisitBritain / Ben Selway"
    )
  )

  val activitiesGallery: HostedGalleryPage = HostedGalleryPage(
    campaign = HostedCampaign(
      id = "visit-britain",
      name = "Visit Britain",
      owner = "OMGB",
      logo = HostedLogo(imageUrlPrefix + "OMGB_LOCK_UP_Hashtag_HOAM_Blue.jpg")
    ),
    images = activityImages,
    pageUrl = "https://www.theguardian.com/commercial/advertiser-content/visit-britain/activities",
    pageName = activitiesPageName,
    title = "Activities",
    ctaText = "Explore our collection of unique experiences from all over Great Britain.",
    ctaLink = "http://en.omgb.com/map/",
    ctaButtonText = "Visit OMGB now",
    ctaIndex = 5,
    standfirst = "",
    cssClass = "visit-britain"
  )

  def fromPageName(pageName: String): Option[HostedPage] = {
    pageName match {
      case `activitiesPageName` if Switches.hostedGalleryVisitBritain.isSwitchedOn => Some(activitiesGallery)
      case _ => None
    }
  }

}
