package common.commercial.hosted.hardcoded

import common.commercial.hosted._
import conf.Configuration.site.host
import conf.switches.Switches

object ChesterZooHostedPages {

  private val campaign = HostedCampaign(
    id = "chester-zoo-act-for-wildlife",
    name = "What we fight for",
    owner = "Chester Zoo",
    logo = HostedLogo("https://static.theguardian.com/commercial/hosted/act-for-wildlife/AFW+with+CZ+portrait+with+padding.png"),
    fontColour = FontColour("#E31B22")
  )

  private val images: List[HostedGalleryImage] = List(
    HostedGalleryImage(
      url = "http://media.guim.co.uk/85af2fd7ebb0731771e7e964bdced1adb1b1606b/0_51_2048_1228/2000.jpg",
      title = "Saving Asian elephants",
      caption = "Elephant numbers are in decline as a result of habitat loss, illegal wildlife trade and disease, we must ACT NOW to save this beautiful animal"
    ),
    HostedGalleryImage(
      url = "http://media.guim.co.uk/7b3d2c6f4c530c87adc5ac64dfae501318071497/0_187_1600_959/1000.jpg",
      title = "Keeping tiger numbers growing",
      caption = "We urgently need to find a solution to help communities and tigers live alongside one another in Nepal and stop human-tiger conflict"
    ),
    HostedGalleryImage(
      url = "http://media.guim.co.uk/36a9fe087cc0a1f4ec004da1f74c3baec5d91c0a/0_123_2048_1228/2000.jpg",
      title = "Orangutans in danger",
      caption = "Orangutans are being pushed to the edge of extinction as their rainforest homes are cleared to make way for oil palm plantations"
    ),
    HostedGalleryImage(
      url = "http://media.guim.co.uk/826ad122f6979a0875cf1ade52d7339d12026ea7/0_64_2048_1229/2000.jpg",
      title = "Keeping a close eye on wildlife and finding solutions",
      caption = "Conservationists gather evidence by taking surveys and monitoring what’s happening in the wild to then be able to make a difference to saving species that are in most need of help"
    ),
    HostedGalleryImage(
      url = "http://media.guim.co.uk/c46b4b11f07ec67ae8dd27f99ab4a21111ea9852/0_71_2048_1228/2000.jpg",
      title = "Rothschild giraffe numbers are in decline",
      caption = "We’re working with partners in Uganda to find out more about this rare animal, to then develop a conservation strategy for the species"
    ),
    HostedGalleryImage(
      url = "http://media.guim.co.uk/ba520566c7eb3da48620036bc497ac17a309f708/0_68_2048_1228/2000.jpg",
      title = "Jumping to save amphibians",
      caption = "Around 40% of the 6600 known species of amphibian are at risk of extinction. Zoos are the last hope for many amphibian species"
    ),
    HostedGalleryImage(
      url = "http://media.guim.co.uk/90514bd8b5236fde99c8c9bff0d79fa03c574b3e/0_89_3881_2328/2000.jpg",
      title = "Ground-breaking science at the zoo is saving species",
      caption = "Conservation breeding programmes are critical in ensuring there’s a sustainable population that can then be reintroduced to the wild"
    ),
    HostedGalleryImage(
      url = "http://media.guim.co.uk/b128b954227b421a064a8e92b1e45ac0cb45df10/0_162_4393_2636/2000.jpg",
      title = "Time is running out for the Scottish wildcat",
      caption = "It’s believed that there are fewer than 100 left in the wild, making them one of the most endangered populations of cats in the world"
    ),
    HostedGalleryImage(
      url = "http://media.guim.co.uk/45ad0e348f365cdbd44b3ae28b3dc15510899e4d/0_159_2032_1219/2000.jpg",
      title = "Birds on the brink",
      caption = "Our Chester Zoo staff are working hard with our partners to protect bird populations in Ecuador, South East Asia, the Philippines, Mauritius and the UK"
    ),
    HostedGalleryImage(
      url = "http://media.guim.co.uk/0b77f67ffcd5f027f8f1360cb97ef197a3812afd/0_55_2048_1228/2000.jpg",
      title = "Sharing our expertise and skills around the world",
      caption = "From electricians to animal wellbeing - the skills our staff have developed through working at Chester Zoo have been crucial in saving endangered species around the world"
    ),
    HostedGalleryImage(
      url = "http://media.guim.co.uk/3f9f81d55c801b415aa82a735345e1dbcff3ea60/0_67_2048_1230/2000.jpg",
      title = "Zoos play an important and unique role in helping save wildlife",
      caption = "We’re committed to using science and our expertise to underpin our decision making in the fight to protect endangered animals and plants"
    ),
    HostedGalleryImage(
      url = "http://media.guim.co.uk/ca63987b8067b5f312688bbb4a80236df9b45f53/0_67_2048_1230/2000.jpg",
      title = "Saving species right on our doorstep",
      caption = "We are so lucky to have such diverse and amazing wildlife right here on our doorstep, but unfortunately nearly all of it is in decline"
    ),
    HostedGalleryImage(
      url = "http://media.guim.co.uk/255b3c61434fe81cdbb7e298e90675c1f80e19bc/0_90_2048_1228/2000.jpg",
      title = "Monitoring golden mantella populations in Madagascar",
      caption = "We’re working right now with our partners, carrying out vital monitoring, education programmes and scientific research to help protect this species"
    ),
    HostedGalleryImage(
      url = "http://media.guim.co.uk/5535052664a6d55a4940411532f80ce5c48582b8/0_10_3872_2325/2000.jpg",
      title = "Black rhinos on the edge of extinction",
      caption = "There are less than 650 black rhinos left in the wild so we have to ACT NOW to save this species or we risk losing them forever"
    )
  )

