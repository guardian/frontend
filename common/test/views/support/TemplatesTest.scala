package views.support

import com.gu.openplatform.contentapi.model.{Tag => ApiTag, Element => ApiElement, Asset => ApiAsset}
import model._
import org.scalatest.{ Matchers, FlatSpec }
import xml.XML
import common.editions.Uk
import conf.Configuration
import org.jsoup.Jsoup

class TemplatesTest extends FlatSpec with Matchers {

  "RemoveOuterPara" should "remove outer paragraph tags" in {
    RemoveOuterParaHtml(" <P> foo <b>bar</b> </p> ").body should be(" foo <b>bar</b> ")
  }

  it should "not modify text that is not enclosed in p tags" in {
    RemoveOuterParaHtml("  foo <b>bar</b>").body should be("  foo <b>bar</b>")
  }

  "typeOrTone" should "ignore Article and find Video" in {
    val tags = new Tags {
      override val tags = Seq(
        Tag(tag(id = "type/article", tagType = "type")),
        Tag(tag(id = "tone/foo", tagType = "tone")),
        Tag(tag(id = "type/video", tagType = "type"))
      )
    }
    tags.typeOrTone.get.id should be("type/video")
  }

  it should "find tone when only content type is Article" in {
    val tags = new Tags {
      override val tags = Seq(
        Tag(tag(id = "type/article", tagType = "type")),
        Tag(tag(id = "tone/foo", tagType = "tone"))
      )
    }
    tags.typeOrTone.get.id should be("tone/foo")
  }

  "Inflector" should "singularize tag name" in {
    Tag(tag("Minute by minutes")).singularName should be("Minute by minute")
    Tag(tag("News")).singularName should be("News")
  }

  it should "pluralize tag name" in {
    Tag(tag("Article")).pluralName should be("Articles")
  }

  "javaScriptVariableName" should "create a sensible Javascript name" in {

    JavaScriptVariableName("web-publication-date") should be("webPublicationDate")
    JavaScriptVariableName("series") should be("series")
  }

  "PictureCleaner" should "correctly format inline pictures" in {

    val body = XML.loadString(withJsoup(bodyTextWithInlineElements)(PictureCleaner(bodyImages)).body.trim)

    val figures = (body \\ "figure").toList

    val baseImg = figures(0)
    (baseImg \ "@class").text should include("img--base img--inline")
    (baseImg \ "img" \ "@class").text should be("gu-image")
    (baseImg \ "img" \ "@width").text should be("140")

    val medianImg = figures(1)
    (medianImg \ "@class").text should include("img--median")
    (medianImg \ "img" \ "@class").text should be("gu-image")
    (medianImg \ "img" \ "@width").text should be("250")

    val extendedImg = figures(2)
    (extendedImg \ "@class").text should include("img--extended")
    (extendedImg \ "img" \ "@class").text should be("gu-image")
    (extendedImg \ "img" \ "@width").text should be("600")

    val landscapeImg = figures(3)
    (landscapeImg \ "@class").text should include("img--landscape")
    (landscapeImg \ "img" \ "@class").text should be("gu-image")
    (landscapeImg \ "img" \ "@width").text should be("500")

    val portaitImg = figures(4)
    (portaitImg \ "@class").text should include("img--portrait")
    (portaitImg \ "img" \ "@class").text should be("gu-image")
    (portaitImg \ "img" \ "@height").text should be("700")

    (body \\ "figure").foreach { fig =>
      (fig \ "@itemprop").text should be("associatedMedia")
      (fig \ "@itemscope").text should be("")
      (fig \ "@itemtype").text should be("http://schema.org/ImageObject")
    }

    (body \\ "figcaption").foreach { fig =>
      (fig \ "@itemprop").text should be("description")
      (fig).text should include("Image caption")
    }
  }

