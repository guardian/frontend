package views.support

import com.gu.contentapi.client.model.v1.{Asset => ApiAsset, Content => ApiContent, Element => ApiElement, Tag => ApiTag, _}
import common.Edition
import common.editions.Uk
import conf.Configuration
import model._
import org.jsoup.Jsoup
import org.scalatest.{FlatSpec, Matchers}
import play.api.mvc.RequestHeader
import play.api.test.FakeRequest
import test.TestRequest
import org.scalatestplus.play.OneAppPerSuite

import scala.collection.JavaConversions._
import scala.xml.XML

class TemplatesTest extends FlatSpec with Matchers with OneAppPerSuite {

  "RemoveOuterPara" should "remove outer paragraph tags" in {
    RemoveOuterParaHtml(" <P> foo <b>bar</b> </p> ").body should be(" foo <b>bar</b> ")
  }

  it should "not modify text that is not enclosed in p tags" in {
    RemoveOuterParaHtml("  foo <b>bar</b>").body should be("  foo <b>bar</b>")
  }

  "typeOrTone" should "ignore Article and find Video" in {
    val tags = Tags(tags = Seq(
        Tag.make(tag(id = "type/article", tagType = TagType.Type)),
        Tag.make(tag(id = "tone/foo", tagType = TagType.Tone)),
        Tag.make(tag(id = "type/video", tagType = TagType.Type))
      ))

    tags.typeOrTone.get.id should be("type/video")
  }

  it should "find tone when only content type is Article" in {
    val tags = Tags(tags = Seq(
        Tag.make(tag(id = "type/article", tagType = TagType.Type)),
        Tag.make(tag(id = "tone/foo", tagType = TagType.Tone))
      ))
    tags.typeOrTone.get.id should be("tone/foo")
  }

  "PictureCleaner" should "correctly format inline pictures" in {
    implicit val request: RequestHeader = TestRequest()
    val body = Jsoup.parse(withJsoup(bodyTextWithInlineElements)(PictureCleaner(testContent, amp = false)).body)

    val figures = body.getElementsByTag("figure")

    val inlineImg = figures.get(0)
    inlineImg.hasClass("img--inline") should be (true)
    inlineImg.getElementsByTag("img").hasClass("gu-image") should be (true)
    inlineImg.attr("data-media-id") should be ("gu-image-1")
    inlineImg.previousElementSibling.hasClass("previous-element") should be (true)

    val landscapeImg = figures.get(3)
    landscapeImg.hasClass("img--landscape") should be (true)
    landscapeImg.getElementsByTag("img").hasClass("gu-image") should be (true)
    landscapeImg.attr("data-media-id") should be ("gu-image-4")

    val portraitImg = figures.get(4)
    portraitImg.hasClass("img--portrait") should be (true)
    portraitImg.getElementsByTag("img").hasClass("gu-image") should be (true)
    portraitImg.getElementsByTag("img").hasAttr("height") should be (false) // we remove the height attribute
    portraitImg.attr("data-media-id") should be ("gu-image-5")
    portraitImg.nextElementSibling.hasClass("following-element") should be (true)

    for {fig <- figures} {
      fig.attr("itemprop") should be ("associatedMedia image")
      fig.attr("itemscope") should be ("")
      fig.attr("itemtype") should be ("http://schema.org/ImageObject")
    }

    for { caption <- body.getElementsByTag("figcaption") } {
      caption.attr("itemprop") should be("description")
      caption.text should include("test caption")
    }
  }

  "InBodyLinkCleaner" should "clean links" in {
    implicit val edition = Uk
    implicit val request = FakeRequest("GET", "/")

    val body = XML.loadString(withJsoup(bodyTextWithLinks)(InBodyLinkCleaner("in body link")).body.trim)

    val link = (body \\ "a").head

    (link \ "@href").text should be (s"${Configuration.site.host}/section/2011/jan/01/words-for-url")

  }

