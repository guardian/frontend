package common.commercial

import conf.switches.Switches

object HostedGalleryTestPage {

  private val galleryTestPageName = "gallery-test"

  private val demoImages : List[HostedGalleryImage] = List(
    HostedGalleryImage (
      url = "http://static.theguardian.com/commercial/hosted/gallery-prototype/omgb1.jpg",
      title = "Finding the giants of Heligan",
      caption = "The Lost Gardens of Heligan, Cornwall, England. These gardens, along with their giants, were lost for 25 years under a tangle of weeds before being restored to take their place among the finest gardens in Great Britain."
    ),
    HostedGalleryImage (
      url = "http://static.theguardian.com/commercial/hosted/gallery-prototype/omgb2.jpg",
      title = "Rolling hills and rugged moorland",
      caption = "Malham Tarn Estate, Yorkshire Dales, England. Get your boots on and start exploring this popular Yorkshire Dales beauty spot."
    ),
    HostedGalleryImage (
      url = "http://static.theguardian.com/commercial/hosted/gallery-prototype/omgb3.jpg",
      title = "A walker’s paradise",
      caption = "Isle of Skye, Scotland. From family walks on the spectacular coastline to dramatic scrambles in the Cuillin mountains, the island provides fantastic walking for everyone. Photo by Lars Scheider"
    ),
    HostedGalleryImage (
      url = "http://static.theguardian.com/commercial/hosted/gallery-prototype/omgb4.jpg",
      title = "Walking on water",
      caption = "Loch Lomond & The Trossachs National Park, Scotland. The National Park stretches from the incredible mountains and glens of the Trossachs to the vast tranquil beauty of Loch Lomond. Photo by Bestjobers"
    ),
    HostedGalleryImage (
      url = "http://static.theguardian.com/commercial/hosted/gallery-prototype/omgb5.jpg",
      title = "Running across the plains",
      caption = "Isle of Harris, Scotland. The Isle of Harris isn’t actually an island, it’s the southern and more mountainous part of Lewis and Harris, the largest island in the Outer Hebrides. Photo by Lars Scheider"
    ),
    HostedGalleryImage (
      url = "http://static.theguardian.com/commercial/hosted/gallery-prototype/omgb6.jpg",
      title = "Relaxing at Loch Maree",
      caption = "Loch Maree, Scotland. More than 60 islands dot Loch Maree and the area is perfect for bird watching and walking."
    ),
    HostedGalleryImage (
      url = "http://static.theguardian.com/commercial/hosted/gallery-prototype/omgb7.jpg",
      title = "The ruins of Tintern Abbey",
      caption = "Monmouthshire, Wales. The ruins of this 12th-century abbey are famous for inspiring the works of notable English artists, including Romantic poet William Wordsworth and painter Thomas Gainsborough."
    ),
    HostedGalleryImage (
      url = "http://static.theguardian.com/commercial/hosted/gallery-prototype/omgb8.png",
      title = "Ride the Hogwarts Express!",
      caption = "Glenfinnan Viaduct, Scotland. The Jacobite steam train is a great way to experience the stunning scenery and special atmosphere of Glenfinnan. You may even recognise it from Harry Potter! Photo by Colin Roberts."
    )
  )

  val demoGallery: HostedGalleryPage = HostedGalleryPage(
    images = demoImages,
    pageUrl = "https://www.theguardian.com/commercial/advertiser-content/hosted-gallery/gallery-test",
    pageName = galleryTestPageName,
    title = "Great Britain - Home of Amazing Moments #OMGB",
    ctaText = "Explore our collection of unique experiences from all over Great Britain.",
    ctaLink = "http://en.omgb.com/map/",
    ctaIndex = 5,
    standfirst = "Welcome to Great Britain, a country to be explored, experienced and discovered. See for yourself and discover the moments you'll want to share.",
    logoUrl = "http://static.theguardian.com/commercial/hosted/gallery-prototype/omgb.png",
    cssClass = "gallery-test"
  )

  def fromPageName(pageName: String): Option[HostedPage] = {
    pageName match {
      case `galleryTestPageName` if Switches.hostedGalleryTest.isSwitchedOn => Some(demoGallery)
      case _ => None
    }
  }

}
