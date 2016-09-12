package common.commercial.hosted.hardcoded

import common.commercial.hosted._
import conf.Configuration.site.host

object ChesterZooHostedPages {

  private val pageName = "what-we-fight-for"

  private val campaign = HostedCampaign(
    id = "chester-zoo-act-for-wildlife",
    name = "WHAT WE FIGHT FOR",
    owner = "Chester Zoo",
    logo = HostedLogo("https://static.theguardian.com/commercial/hosted/act-for-wildlife/AFW+with+CZ+portrait+with+padding.png"),
    cssClass = "chester-zoo",
    fontColour = FontColour("#E31B22"),
    logoLink = None
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

  private def cta(pageName: String) = HostedCallToAction(
    label = Some("IT'S TIME TO ACT FOR WILDLIFE"),
    url = "http://www.actforwildlife.org.uk/"
  )

  private val galleryPage: HostedGalleryPage = HostedGalleryPage(
    campaign = campaign,
    images = images,
    pageUrl = s"$host/advertiser-content/chester-zoo-act-for-wildlife/what-we-fight-for",
    pageName = pageName,
    title = "WHAT WE FIGHT FOR",
    cta = cta(pageName),
    nextPageNames = List(),
    standfirst = "Right now, Chester Zoo is acting for wildlife in over 30 different countries to help protect some of the world’s most endangered wildlife from extinction"
  )

  def fromPageName(pageName: String): Option[HostedPage] = {
      pageName match {
        case `pageName` => Some(galleryPage)
        case _ => None
      }
  }

}