  "BlockCleaner" should "insert block ids in minute by minute content" in {

    val body = withJsoup(bodyWithBlocks)(BlockNumberCleaner).body.trim

    body should include("""<span id="block-14">some heading</span>""")
    body should include("""<p id="block-1">some more text</p>""")
  }

  "BulletCleaner" should "format all bullets by wrapping in a span" in {
    BulletCleaner("<p>Foo bar • foo</p>") should be("<p>Foo bar <span class=\"bullet\">•</span> foo</p>")
  }

  "DropCap" should "add the dropcap span to the first letter of the first paragraph" in {
    val body = withJsoup(bodyWithoutInlines)(DropCaps(true, false)).body.trim
    body should include ("""<span class="drop-cap__inner">""")
  }

  it should "not add the dropcap span when the paragraph is does not begin with a letter" in {
    val body = withJsoup(bodyWithMarkup)(DropCaps(true, false)).body.trim
    body should not include ("""<span class="drop-cap__inner">""")
  }

  it should "not add the dropcap span when first body element is not a paragraph" in {
    val body = withJsoup(bodyWithHeadingBeforePara)(DropCaps(true, false)).body.trim
    body should not include ("""<span class="drop-cap__inner">""")
  }

  it should "not add the dropcap span when when the article is not a feature" in {
    val body = withJsoup(bodyWithoutInlines)(DropCaps(false, false)).body.trim
    body should not include ("""<span class="drop-cap__inner">""")
  }

  it should "add the dropcap span when the paragraph begins with a double quote mark" in {
    val body = withJsoup(bodyStartsWithDoubleQuote)(DropCaps(true, false)).body.trim
    body should include ("""<span class="drop-cap__inner">“S</span>""")
  }

  "RowInfo" should "add row info to a sequence" in {

    val items = Seq("a", "b", "c", "d")

    items.zipWithRowInfo should be(Seq(
      ("a", RowInfo(1)), ("b", RowInfo(2)), ("c", RowInfo(3)), ("d", RowInfo(4, true))
    ))

  }

  it should "correctly understand row position" in {
    val first = RowInfo(1)
    first.isFirst should be(true)
    first.isLast should be(false)
    first.isEven should be(false)
    first.isOdd should be(true)
    first.rowClass should be("first odd")

    val second = RowInfo(2)
    second.isFirst should be(false)
    second.isLast should be(false)
    second.isEven should be(true)
    second.isOdd should be(false)
    second.rowClass should be("even")

    val last = RowInfo(7, true)
    last.isFirst should be(false)
    last.isLast should be(true)
    last.isEven should be(false)
    last.isOdd should be(true)
    last.rowClass should be("last odd")
  }

  "StripHtmlTags" should "strip html from string" in {
    StripHtmlTags("<a href=\"www.guardian.co.uk\">Foo <b>Bar</b></a>") should be("Foo Bar")
  }

  it should "convert to html entities" in {
    StripHtmlTags("This is \"sarcasm\" & so is \"this\"") should be("This is &quot;sarcasm&quot; &amp; so is &quot;this&quot;")
  }

  private def tag(name: String = "name", tagType: TagType = TagType.Keyword, id: String = "/id") = {
    ApiTag(id = id, `type` = tagType, webTitle = name,
      sectionId = None, sectionName = None, webUrl = "weburl", apiUrl = "apiurl", references = Nil)
  }

