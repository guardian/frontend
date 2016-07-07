package common.commercial.hosted.hardcoded

import common.commercial.hosted._
import conf.switches.Switches

object VisitBritainHostedPages {

  private val activitiesPageName = "activities"
  private val cityPageName = "city"
  private val coastPageName = "coast"
  private val countrysidePageName = "countryside"
  private val imageUrlPrefix = "https://static.theguardian.com/commercial/hosted/visit-britain/"
  private val campaign = HostedCampaign(
    id = "visit-britain",
    name = "Visit Britain",
    owner = "OMGB",
    logo = HostedLogo(imageUrlPrefix + "OMGB_LOCK_UP_Hashtag_HOAM_Blue.jpg"),
    cssClass = "visit-britain"
  )

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
    campaign = campaign,
    images = activityImages,
    pageUrl = "https://www.theguardian.com/commercial/advertiser-content/visit-britain/activities",
    pageName = activitiesPageName,
    title = "Activities",
    ctaText = "Explore our collection of unique experiences from all over Great Britain.",
    ctaLink = "http://en.omgb.com/map/",
    ctaButtonText = "Visit OMGB now",
    standfirst = ""
  )

  private val cityImages : List[HostedGalleryImage] = List(
    HostedGalleryImage (
      url = imageUrlPrefix + "city/England_London_VB34135297.jpg",
      title = "Tower Bridge, London, England",
      caption = "© VisitBritain / Mark Thomasson"
    ),
    HostedGalleryImage (
      url = imageUrlPrefix + "city/England_Bristol Balloon Fiesta MorningLaunch.jpg",
      title = "Bristol International Balloon Fiesta, Bristol, Avon, England",
      caption = "© Destination Bristol"
    ),
    HostedGalleryImage (
      url = imageUrlPrefix + "city/Scotland_Edinburgh_VB34148271.jpg",
      title = "Calton Hill, Edinburgh, Scotland",
      caption = "© VisitBritain / Andrew Pickett"
    ),
    HostedGalleryImage (
      url = imageUrlPrefix + "city/England_London_RegentsPark_Theatre_VB34135044.jpg",
      title = "Pride & Prejudice, Regents Park, London, England",
      caption = "© VisitBritain / Eric Nathan"
    ),
    HostedGalleryImage (
      url = imageUrlPrefix + "city/Scotland_Edinburgh_Fringe_VB34148150.jpg",
      title = "The Edinburgh Festival and Edinburgh Fringe Festival, Edinburgh, Scotland",
      caption = "© VisitBritain / Andrew Pickett"
    )
  )

  val cityGallery: HostedGalleryPage = HostedGalleryPage(
    campaign = campaign,
    images = cityImages,
    pageUrl = "https://www.theguardian.com/commercial/advertiser-content/visit-britain/city",
    pageName = activitiesPageName,
    title = "City",
    ctaText = "Explore our collection of unique experiences from all over Great Britain.",
    ctaLink = "http://en.omgb.com/map/",
    ctaButtonText = "Visit OMGB now",
    standfirst = ""
  )

  private val coastImages : List[HostedGalleryImage] = List(
//    HostedGalleryImage (
//      url = imageUrlPrefix + "coast/505635_6004330_OMGB_48sh_Images6_GiantsCauseway.jpg",
//      title = "The Giant's Causeway, Northern Ireland",
//      caption = "© VisitBritain / Ben Selway"
//    ),
    HostedGalleryImage (
      url = imageUrlPrefix + "coast/England_IslesOfScilly_VE25005.jpg",
      title = "St Mary's, Isles of Scilly, Cornwall, England",
      caption = "© VisitEngland / Alex Hare"
    ),
//    HostedGalleryImage (
//      url = imageUrlPrefix + "coast/Wales_LlandudnoPier_VB34133048.jpg",
//      title = "Llandudno Pier, WalesLlandudno Pier, Wales",
//      caption = "© VisitBritain/ Lee Beel "
//    ),
//    HostedGalleryImage (
//      url = imageUrlPrefix + "coast/England_Yorkshire_Whitby Regatta fireworks Credit Colin Carter_NYMNPA_BIG.jpg",
//      title = "Whitby, Yorkshire, England",
//      caption = "© Colin Carter_NYMNPA"
//    ),
    HostedGalleryImage (
      url = imageUrlPrefix + "coast/Scotland_Dunnottar_VB21954447.jpg",
      title = "Dunnottar Castle, Grampian, Scotland",
      caption = "© VisitBritain / Britain on View"
    ),
    HostedGalleryImage (
      url = imageUrlPrefix + "coast/England_Cornwall_Minack_VB25754182.jpg",
      title = "Minack Theatre, Cornwall, England",
      caption = "© VisitBritain / Britain on View"
    ),
//    HostedGalleryImage (
//      url = imageUrlPrefix + "coast/England_Merseyside_VB21978639.jpg",
//      title = "Sculpture by Anthony Gormley, Crosby Beach, Merseyside, England",
//      caption = "© VisitBritain / Pete Seaward"
//    ),
    HostedGalleryImage (
      url = imageUrlPrefix + "coast/505635_6004330_OMGB_720x480_Images3_Dunluce.jpg",
      title = "Dunluce Castle, Northern Ireland",
      caption = "© VisitBritain / Ben Selway"
    ),
    HostedGalleryImage (
      url = imageUrlPrefix + "coast/505635_6004330_OMGB_48sh_Images6_GiantsCauseway.jpg",
      title = "The Giant's Causeway, Northern Ireland",
      caption = "© Northern Ireland Tourist Board"
    )
  )


  private val coastGallery: HostedGalleryPage = HostedGalleryPage(
    campaign = campaign,
    images = coastImages,
    pageUrl = "https://www.theguardian.com/commercial/advertiser-content/visit-britain/coast",
    pageName = coastPageName,
    title = "Coast",
    ctaText = "Explore our collection of unique experiences from all over Great Britain.",
    ctaLink = "http://en.omgb.com/map/",
    ctaButtonText = "Visit OMGB now",
    standfirst = ""
  )


  private val countrysideImages : List[HostedGalleryImage] = List(
    HostedGalleryImage (
      url = imageUrlPrefix + "countryside/505635_6004330_OMGB_48sh_Images5_GlenCoe.jpg",
      title = "Glen Coe, Scotland",
      caption = "© VisitBritain / Rod Edwards"
    ),
    HostedGalleryImage (
      url = imageUrlPrefix + "countryside/505635_6004330_OMGB_48sh_Images2_Wastwater.jpg",
      title = "Wastwater, The Lake District",
      caption = "© VisitEngland / Rod Edwards"
    ),
    HostedGalleryImage (
      url = imageUrlPrefix + "countryside/GettyImages-600586061_DarkHedges.jpg",
      title = "The Dark Hedges, Northern Ireland",
      caption = "© Getty Images"
    ),
    HostedGalleryImage (
      url = imageUrlPrefix + "countryside/England_North York Moors_Heather on Cleveland Way Landscape_Credit VisitEngland_Thomas Heaton.jpg",
      title = "Cleveland Way, North York Moors, Yorkshire, England",
      caption = "© VisitEngland / Thomas Heaton"
    ),
    HostedGalleryImage (
      url = imageUrlPrefix + "countryside/505635_6004330_OMGB_48sh_Images7_GlenCoe.jpg",
      title = "Glen Coe, Scotland",
      caption = "© VisitBritain / Rod Edwards"
    ),
    HostedGalleryImage (
      url = imageUrlPrefix + "countryside/England_Northumberland_Hadrians Wall Landscape_Credit Thomas Heaton_VisitEngland.jpg",
      title = "Hadrian's Wall, Northumberland, England",
      caption = "© VisitEngland / Thomas Heaton"
    )
  )

  private val countrysideGallery: HostedGalleryPage = HostedGalleryPage(
    campaign = campaign,
    images = countrysideImages,
    pageUrl = "https://www.theguardian.com/commercial/advertiser-content/visit-britain/countryside",
    pageName = countrysidePageName,
    title = "Countryside",
    ctaText = "Explore our collection of unique experiences from all over Great Britain.",
    ctaLink = "http://en.omgb.com/map/",
    ctaButtonText = "Visit OMGB now",
    standfirst = ""
  )

  def fromPageName(pageName: String): Option[HostedPage] = {
    if (!Switches.hostedGalleryVisitBritain.isSwitchedOn) None
    else
      pageName match {
        case `activitiesPageName` => Some(activitiesGallery)
        case `cityPageName` => Some(cityGallery)
        case `coastPageName` => Some(coastGallery)
        case `countrysidePageName` => Some(countrysideGallery)
        case _ => None
      }
  }

}
