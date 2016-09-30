package common.commercial.hosted.hardcoded

import common.commercial.hosted._
import conf.Configuration.site.host

object VisitBritainHostedPages {

  private val activitiesPageName = "activities"
  private val cityPageName = "city"
  private val coastPageName = "coast"
  private val countrysidePageName = "countryside"
  private val campaign = HostedCampaign(
    id = "visit-britain",
    name = "#OMGB. Home of Amazing Moments. Great Britain & Northern Ireland",
    owner = "OMGB",
    logo = HostedLogo("https://static.theguardian.com/commercial/hosted/visit-britain/OMGB_LOCK_UP_Hashtag_HOAM_Blue.jpg"),
    fontColour = FontColour("#E41F13")
  )

  private val activityImages: List[HostedGalleryImage] = List(
    HostedGalleryImage(
      url =  "https://media.guim.co.uk/cf6dbc732af6ac19bf1e599aa6601b5b90ee19f7/231_0_2315_1389/2000.jpg",
      title = "Ride the waves at Surf Snowdonia",
      caption = "Surf Snowdonia, Wales",
      credit = "© VisitBritain"
    ),
    HostedGalleryImage(
      url = "https://media.guim.co.uk/9b7492167eb6cd8e72014b8976b68ac8bc0fa91e/0_0_3898_2340/2000.jpg",
      title = "Pedal past the wild landscapes of Cumbria",
      caption = "Eden Valley, Cumbria, England",
      credit = "© VisitEngland / Tony West Photography / Nurture Eden"
    ),
    HostedGalleryImage(
      url = "https://media.guim.co.uk/1baa14c86fc9672a92a2bdbaf1646b391313f873/0_0_1299_1813/716.jpg",
      title = "Hop aboard the Hogwarts Express in North Yorkshire",
      caption = "Goathland, North York Moors, Yorkshire, England",
      credit = "© Alan Pratt_NYMR"
    ),
    HostedGalleryImage(
      url = "https://media.guim.co.uk/2209a44365a70bcadac9b3b5eedd38deb443352b/0_171_5616_3370/2000.jpg",
      title = "Swap the pool for wild swimming in a tranquil lake",
      caption = "Lake District, Cumbria, England",
      credit = "© VisitEngland / Blacks"
    ),
    HostedGalleryImage(
      url = "https://media.guim.co.uk/868ca67529af76a13ab6472698eb61d891a1f8bf/97_0_4102_2464/2000.jpg",
      title = "Keep your balance while admiring coastal landmarks",
      caption = "Alum Bay, Isle of Wight, England",
      credit = "© VisitEngland / Jeremy Congialosi"
    ),
    HostedGalleryImage(
      url = "https://media.guim.co.uk/45957acc9dc793cf4b3eaebf000132ce98fffdb4/0_323_4874_2926/2000.jpg",
      title = "Take the plunge in Dorset on a coasteering adventure",
      caption = "Stair Hole, Jurassic Coast, Dorset, England",
      credit = "© VisitBritain / Ben Selway"
    ),
    HostedGalleryImage(
      url = "https://media.guim.co.uk/c56dea5dfc013a1287e44c9b1b4cee66597079c3/0_0_1667_2500/1333.jpg",
      title = "Ride the waves at Surf Snowdonia",
      caption = "Surf Snowdonia, Wales",
      credit = "© VisitBritain / Ben Selway"
    )
  )

  private val cityImages: List[HostedGalleryImage] = List(
    HostedGalleryImage(
      url = "https://media.guim.co.uk/628946348eea991e04e02c8a3fd1420d2d6d44d0/25_0_5449_3270/2000.jpg",
      title = "Dare to look down at Tower Bridge’s glass floor experience",
      caption = "Tower Bridge, London, England",
      credit = "© VisitBritain / Mark Thomasson"
    ),
    HostedGalleryImage(
      url = "https://media.guim.co.uk/6d65859087baf6907e0b78d772605c59db2460f0/0_0_5130_3078/2000.jpg",
      title = "Crane your neck for the eye-popping International Balloon Fiesta",
      caption = "Bristol International Balloon Fiesta, Bristol, Avon, England",
      credit = "© Destination Bristol"
    ),
    HostedGalleryImage(
      url = "https://media.guim.co.uk/baa07ffbf9ae2cc3d774e96b7cb6d8e68a877822/0_200_6000_3600/2000.jpg",
      title = "Survey Edinburgh’s iconic skyline from Calton Hill",
      caption = "Calton Hill, Edinburgh, Scotland",
      credit = "© VisitBritain / Andrew Pickett"
    ),
    HostedGalleryImage(
      url = "https://media.guim.co.uk/120e8a64c93eabdc9e926a0fa9f113553b24ea1a/0_248_5400_3240/2000.jpg",
      title = "Take your seat at the Regents Park Open Air Theatre",
      caption = "Pride & Prejudice, Regents Park, London, England",
      credit = "© VisitBritain / Eric Nathan"
    ),
    HostedGalleryImage(
      url = "https://media.guim.co.uk/9f332dbd5ecdb1ee1ac98398a3107419585ba01a/0_235_5200_3120/2000.jpg",
      title = "Catch hotly-tipped acts at Edinburgh Fringe",
      caption = "The Edinburgh Festival and Edinburgh Fringe Festival, Edinburgh, Scotland",
      credit = "© VisitBritain / Andrew Pickett"
    )
  )