  val bodyTextWithInlineElements = """
  <span>
    <p class='previous-element'>more than hearty breakfast we asked if the hotel could find out if nearby Fraserburgh was open. "Yes, but bring your own snorkel," was the response. How could we resist?</p>

    <figure data-media-id="gu-image-1">
      <img src='http://www.a.b.c/img3' alt='Meldrum House in Oldmeldrum\n' width='140' height='84' class='gu-image'/>
    </figure>

     <figure data-media-id="gu-image-2">
       <img src='http://www.a.b.c/img.jpg' alt='Meldrum House in Oldmeldrum\n' width='250' height='100' class='gu-image'/>
       <figcaption></figcaption>
     </figure>


     <figure data-media-id="gu-image-3">
       <img src='http://www.a.b.c/img2.jpg' alt='Meldrum House in Oldmeldrum\n' width='600' height='180' class='gu-image'/>
       <figcaption>Image caption</figcaption>
     </figure>


     <figure data-media-id="gu-image-4">
       <img src='http://www.a.b.c/img2.jpg' alt='Meldrum House in Oldmeldrum\n' width='500' height='100' class='gu-image'/>
       <figcaption>Image caption</figcaption>
     </figure>


     <figure data-media-id="gu-image-5">
       <img src='http://www.a.b.c/img2.jpg' alt='Meldrum House in Oldmeldrum\n' width='500' height='700' class='gu-image'/>
       <figcaption>Image caption</figcaption>
     </figure>

    <p class='following-element'>But first to <a href="http://www.glengarioch.com/verify.php" title="">Glen Garioch distillery</a></p>
  </span>
                                   """

  private def asset(caption: String, width: Int, height: Int, mediaId: String): ApiAsset = {
    ApiAsset(AssetType.Image, Some("image/jpeg"), Some("http://www.foo.com/bar"), Some(AssetFields(
      caption = Some(caption),
      width = Some(width),
      height = Some(height),
      mediaId = Some(mediaId)
    )))
  }

  val testImages: List[ApiElement] = List(
    ApiElement("gu-image-1", "body", ElementType.Image, Some(0), List(asset("test caption", 140, 100, "gu-image-1"))),
    ApiElement("gu-image-2", "body", ElementType.Image, Some(0), List(asset("test caption", 250, 100, "gu-image-2"))),
    ApiElement("gu-image-3", "body", ElementType.Image, Some(0), List(asset("test caption", 600, 100, "gu-image-3"))),
    ApiElement("gu-image-4", "body", ElementType.Image, Some(0), List(asset("test caption", 500, 100, "gu-image-4"))),
    ApiElement("gu-image-5", "body", ElementType.Image, Some(0), List(asset("test caption", 500, 700, "gu-image-5")))
  )

  val testContent = {
    val content = Content.make(ApiContent(
      id = "foo/2012/jan/07/bar",
      sectionId = None,
      sectionName = None,
      webPublicationDate = None,
      webTitle = "Some article",
      webUrl = "http://www.guardian.co.uk/foo/2012/jan/07/bar",
      apiUrl = "http://content.guardianapis.com/foo/2012/jan/07/bar",
      fields = Some(ContentFields(shortUrl = Some("http://gu.com/p/439az"))),
      elements = Some(testImages)
    ))
    Article.make(content)
  }

  val bodyTextWithLinks = """
    <p>bar <a href="http://www.theguardian.com/section/2011/jan/01/words-for-url">the link</a></p>
                          """

  val bodyWithBlocks = """<body>
      <!-- Block 14 --><span>some heading</span><p>some text</p>
      <!-- Block 1 --><p>some more text</p>
    </body>"""