  private val cta = HostedCallToAction(
    label = Some("We won't stand back and we won't give up."),
    btnText = Some("It's time to act for wildlife"),
    url = "http://www.actforwildlife.org.uk/?utm_source=theguardian.com&utm_medium=referral&utm_campaign=LaunchCampaignSep2016",
    image = None,
    trackingCode = None
  )


  private val whatIsActForWildlife = "what-is-act-for-wildlife"
  private val savingOragutansFromExtinction = "saving-orangutans-from-extinction"
  private val conservationStartsCloserToHome = "conservation-starts-closer-to-home"
  private val savingWildlifeFromTheBrink = "saving-wildlife-from-the-brink-of-extinction"

  private val ensuringAFutureForSouthAsianWildlife = "ensuring-a-future-for-south-asian-wildlife"
  private val aRaceAgainstTimeForWildLife = "a-race-against-time-for-wildlife-in-latin-america"
  private val actingForWildlifeInAfrica = "acting-for-wildlife-in-africa"
  private val theRoleOfZoosInSavingWildlife = "the-role-of-zoos-in-saving-wildlife"

  private val takeTheSustainablePalmOilChallenge = "take-the-sustainable-palm-oil-challenge"
  private val makingWildlifeFriendlyHabitats = "making-wildlife-friendly-habitats"
  private val helpPutAStopToTheIllegalWildlifeTrade = "help-put-a-stop-to-the-illegal-wildlife-trade"
  private val whatWeFightFor = "what-we-fight-for"


  private val whatIsActForWildlifePage: NextHostedPage = NextHostedPage(
    imageUrl = "http://media.guim.co.uk/c23491f2b55687fe71aa11840468e54c647ade80/0_0_3881_2328/500.jpg",
    pageUrl = s"$host/advertiser-content/chester-zoo-act-for-wildlife/$whatIsActForWildlife",
    contentType = HostedContentType.Video,
    title = "What is Act for Wildlife?"
  )

  private val savingOragutansFromExtinctionPage: NextHostedPage = NextHostedPage(
    imageUrl = "https://media.guim.co.uk/e5494199050a52ed24f003f691e6abdd6eee5993/0_0_2048_1229/500.jpg",
    pageUrl = s"$host/advertiser-content/chester-zoo-act-for-wildlife/$savingOragutansFromExtinction",
    contentType = HostedContentType.Article,
    title = "Saving orangutans from extinction"
  )

  private val conservationStartsCloserToHomePage: NextHostedPage = NextHostedPage(
    imageUrl = "https://media.guim.co.uk/672a47345a9bb886d8a4420168b5934114da37de/0_51_2048_1229/500.jpg",
    pageUrl = s"$host/advertiser-content/chester-zoo-act-for-wildlife/$conservationStartsCloserToHome",
    contentType = HostedContentType.Article,
    title = "Conservation starts closer to home"
  )