  private val coastImages: List[HostedGalleryImage] = List(
    HostedGalleryImage(
      url = "https://media.guim.co.uk/4ba0e60ffdd35406806fef4d7fbc4e57f2bbf865/463_0_2315_1389/2000.jpg",
      caption = "The Giant's Causeway, Northern Ireland",
      title = "Admire atmospheric rock formations at the Giant’s Causeway",
      credit = "© VisitBritain / Ben Selway"
    ),
    HostedGalleryImage(
      url = "https://media.guim.co.uk/3a8fbca7c261eb96c16d172fd300d9cfd9c34c6d/0_188_5641_3385/2000.jpg",
      caption = "St Mary's, Isles of Scilly, Cornwall, England",
      title = "Feel a million miles from the UK on the Isles of Scilly",
      credit = "© VisitEngland / Alex Hare"
    ),
    HostedGalleryImage(
      url = "https://media.guim.co.uk/70d636b621ee1d8ae0f6af80cb360954f8ca0374/0_0_4237_2545/2000.jpg",
      caption = "Llandudno Pier, Wales",
      title = "Soak up the sea air from Llandudno Pier in Wales",
      credit = "© VisitBritain/ Lee Beel "
    ),
    HostedGalleryImage(
      url = "https://media.guim.co.uk/092c887ac1b501a4e62732e77f0d525c576dfa8e/0_0_7360_4414/2000.jpg",
      caption = "Whitby, Yorkshire, England",
      title = "Get the party started at the Whitby Regatta in August.",
      credit = "© Colin Carter_NYMNPA"
    ),
    HostedGalleryImage(
      url = "https://media.guim.co.uk/c7a03ff4a7b6d89b813834d7ea5f0d5293135770/0_0_1942_2952/1316.jpg",
      caption = "Dunnottar Castle, Grampian, Scotland",
      title = "Marvel at the majestic medieval ruins of Dunnottar Castle",
      credit = "© VisitBritain / Britain on View"
    ),
    HostedGalleryImage(
      url = "https://media.guim.co.uk/53322981cf42bbb4111f69e88f240a6e67dbcf35/0_0_4772_6397/1492.jpg",
      caption = "Minack Theatre, Cornwall, England",
      title = "Get swept away by drama on and off set at the  Minack",
      credit = "© VisitBritain / Britain on View"
    ),
    HostedGalleryImage(
      url = "https://media.guim.co.uk/ab74076edc14441685adfc0ee31c69c4f61d14cf/0_441_6456_3875/2000.jpg",
      caption = "Sculpture by Anthony Gormley, Crosby Beach, Merseyside, England",
      title = "Join Antony Gormley’s sculptures on Crosby Beach",
      credit = "© VisitBritain / Pete Seaward"
    ),
    HostedGalleryImage(
      url = "https://media.guim.co.uk/bac4f6923914f99d0b2640e0cf5a380c11f1f02b/0_0_1667_2500/1333.jpg",
      title = "Dunluce Castle, Northern Ireland",
      credit = "© VisitBritain / Ben Selway"
    ),
    HostedGalleryImage(
      url = "https://media.guim.co.uk/cb51196b14f73b0d4816dd8ad71f7fe6d2d5ade4/0_260_7795_4677/2000.jpg",
      title = "The Giant's Causeway, Northern Ireland",
      credit = "© Northern Ireland Tourist Board"
    )
  )