  val bodyWithoutInlines =
    """
      <body>
        <p>Before Twitter, Whisper and Snapchat there was the Blog – the platform that made it possible for non-techies to publish on the internet. And if you grew up in the 90s, chances are you probably had one at some point – a Livejournal, a Blogger, a Wordpress or Diaryland. </p> <p>This year, the Blog turns 20. To mark the anniversary of the medium, we asked three blogging pioneers to look back on the transformation of the medium over the past two decades, and share their thoughts on new platforms like Snapchat and Twitter.</p> <p><strong>Dave Winer</strong> is an American <a href=\"http://en.wikipedia.org/wiki/Dave_Winer\">software developer</a>, entrepreneur and writer in New York City. He is noted for his contributions to outliners, scripting, content management and web services, as well as blogging and podcasting. He writes regularly at <a href=\"scripting.com\">Scripting News</a>, which he started in 1997.</p> <p><strong>Meg Hourihan</strong> has lived and worked on the web for nearly twenty years. As the co-founder of <a href=\"http://blogger.com/\">Blogger.com</a>, she lead the development of the seminal blogging tool acquired by Google in 2004. As the New York City-based mother of two young children, she regrets that she doesn't update <a href=\"http://www.megnut.com/\">www.megnut.com</a> nearly as much as she used to.</p> <p><strong>Justin Hall</strong> is a writer and entrepreneur. In 1994, Hall began publishing Justin's Links from the Underground, an early personal web site. In 2007 Hall lead a team making PMOG – a massively multiplayer online game layered on top of web surfing. Today Justin lives in San Francisco and publishes personal videos at <a href=\"http://links.net/\">http://links.net/</a>.</p>
        <h2><strong>Who were you when you first started blogging? What was going on in your life?</strong></h2> <p><strong>DW:</strong> I was 39 when I started blogging. My life was more or less empty – I had sold my company, was well-off financially, and had just broken up in a long-term relationship. I was looking for something to do, and a friend, Sally Atkins, urged me to learn about the web. It was everything I had been looking for.<strong> If my life hadn't been empty I never would have spotted it so early.</strong></p> <p><strong>MH:</strong> I was 27. I’d started <a href=\"http://en.wikipedia.org/wiki/Pyra_Labs\">Pyra</a> (out of which came Blogger) six months earlier and I was in love with everything about the web and programming. My friends were too. The web was an open place where we shared everything. <strong>The web is no longer the small village where I grew up; it’s a megalopolis.</strong> I have two kids now, and though I feel the urge to share and write, I don’t make the time. The web is a part of me and who I am, but I don’t need to be online anymore. Actually it dawns on me that like Dave, I was lonely, and it helped me connect with people who liked the web and writing and computers. Now I like being offline for a week in the woods, alone!</p> <p><strong>JH:</strong> I started writing on the web in 1994 when I was 19 years old. I was fascinated by sex, psychedelic drugs and uptempo music with anarchic lyrics. I was attending Swarthmore College near Philadelphia, and I spent my summers in San Francisco getting closer to the heart of the web content machine. My headlong enthusiasm for the internet in those early days lead me to a number of similar folks who ended up inexorably altering my life. I grew through their friendship and mentoring, I studied their community-building ethic, and I flourished amidst their encouragement of eccentricity. </p>
      </body>
    """

  val bodyStartsWithOneLetter =
    """
      <body>
        <p>I am Twitter, Whisper and Snapchat there was the Blog – the platform that made it possible for non-techies to publish on the internet. And if you grew up in the 90s, chances are you probably had one at some point – a Livejournal, a Blogger, a Wordpress or Diaryland. </p> <p>This year, the Blog turns 20. To mark the anniversary of the medium, we asked three blogging pioneers to look back on the transformation of the medium over the past two decades, and share their thoughts on new platforms like Snapchat and Twitter.</p> <p><strong>Dave Winer</strong> is an American <a href=\"http://en.wikipedia.org/wiki/Dave_Winer\">software developer</a>, entrepreneur and writer in New York City. He is noted for his contributions to outliners, scripting, content management and web services, as well as blogging and podcasting. He writes regularly at <a href=\"scripting.com\">Scripting News</a>, which he started in 1997.</p> <p><strong>Meg Hourihan</strong> has lived and worked on the web for nearly twenty years. As the co-founder of <a href=\"http://blogger.com/\">Blogger.com</a>, she lead the development of the seminal blogging tool acquired by Google in 2004. As the New York City-based mother of two young children, she regrets that she doesn't update <a href=\"http://www.megnut.com/\">www.megnut.com</a> nearly as much as she used to.</p> <p><strong>Justin Hall</strong> is a writer and entrepreneur. In 1994, Hall began publishing Justin's Links from the Underground, an early personal web site. In 2007 Hall lead a team making PMOG – a massively multiplayer online game layered on top of web surfing. Today Justin lives in San Francisco and publishes personal videos at <a href=\"http://links.net/\">http://links.net/</a>.</p>
        <h2><strong>Who were you when you first started blogging? What was going on in your life?</strong></h2> <p><strong>DW:</strong> I was 39 when I started blogging. My life was more or less empty – I had sold my company, was well-off financially, and had just broken up in a long-term relationship. I was looking for something to do, and a friend, Sally Atkins, urged me to learn about the web. It was everything I had been looking for.<strong> If my life hadn't been empty I never would have spotted it so early.</strong></p> <p><strong>MH:</strong> I was 27. I’d started <a href=\"http://en.wikipedia.org/wiki/Pyra_Labs\">Pyra</a> (out of which came Blogger) six months earlier and I was in love with everything about the web and programming. My friends were too. The web was an open place where we shared everything. <strong>The web is no longer the small village where I grew up; it’s a megalopolis.</strong> I have two kids now, and though I feel the urge to share and write, I don’t make the time. The web is a part of me and who I am, but I don’t need to be online anymore. Actually it dawns on me that like Dave, I was lonely, and it helped me connect with people who liked the web and writing and computers. Now I like being offline for a week in the woods, alone!</p> <p><strong>JH:</strong> I started writing on the web in 1994 when I was 19 years old. I was fascinated by sex, psychedelic drugs and uptempo music with anarchic lyrics. I was attending Swarthmore College near Philadelphia, and I spent my summers in San Francisco getting closer to the heart of the web content machine. My headlong enthusiasm for the internet in those early days lead me to a number of similar folks who ended up inexorably altering my life. I grew through their friendship and mentoring, I studied their community-building ethic, and I flourished amidst their encouragement of eccentricity. </p>
      </body>
    """