  private val savingWildlifeFromTheBrinkPage: NextHostedPage = NextHostedPage(
    imageUrl = "https://media.guim.co.uk/8124d85bda256d0b0c8eaec99ab8517e26e00671/0_75_2048_1228/500.jpg",
    pageUrl = s"$host/advertiser-content/chester-zoo-act-for-wildlife/$savingWildlifeFromTheBrink",
    contentType = HostedContentType.Article,
    title = "Saving wildlife from the brink of extinction"
  )



  private val ensuringAFutureForSouthAsianWildlifePage: NextHostedPage = NextHostedPage(
    imageUrl = "https://media.guim.co.uk/6d8b2274fcc7a7bad7b13e8c65a65ee01dba11e8/252_86_1796_1078/500.jpg",
    pageUrl = s"$host/advertiser-content/chester-zoo-act-for-wildlife/$ensuringAFutureForSouthAsianWildlife",
    contentType = HostedContentType.Article,
    title = "Ensuring a future for South Asian wildlife"
  )

  private val aRaceAgainstTimeForWildLifePage: NextHostedPage = NextHostedPage(
    imageUrl = "https://media.guim.co.uk/79abfe296a0aee7c37677207b2a7f17bdfd51f57/362_120_1457_874/500.jpg",
    pageUrl = s"$host/advertiser-content/chester-zoo-act-for-wildlife/$aRaceAgainstTimeForWildLife",
    contentType = HostedContentType.Article,
    title = "A race against time for wildlife in Latin America"
  )

  private val actingForWildlifeInAfricaPage: NextHostedPage = NextHostedPage(
    imageUrl = "https://media.guim.co.uk/9d471141fae4c716f27f56de088a87af3b932031/0_71_2048_1229/500.jpg",
    pageUrl = s"$host/advertiser-content/chester-zoo-act-for-wildlife/$actingForWildlifeInAfrica",
    contentType = HostedContentType.Article,
    title = "Acting for wildlife in Africa"
  )

  private val theRoleOfZoosInSavingWildlifePage: NextHostedPage = NextHostedPage(
    imageUrl = "https://media.guim.co.uk/6ad6b68ed5dcc5bc6e370f39b69063b533ce7627/0_23_2019_1211/500.jpg",
    pageUrl = s"$host/advertiser-content/chester-zoo-act-for-wildlife/$theRoleOfZoosInSavingWildlife",
    contentType = HostedContentType.Article,
    title = "The role of zoos in saving wildlife"
  )



  private val takeTheSustainablePalmOilChallengePage: NextHostedPage = NextHostedPage(
    imageUrl = "https://media.guim.co.uk/838d447bf7432026f73ee1244bfd1717e9f6a848/0_68_2048_1229/500.jpg",
    pageUrl = s"$host/advertiser-content/chester-zoo-act-for-wildlife/$takeTheSustainablePalmOilChallenge",
    contentType = HostedContentType.Article,
    title = "Take the sustainable Palm Oil challenge"
  )

  private val makingWildlifeFriendlyHabitatsPage: NextHostedPage = NextHostedPage(
    imageUrl = "http://media.guim.co.uk/a4cf689f63c6840021b04a51e7ec55e3edde45d8/238_0_2134_1281/500.jpg",
    pageUrl = s"$host/advertiser-content/chester-zoo-act-for-wildlife/$makingWildlifeFriendlyHabitats",
    contentType = HostedContentType.Video,
    title = "Making wildlife friendly habitats"
  )

  private val helpPutAStopToTheIllegalWildlifeTradePage: NextHostedPage = NextHostedPage(
    imageUrl = "http://media.guim.co.uk/ddafbbdf638514dcbdba961e121115ab94e3af4a/199_2_1347_809/500.jpg",
    pageUrl = s"$host/advertiser-content/chester-zoo-act-for-wildlife/$helpPutAStopToTheIllegalWildlifeTrade",
    contentType = HostedContentType.Video,
    title = "Help put a stop to the illegal wildlife trade"
  )

  private val whatWeFightForPage: NextHostedPage = NextHostedPage(
    imageUrl = "http://media.guim.co.uk/85af2fd7ebb0731771e7e964bdced1adb1b1606b/0_51_2048_1228/500.jpg",
    pageUrl = s"$host/advertiser-content/chester-zoo-act-for-wildlife/$whatWeFightFor",
    contentType = HostedContentType.Gallery,
    title = "What we fight for"
  )