  private val countrysideImages: List[HostedGalleryImage] = List(
    HostedGalleryImage(
      url = "https://media.guim.co.uk/2b83d8f7ee872443b3a8b448f0b7633917c7198b/231_0_2315_1389/2000.jpg",
      title = "Marvel at Glen Coe, Scotland’s most iconic glen",
      caption = "Glen Coe, Scotland",
      credit = "© VisitBritain / Rod Edwards"
    ),
    HostedGalleryImage(
      url = "https://media.guim.co.uk/487d43802b7b21a03017ad54119d80c431992805/0_0_2315_1389/2000.jpg",
      title = "Float past snow-capped peaks on Wastwater",
      caption = "Wastwater, The Lake District",
      credit = "© VisitEngland / Rod Edwards"
    ),
    HostedGalleryImage(
      url = "https://media.guim.co.uk/7e0f74d26b8efb078999a97efbb5fa9c3b0a6834/0_0_4387_6581/1333.jpg",
      title = "Follow in the footsteps of Arya Stark at Dark Hedges",
      caption = "The Dark Hedges, Northern Ireland",
      credit = "© Getty Images"
    ),
    HostedGalleryImage(
      url = "https://media.guim.co.uk/89594c0143261d9545477ca67877beb7fc4d5b4a/0_55_5838_3504/2000.jpg",
      title = "Admire purple hues along the Cleveland Way",
      caption = "Cleveland Way, North York Moors, Yorkshire, England",
      credit = "© VisitEngland / Thomas Heaton"
    ),
    HostedGalleryImage(
      url = "https://media.guim.co.uk/671a6045abd7abf07e8ecb3f7bff0fa6dcd0064f/463_0_2315_1389/2000.jpg",
      title = "Glen Coe, Scotland",
      credit = "© VisitBritain / Rod Edwards"
    ),
    HostedGalleryImage(
      url = "https://media.guim.co.uk/ad7018754bcb8ac2bccba847c773fe1e5839117a/0_0_5765_3459/2000.jpg",
      title = "Stroll alongside ancient history at Hadrian’s Wall",
      caption = "Hadrian's Wall, Northumberland, England",
      credit = "© VisitEngland / Thomas Heaton"
    )
  )

  private def cta(pageName: String) = HostedCallToAction(
    label = Some("Explore our collection of unique experiences from all over Great Britain & Northern Ireland"),
    btnText = Some("Find more inspiration"),
    url = s"http://www.homeofamazing.com/?utm_source=guardianpartnership&utm_medium=hostedgalleries$pageName&utm_campaign=display",
    image = None,
    trackingCode = None
  )

  val activitiesGallery: HostedGalleryPage = HostedGalleryPage(
    campaign = campaign,
    images = activityImages,
    pageUrl = s"$host/advertiser-content/visit-britain/activities",
    pageName = activitiesPageName,
    title = "Don’t be a sloth this summer",
    cta = cta(activitiesPageName),
    nextPageNames = List(cityPageName, coastPageName),
    shortSocialShareText = Some("Don't be a sloth this summer: get active and explore Great Britain. Check out this gallery for inspiration"),
    standfirst = "Get your heart pumping with a daring dip in the Lake District or learn how to paddleboard along the Isle of Wight’s scenic coastline."
  )

  val cityGallery: HostedGalleryPage = HostedGalleryPage(
    campaign = campaign,
    images = cityImages,
    pageUrl = s"$host/advertiser-content/visit-britain/city",
    pageName = cityPageName,
    title = "Take a city break from the norm",
    cta = cta(cityPageName),
    nextPageNames = List(coastPageName, countrysidePageName),
    standfirst = "Discover instagrammable events like the Bristol Balloon Fiesta; theatre under the stars and hotly-tipped comedy acts at Edinburgh Fringe."
  )

  private val coastGallery: HostedGalleryPage = HostedGalleryPage(
    campaign = campaign,
    images = coastImages,
    pageUrl = s"$host/advertiser-content/visit-britain/coast",
    pageName = coastPageName,
    title = "Find cool-on-sea this summer",
    cta = cta(coastPageName),
    nextPageNames = List(countrysidePageName, activitiesPageName),
    standfirst = "Catch a show at an amphitheatre overlooking the Atlantic, go island hopping in sub-tropical climes and join the party at the Whitby Regatta."
  )

  private val countrysideGallery: HostedGalleryPage = HostedGalleryPage(
    campaign = campaign,
    images = countrysideImages,
    pageUrl = s"$host/advertiser-content/visit-britain/countryside",
    pageName = countrysidePageName,
    title = "Mend your relationship with Mother Nature",
    cta = cta(countrysidePageName),
    nextPageNames = List(activitiesPageName, cityPageName),
    standfirst = "Switch off and soak up the country air as you ramble through the heather-coated North York Moors or explore the dramatic scenery of Glen Coe."
  )

  def fromPageName(pageName: String): Option[HostedPage] = {
      pageName match {
        case `activitiesPageName` => Some(activitiesGallery)
        case `cityPageName` => Some(cityGallery)
        case `coastPageName` => Some(coastGallery)
        case `countrysidePageName` => Some(countrysideGallery)
        case _ => None
      }
  }

}