  val bodyWithMarkup =
    """
      <body>
        <p><strong>Before</strong> Twitter, Whisper and Snapchat there was the Blog – the platform that made it possible for non-techies to publish on the internet. And if you grew up in the 90s, chances are you probably had one at some point – a Livejournal, a Blogger, a Wordpress or Diaryland. </p> <p>This year, the Blog turns 20. To mark the anniversary of the medium, we asked three blogging pioneers to look back on the transformation of the medium over the past two decades, and share their thoughts on new platforms like Snapchat and Twitter.</p> <p><strong>Dave Winer</strong> is an American <a href=\"http://en.wikipedia.org/wiki/Dave_Winer\">software developer</a>, entrepreneur and writer in New York City. He is noted for his contributions to outliners, scripting, content management and web services, as well as blogging and podcasting. He writes regularly at <a href=\"scripting.com\">Scripting News</a>, which he started in 1997.</p> <p><strong>Meg Hourihan</strong> has lived and worked on the web for nearly twenty years. As the co-founder of <a href=\"http://blogger.com/\">Blogger.com</a>, she lead the development of the seminal blogging tool acquired by Google in 2004. As the New York City-based mother of two young children, she regrets that she doesn't update <a href=\"http://www.megnut.com/\">www.megnut.com</a> nearly as much as she used to.</p> <p><strong>Justin Hall</strong> is a writer and entrepreneur. In 1994, Hall began publishing Justin's Links from the Underground, an early personal web site. In 2007 Hall lead a team making PMOG – a massively multiplayer online game layered on top of web surfing. Today Justin lives in San Francisco and publishes personal videos at <a href=\"http://links.net/\">http://links.net/</a>.</p>
        <h2><strong>Who were you when you first started blogging? What was going on in your life?</strong></h2> <p><strong>DW:</strong> I was 39 when I started blogging. My life was more or less empty – I had sold my company, was well-off financially, and had just broken up in a long-term relationship. I was looking for something to do, and a friend, Sally Atkins, urged me to learn about the web. It was everything I had been looking for.<strong> If my life hadn't been empty I never would have spotted it so early.</strong></p> <p><strong>MH:</strong> I was 27. I’d started <a href=\"http://en.wikipedia.org/wiki/Pyra_Labs\">Pyra</a> (out of which came Blogger) six months earlier and I was in love with everything about the web and programming. My friends were too. The web was an open place where we shared everything. <strong>The web is no longer the small village where I grew up; it’s a megalopolis.</strong> I have two kids now, and though I feel the urge to share and write, I don’t make the time. The web is a part of me and who I am, but I don’t need to be online anymore. Actually it dawns on me that like Dave, I was lonely, and it helped me connect with people who liked the web and writing and computers. Now I like being offline for a week in the woods, alone!</p> <p><strong>JH:</strong> I started writing on the web in 1994 when I was 19 years old. I was fascinated by sex, psychedelic drugs and uptempo music with anarchic lyrics. I was attending Swarthmore College near Philadelphia, and I spent my summers in San Francisco getting closer to the heart of the web content machine. My headlong enthusiasm for the internet in those early days lead me to a number of similar folks who ended up inexorably altering my life. I grew through their friendship and mentoring, I studied their community-building ethic, and I flourished amidst their encouragement of eccentricity. </p>
      </body>
    """

