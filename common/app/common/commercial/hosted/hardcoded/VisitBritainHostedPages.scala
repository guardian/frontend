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
    name = "#OMGB. Home of Amazing Moments. Great Britain & Northern Ireland",
    owner = "OMGB",
    logo = HostedLogo(imageUrlPrefix + "OMGB_LOCK_UP_Hashtag_HOAM_Blue.jpg"),
    cssClass = "visit-britain"
  )

  private val activityImages: List[HostedGalleryImage] = List(
    HostedGalleryImage(
      url = imageUrlPrefix + "activities/505635_6004330_OMGB_48sh_Images_Surf snowdonia.jpg",
      title = "Ride the waves at Surf Snowdonia",
      caption = "Surf Snowdonia, Wales",
      credit = "© VisitBritain"
    ),
    HostedGalleryImage(
      url = imageUrlPrefix + "activities/England_Cumbria_Cycling_VE23598.jpg",
      title = "Pedal past the wild landscapes of Cumbria",
      caption = "Eden Valley, Cumbria, England",
      credit = "© VisitEngland / Tony West Photography / Nurture Eden"
    ),
    HostedGalleryImage(
      url = imageUrlPrefix + "activities/England_Yorkshire_Goathland, home to Harry Potter's Hogsmeade Credit Alan Pratt_NYMR.jpg",
      title = "Hop aboard the Hogwart Express in North Yorkshire",
      caption = "Goathland, North York Moors, Yorkshire, England",
      credit = "© Alan Pratt_NYMR"
    ),
    HostedGalleryImage(
      url = imageUrlPrefix + "activities/England_Cumbria_Swim_pm-5-103-final.jpg",
      title = "Swap the pool for a wild swimming in a tranquil lake",
      caption = "Lake District, Cumbria, England",
      credit = "© VisitEngland / Blacks"
    ),
    HostedGalleryImage(
      url = imageUrlPrefix + "activities/England_IsleofWight_Paddleboard_VE18617.jpg",
      title = "Keep your balance while admiring coastal landmarks",
      caption = "Alum Bay, Isle of Wight, England",
      credit = "© VisitEngland / Jeremy Congialosi"
    ),
    HostedGalleryImage(
      url = imageUrlPrefix + "activities/England_Dorset_Coasteering_VB34139944.jpg",
      title = "Take the plunge in Dorset on a coasteering adventure",
      caption = "Stair Hole, Jurassic Coast, Dorset, England",
      credit = "© VisitBritain / Ben Selway"
    ),
    HostedGalleryImage(
      url = imageUrlPrefix + "activities/505635_6004330_OMGB_720x480_Images5_SurfSnowdonia.jpg",
      title = "Ride the waves at Surf Snowdonia",
      caption = "Surf Snowdonia, Wales",
      credit = "© VisitBritain / Ben Selway"
    )
  )

  val activitiesGallery: HostedGalleryPage = HostedGalleryPage(
    campaign = campaign,
    images = activityImages,
    pageUrl = "https://www.theguardian.com/commercial/advertiser-content/visit-britain/activities",
    pageName = activitiesPageName,
    title = "Don’t be a sloth this summer",
    ctaText = "Explore our collection of unique experiences from all over Great Britain.",
    ctaLink = "http://en.omgb.com/map/",
    ctaButtonText = "Visit OMGB now",
    standfirst = "Get your heart pumping with a daring dip in the Lake District or learn how to paddleboard along the Isle of Wight’s scenic coastline."
  )

  private val cityImages: List[HostedGalleryImage] = List(
    HostedGalleryImage(
      url = imageUrlPrefix + "city/England_London_VB34135297.jpg",
      title = "Dare to look down at Tower Bridge’s glass floor experience",
      caption = "Tower Bridge, London, England",
      credit = "© VisitBritain / Mark Thomasson"
    ),
    HostedGalleryImage(
      url = imageUrlPrefix + "city/England_Bristol Balloon Fiesta MorningLaunch.jpg",
      title = "Crank your neck for the eye-popping International Balloon Fiesta",
      caption = "Bristol International Balloon Fiesta, Bristol, Avon, England",
      credit = "© Destination Bristol"
    ),
    HostedGalleryImage(
      url = imageUrlPrefix + "city/Scotland_Edinburgh_VB34148271.jpg",
      title = "Survey Edinburgh’s iconic skyline from Calton Hill",
      caption = "Calton Hill, Edinburgh, Scotland",
      credit = "© VisitBritain / Andrew Pickett"
    ),
    HostedGalleryImage(
      url = imageUrlPrefix + "city/England_London_RegentsPark_Theatre_VB34135044.jpg",
      title = "Take your seat at the Regents Park Open Air Theatre",
      caption = "Pride & Prejudice, Regents Park, London, England",
      credit = "© VisitBritain / Eric Nathan"
    ),
    HostedGalleryImage(
      url = imageUrlPrefix + "city/Scotland_Edinburgh_Fringe_VB34148150.jpg",
      title = "Catch hotly-tipped acts at Edinburgh Fringe",
      caption = "The Edinburgh Festival and Edinburgh Fringe Festival, Edinburgh, Scotland",
      credit = "© VisitBritain / Andrew Pickett"
    )
  )

  val cityGallery: HostedGalleryPage = HostedGalleryPage(
    campaign = campaign,
    images = cityImages,
    pageUrl = "https://www.theguardian.com/commercial/advertiser-content/visit-britain/city",
    pageName = activitiesPageName,
    title = "Take a city break from the norm",
    ctaText = "Explore our collection of unique experiences from all over Great Britain.",
    ctaLink = "http://en.omgb.com/map/",
    ctaButtonText = "Visit OMGB now",
    standfirst = "Discover instagrammable events like the Bristol Balloon Fiesta; theatre under the stars and hotly-tipped comedy acts at Edinburgh Fringe."
  )

  private val coastImages: List[HostedGalleryImage] = List(
    HostedGalleryImage(
      url = imageUrlPrefix + "coast/505635_6004330_OMGB_48sh_Images6_GiantsCauseway.jpg",
      caption = "The Giant's Causeway, Northern Ireland",
      title = "Admire atmospheric rock formations at the Giant’s Causeway",
      credit = "© VisitBritain / Ben Selway"
    ),
    HostedGalleryImage(
      url = imageUrlPrefix + "coast/England_IslesOfScilly_VE25005.jpg",
      caption = "St Mary's, Isles of Scilly, Cornwall, England",
      title = "Feel a million miles from the UK on the Isles of Scilly",
      credit = "© VisitEngland / Alex Hare"
    ),
    HostedGalleryImage(
      url = imageUrlPrefix + "coast/Wales_LlandudnoPier_VB34133048.jpg",
      caption = "Llandudno Pier, WalesLlandudno Pier, Wales",
      title = "Soak up the sea air from Llandudno Pier in Wales",
      credit = "© VisitBritain/ Lee Beel "
    ),
    HostedGalleryImage(
      url = imageUrlPrefix + "coast/England_Yorkshire_Whitby Regatta fireworks Credit Colin Carter_NYMNPA_BIG.jpg",
      caption = "Whitby, Yorkshire, England",
      title = "Get the party started at the Whitby Regatta in August.",
      credit = "© Colin Carter_NYMNPA"
    ),
    HostedGalleryImage(
      url = imageUrlPrefix + "coast/Scotland_Dunnottar_VB21954447.jpg",
      caption = "Dunnottar Castle, Grampian, Scotland",
      title = "Marvel at the majestic medieval ruins of Dunnottar Castle",
      credit = "© VisitBritain / Britain on View"
    ),
    HostedGalleryImage(
      url = imageUrlPrefix + "coast/England_Cornwall_Minack_VB25754182.jpg",
      caption = "Minack Theatre, Cornwall, England",
      title = "Get swept away by drama on and off set at the  Minack",
      credit = "© VisitBritain / Britain on View"
    ),
    HostedGalleryImage(
      url = imageUrlPrefix + "coast/England_Merseyside_VB21978639.jpg",
      caption = "Sculpture by Anthony Gormley, Crosby Beach, Merseyside, England",
      title = "Join Antony Gormley’s sculptures on Crosby Beach",
      credit = "© VisitBritain / Pete Seaward"
    ),
    HostedGalleryImage(
      url = imageUrlPrefix + "coast/505635_6004330_OMGB_720x480_Images3_Dunluce.jpg",
      title = "Dunluce Castle, Northern Ireland",
      credit = "© VisitBritain / Ben Selway"
    ),
    HostedGalleryImage(
      url = imageUrlPrefix + "coast/505635_6004330_OMGB_48sh_Images6_GiantsCauseway.jpg",
      title = "The Giant's Causeway, Northern Ireland",
      credit = "© Northern Ireland Tourist Board"
    )
  )


  private val coastGallery: HostedGalleryPage = HostedGalleryPage(
    campaign = campaign,
    images = coastImages,
    pageUrl = "https://www.theguardian.com/commercial/advertiser-content/visit-britain/coast",
    pageName = coastPageName,
    title = "Find cool-on-sea this summer",
    ctaText = "Explore our collection of unique experiences from all over Great Britain.",
    ctaLink = "http://en.omgb.com/map/",
    ctaButtonText = "Visit OMGB now",
    standfirst = "Catch a show at an amphitheatre overlooking the Atlantic, go island hopping in sub-tropical climes and join the party at the Whitby Regatta."
  )


  private val countrysideImages: List[HostedGalleryImage] = List(
    HostedGalleryImage(
      url = imageUrlPrefix + "countryside/505635_6004330_OMGB_48sh_Images5_GlenCoe.jpg",
      title = "Marvel at Glen Coe, Scotland’s most iconic glen",
      caption = "Glen Coe, Scotland",
      credit = "© VisitBritain / Rod Edwards"
    ),
    HostedGalleryImage(
      url = imageUrlPrefix + "countryside/505635_6004330_OMGB_48sh_Images2_Wastwater.jpg",
      title = "Float past snow-capped peaks on Wastwater",
      caption = "Wastwater, The Lake District",
      credit = "© VisitEngland / Rod Edwards"
    ),
    HostedGalleryImage(
      url = imageUrlPrefix + "countryside/GettyImages-600586061_DarkHedges.jpg",
      title = "Follow in the footsteps of Arya Stark at Dark Hedges",
      caption = "The Dark Hedges, Northern Ireland",
      credit = "© Getty Images"
    ),
    HostedGalleryImage(
      url = imageUrlPrefix + "countryside/England_North York Moors_Heather on Cleveland Way Landscape_Credit VisitEngland_Thomas Heaton.jpg",
      title = "Admire purple hues along the Cleveland Way",
      caption = "Cleveland Way, North York Moors, Yorkshire, England",
      credit = "© VisitEngland / Thomas Heaton"
    ),
    HostedGalleryImage(
      url = imageUrlPrefix + "countryside/505635_6004330_OMGB_48sh_Images7_GlenCoe.jpg",
      title = "Glen Coe, Scotland",
      credit = "© VisitBritain / Rod Edwards"
    ),
    HostedGalleryImage(
      url = imageUrlPrefix + "countryside/England_Northumberland_Hadrians Wall Landscape_Credit Thomas Heaton_VisitEngland.jpg",
      title = "Stroll alongside ancient history at Hadrian’s Wall",
      caption = "Hadrian's Wall, Northumberland, England",
      credit = "© VisitEngland / Thomas Heaton"
    )
  )

  private val countrysideGallery: HostedGalleryPage = HostedGalleryPage(
    campaign = campaign,
    images = countrysideImages,
    pageUrl = "https://www.theguardian.com/commercial/advertiser-content/visit-britain/countryside",
    pageName = countrysidePageName,
    title = "Mend your relationship with Mother Nature",
    ctaText = "Explore our collection of unique experiences from all over Great Britain.",
    ctaLink = "http://en.omgb.com/map/",
    ctaButtonText = "Visit OMGB now",
    standfirst = "Switch off and soak up the country air as you ramble through the heather-coated North York Moors or explore the dramatic scenery of Glen Coe."
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