  private val pageMap = Map(
    whatIsActForWildlife -> whatIsActForWildlifePage,
    savingOragutansFromExtinction -> savingOragutansFromExtinctionPage,
    conservationStartsCloserToHome -> conservationStartsCloserToHomePage,
    savingWildlifeFromTheBrink -> savingWildlifeFromTheBrinkPage,
    ensuringAFutureForSouthAsianWildlife -> ensuringAFutureForSouthAsianWildlifePage,
    aRaceAgainstTimeForWildLife -> aRaceAgainstTimeForWildLifePage,
    actingForWildlifeInAfrica -> actingForWildlifeInAfricaPage,
    theRoleOfZoosInSavingWildlife -> theRoleOfZoosInSavingWildlifePage,
    takeTheSustainablePalmOilChallenge -> takeTheSustainablePalmOilChallengePage,
    makingWildlifeFriendlyHabitats -> makingWildlifeFriendlyHabitatsPage,
    helpPutAStopToTheIllegalWildlifeTrade -> helpPutAStopToTheIllegalWildlifeTradePage,
    whatWeFightFor -> whatWeFightForPage
  )

  private val videos = List(whatIsActForWildlife, makingWildlifeFriendlyHabitats, helpPutAStopToTheIllegalWildlifeTrade)
  private val articles = List(savingOragutansFromExtinction, savingWildlifeFromTheBrink, aRaceAgainstTimeForWildLife, takeTheSustainablePalmOilChallenge)
  private val articlesWithVideo = List(conservationStartsCloserToHome, ensuringAFutureForSouthAsianWildlife, actingForWildlifeInAfrica, theRoleOfZoosInSavingWildlife)

  private def allLivePagesOrdered = List(
    whatIsActForWildlife,
    savingOragutansFromExtinction,
    conservationStartsCloserToHome,
    savingWildlifeFromTheBrink,
    ensuringAFutureForSouthAsianWildlife,
    aRaceAgainstTimeForWildLife,
    actingForWildlifeInAfrica,
    theRoleOfZoosInSavingWildlife,
    takeTheSustainablePalmOilChallenge,
    makingWildlifeFriendlyHabitats,
    helpPutAStopToTheIllegalWildlifeTrade,
    whatWeFightFor
  ) filter(page => {
    if(videos.contains(page)){
      Switches.showChesterZooVideos.isSwitchedOn
    } else if(articles.contains(page)){
      Switches.showChesterZooArticles.isSwitchedOn
    } else if(articlesWithVideo.contains(page)){
      Switches.showChesterZooArticlesWithVideo.isSwitchedOn
    } else {
      Switches.showChesterZooGallery.isSwitchedOn
    }
  })

  def nextPages(pageName: String, contentType: Option[HostedContentType.Value] = None): List[NextHostedPage] = {
    val orderedPages: List[String] = allLivePagesOrdered.filter(pn => if(contentType.isDefined) pageMap(pn).contentType == contentType.get else true)
    val index: Int = if(orderedPages.contains(pageName)) orderedPages.indexOf(pageName) else if (orderedPages.nonEmpty) orderedPages.length - 1 else 0
    val length: Int = if(orderedPages.nonEmpty) orderedPages.length else 1
    val nextIndex = (index + 1) % length
    val nextNextIndex = (index + 2) % length

    List(nextIndex, nextNextIndex).filter(_ != index).map(orderedPages(_)).map(pageMap)
  }

  private def galleryPage: HostedGalleryPage = HostedGalleryPage(
    campaign = campaign,
    images = images,
    pageUrl = whatWeFightForPage.pageUrl,
    pageName = whatWeFightFor,
    title = whatWeFightForPage.title,
    cta = cta,
    nextPagesList = nextPages(whatWeFightFor),
    standfirst = "Right now, Chester Zoo is acting for wildlife in over 30 different countries to help protect some of the world’s most endangered wildlife from extinction",
    shortSocialShareText = Some("Right now, #ChesterZoo is working around the world to save endangered wildlife from extinction #ActforWildlife")
  )

  def fromPageName(pageName: String): Option[HostedPage] = {
    pageName match {
      case `whatWeFightFor` if Switches.showChesterZooGallery.isSwitchedOn => Some(galleryPage)
      case _ => None
    }
  }
}