  val bodyWithHeadingBeforePara =
    """
      <body>
        <h2>The recipe</h2><p>Season four chicken thighs then brown them on  both sides in a little oil  in a casserole or heavy  deep-sided pan. Roughly chop and thoroughly wash two small leeks. Lift out the browned thighs and set aside, then tip the chopped leeks into the pan and let them soften over a low heat, stirring regularly so they do not brown. Return the chicken thighs to the pan, pour over  a litre of chicken stock, and leave to simmer for about 20 minutes.</p><p>Remove the pods from 450g of broad beans. Break 50g of linguine into short lengths (about 2cm)  and add to the pan, turning the heat up so the liquid boils, then cook for  eight or nine minutes until the pasta is cooked. A few minutes before the pasta is ready, add the podded beans and 200g (shelled weight) of peas to the soup. Finish with a good handful of freshly chopped parsley, check the seasoning and serve. Serves 2.</p><p></p><h2>The trick</h2><p>Brown the chicken thoroughly, a little more than usual, so the caramelised notes enrich the stock. The chicken pieces will also look better that way. You can use chicken or vegetable stock for this. I like to lift the chicken out of the cooking liquor before  I add the pasta, then return it just as the pasta is ready. It won't come to grief if you leave it in, but by removing the chicken you will reduce the risk of overcooking.</p><p></p><h2>The twist</h2><p>Instead of broad beans, use green French beans, chopped into short lengths, like the pasta. Add a hit  of lemon by adding lemon thyme  and a good tablespoon of chopped  leaves. At the last moment, fold  a handful of young spinach or garlic leaves into the stock.</p>
      </body>
    """

  val bodyStartsWithDoubleQuote =
    """
      <body>
        <p>“Season four chicken thighs then brown them on  both sides in a little oil  in a casserole or heavy  deep-sided pan.” Roughly chop and thoroughly wash two small leeks. Lift out the browned thighs and set aside, then tip the chopped leeks into the pan and let them soften over a low heat, stirring regularly so they do not brown. Return the chicken thighs to the pan, pour over  a litre of chicken stock, and leave to simmer for about 20 minutes.</p><p>Remove the pods from 450g of broad beans. Break 50g of linguine into short lengths (about 2cm)  and add to the pan, turning the heat up so the liquid boils, then cook for  eight or nine minutes until the pasta is cooked. A few minutes before the pasta is ready, add the podded beans and 200g (shelled weight) of peas to the soup. Finish with a good handful of freshly chopped parsley, check the seasoning and serve. Serves 2.</p><p></p><h2>The trick</h2><p>Brown the chicken thoroughly, a little more than usual, so the caramelised notes enrich the stock. The chicken pieces will also look better that way. You can use chicken or vegetable stock for this. I like to lift the chicken out of the cooking liquor before  I add the pasta, then return it just as the pasta is ready. It won't come to grief if you leave it in, but by removing the chicken you will reduce the risk of overcooking.</p><p></p><h2>The twist</h2><p>Instead of broad beans, use green French beans, chopped into short lengths, like the pasta. Add a hit  of lemon by adding lemon thyme  and a good tablespoon of chopped  leaves. At the last moment, fold  a handful of young spinach or garlic leaves into the stock.</p>
      </body>
    """

}