  "InBodyLinkCleaner" should "clean links" in {
    val body = XML.loadString(withJsoup(bodyTextWithLinks)(InBodyLinkCleaner("in body link")(Uk)).body.trim)

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

  "InlineSlotGenerator" should "insert slots" in {
    val body = Jsoup.parseBodyFragment(withJsoup(bodyWithoutInlines)(InlineSlotGenerator(351)).body)
    body.select(".slot").size should be > 0
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

  private def tag(name: String = "name", tagType: String = "keyword", id: String = "/id") = {
    ApiTag(id = id, `type` = tagType, webTitle = name,
      sectionId = None, sectionName = None, webUrl = "weburl", apiUrl = "apiurl", references = Nil)
  }

  val bodyTextWithInlineElements = """
  <span>
    <p>more than hearty breakfast we asked if the hotel could find out if nearby Fraserburgh was open. "Yes, but bring your own snorkel," was the response. How could we resist?</p>

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

    <p>But first to <a href="http://www.glengarioch.com/verify.php" title="">Glen Garioch distillery</a></p>
  </span>
                                   """

  private def asset(caption: String, width: Int, height: Int): ApiAsset = {
    ApiAsset("image", Some("image/jpeg"), Some("http://www.foo.com/bar"), Map("caption" -> caption, "width" -> width.toString, "height" -> height.toString))
  }

  val bodyImages: List[ImageElement] = List(
    new ImageElement(ApiElement("gu-image-1", "body", "image", Some(0), List(asset("caption", 140, 100))),0),
    new ImageElement(ApiElement("gu-image-2", "body", "image", Some(0), List(asset("caption", 250, 100))),0),
    new ImageElement(ApiElement("gu-image-3", "body", "image", Some(0), List(asset("caption", 600, 100))),0),
    new ImageElement(ApiElement("gu-image-4", "body", "image", Some(0), List(asset("caption", 500, 100))),0),
    new ImageElement(ApiElement("gu-image-5", "body", "image", Some(0), List(asset("caption", 500, 700))),0)
  )

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
        <p>Before Twitter, Whisper and Snapchat there was the Blog – the platform that made it possible for non-techies to publish on the internet. And if you grew up in the 90s, chances are you probably had one at some point – a Livejournal, a Blogger, a Wordpress or Diaryland. </p> <p>This year, the Blog turns 20. To mark the anniversary of the medium, we asked three blogging pioneers to look back on the transformation of the medium over the past two decades, and share their thoughts on new platforms like Snapchat and Twitter.</p> <p><strong>Dave Winer</strong> is an American <a href=\"http://en.wikipedia.org/wiki/Dave_Winer\">software developer</a>, entrepreneur and writer in New York City. He is noted for his contributions to outliners, scripting, content management and web services, as well as blogging and podcasting. He writes regularly at <a href=\"scripting.com\">Scripting News</a>, which he started in 1997.</p> <p><strong>Meg Hourihan</strong> has lived and worked on the web for nearly twenty years. As the co-founder of <a href=\"http://blogger.com/\">Blogger.com</a>, she lead the development of the seminal blogging tool acquired by Google in 2004. As the New York City-based mother of two young children, she regrets that she doesn't update <a href=\"http://www.megnut.com/\">www.megnut.com</a> nearly as much as she used to.</p> <p><strong>Justin Hall</strong> is a writer and entrepreneur. In 1994, Hall began publishing Justin's Links from the Underground, an early personal web site. In 2007 Hall lead a team making PMOG – a massively multiplayer online game layered on top of web surfing. Today Justin lives in San Francisco and publishes personal videos at <a href=\"http://links.net/\">http://links.net/</a>.</p> <h2><strong>Who were you when you first started blogging? What was going on in your life?</strong></h2> <p><strong>DW:</strong> I was 39 when I started blogging. My life was more or less empty – I had sold my company, was well-off financially, and had just broken up in a long-term relationship. I was looking for something to do, and a friend, Sally Atkins, urged me to learn about the web. It was everything I had been looking for.<strong> If my life hadn't been empty I never would have spotted it so early.</strong></p> <p><strong>MH:</strong> I was 27. I’d started <a href=\"http://en.wikipedia.org/wiki/Pyra_Labs\">Pyra</a> (out of which came Blogger) six months earlier and I was in love with everything about the web and programming. My friends were too. The web was an open place where we shared everything. <strong>The web is no longer the small village where I grew up; it’s a megalopolis.</strong> I have two kids now, and though I feel the urge to share and write, I don’t make the time. The web is a part of me and who I am, but I don’t need to be online anymore. Actually it dawns on me that like Dave, I was lonely, and it helped me connect with people who liked the web and writing and computers. Now I like being offline for a week in the woods, alone!</p> <p><strong>JH:</strong> I started writing on the web in 1994 when I was 19 years old. I was fascinated by sex, psychedelic drugs and uptempo music with anarchic lyrics. I was attending Swarthmore College near Philadelphia, and I spent my summers in San Francisco getting closer to the heart of the web content machine. My headlong enthusiasm for the internet in those early days lead me to a number of similar folks who ended up inexorably altering my life. I grew through their friendship and mentoring, I studied their community-building ethic, and I flourished amidst their encouragement of eccentricity. </p> <h2><strong>What was blogging like 20 years ago? What kind of tools did you use? What did the web mean to you?</strong></h2> <p><strong>DW:</strong> My first blog post was on October 7, 1994. I was playing around with some scripts to do stuff on the web, which was new and I found fascinating. I started out timidly at first, to see what would happen, and quickly saw how powerful this was. I could publish all on my own, and get lots of interesting people talking, and push that back out to them. <strong>It felt risky, but I loved the feeling.</strong></p> <p><strong>MH:</strong> My first post on megnut.com was May 9, 1999, and I considered that my blog. I was using a database back-end to manage entries, and <strong>I was consciously putting new posts at the top of the page, but keeping the older ones too.</strong> Before Megnut, I hand-coded entries and just over-wrote whatever was on the page. With a new domain, pictures and a database of entries, I felt like I was starting my own publication. It was incredibly empowering.</p> <p><strong><strong>JH:</strong> </strong>My first web page went live in January 1994. My first daily entry on the front page went live in January 1996. When I started writing regularly on the web, the pages were crude – basic pictures and text. Meg describes the feeling of owning a publication and it's true - blogging felt like you’d launched your own magazine. I started writing on the web because I could. Because it seemed easy. </p> <h2><strong>Do you still blog regularly? How has the experience changed since 20 years ago?</strong></h2> <p><strong>DW:</strong> Yes, I write all the time. The tools are much better, I'm a much better writer, but some of <strong>the spark of the early days is gone</strong>. I've been through a lot on the net and wear the scars proudly. The early days were naive and wonderful. Now I'm much wiser. I still have fun, but I'm far from alone, the power is more distributed.</p> <p><strong>MH:</strong> I don’t write on <a href=\"megnut.com\">megnut.com </a>much at all, but I tweet, post photos to <a href=\"http://instagram.com/megnut72\">Instagram</a> and push it all to Facebook. To me this is the same as the content I was sharing in the early days: snippets of life for myself or others. As the tools evolved, blog posts got longer and longer. I don’t write essays very often, but I still have an urge to share and connect. So, though it doesn’t look like I’m blogging in the original sense, or in the way I’ve often described it, I am sharing.</p> <p><strong>JH:</strong> Since more folks have come online, I've pulled back from sharing my first impressions of everyone I meet in a long-form poem on my web site each night. Now instead I compose my thoughts and channel those impulses on specific topics into <a href=\"../\">videos</a>. I like using videos to experiment with images + text (like the web) + sound (rare on the web) + time (unique to video!). Working with video has made my postings more precious; I don’t post as often. But I enjoy the crafting of these media objects and I’m grateful to have a chance to continue with experimental online personal storytelling.</p> <h2><strong>What do you make of recent assertions that blogging is “<a href=\"http://kottke.org/13/12/rip-the-blog-1997-2013\">dead</a>”? Do you think blogging will ever really go away?</strong></h2> <p><strong>DW: </strong>The people who say that are idiots. Blogging was never alive. It's the people that matter. There will always be a small number who are what I call \"natural born bloggers.\" They were blogging before there were blogs, they just didn't know what it was called. Julia Child was a blogger as was Benjamin Franklin and Patti Smith. <strong>I inherited my blogging gene from my mom, who is 81 and has a blog.</strong></p> <p><strong>JH:</strong> Blogging will persist the way other literary forms persist. I can imagine we’ll see articles about a resurgence in blogging in a few years, with people wondering if the post-Twitter generation now has a longer attention span. I’m smiling now as I will smile then: it’s great to see people debate what the tools mean, and how people will use them. Is Twitter blogging on a micro-scale? Does it matter? What’s amazing is that we’ve seen the explosion of citizen access to tools formerly reserved for journalists and scribes. \"Blogging as a specific online form might wax and wane. But blogging as a chance to exercise our voices doesn’t seem to be going anywhere – hurrah!</p> <p><strong>MH:</strong> I’ve always defined blogging by its structure (posts, ordered reverse-chronologically, time stamps) rather than its content, so in that way it’s as alive as ever. Nearly every media site front page is now organized that way, that’s your Facebook news feed, your Twitter/Tumblr/Instagram flow, so much information is structured that way. (Which makes me wonder, does that make those sites metablogs?) And if you define blogging as Justin and Dave do above, it’s also not dead, nor will it die. The tech will change, the devices will change, but people will still share photos and stories and experiences with one another.</p> <h2><strong>Self-expression online is now taking a turn for the temporary or disposable with things like Whisper and Snapchat. What do you make of this shift?</strong></h2> <p><strong>DW:</strong> That's totally cool. We should be trying out lots of permutations. There's lots of magic in the new communication tools, and I'm sure we've only discovered a small part of it. I think it's part of what makes us such an adaptable species, that we're always trying new stuff out. It's good that we are that way because we have enormous problems to solve, like climate change.</p> <p><strong>JH:</strong> I think of Whisper and Snapchat along the lines of email. Blogging can be done for a private audience, but mostly we think of blogging as a contribution to the knowledge commons, the shared public information space. Whisper and Snapchat are for interpersonal communications, not contributions to the knowledge commons. Not all blogging is explicitly for the knowledge commons, but it’s usually some kind of self-expression or performance of personal identity that is accessible to a broader audience.</p> <p><strong>MH:</strong> I think Justin touches something important that was a big deal in the early days: blogging vs online journaling and the public vs private nature of the communications. We used to talk a lot about that, and then people just started posting everything everywhere. Impermanence, like anonymity, has an important role to play in the ecosystem. It’s exciting to see the tools develop that allow different forms of communication with our new devices.</p>
      </body>
    """

}
