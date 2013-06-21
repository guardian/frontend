package common

import play.api.templates.Html
import play.api.mvc.RequestHeader

object LinkTo extends Logging {

  //all content types except article (they do not have the word "article" in the url)
  val supportedContentTypes = Seq("gallery", "video")
  val unSupportedContentTypes = Seq("audio", "interactive", "poll", "quiz", "picture", "sudoku",
    "crossword", "competition", "podcast", "signup", "cartoon", "table", "graphic", "audioslideshow", "data",
    "document")

  private val domain = """http://www.(guardian.co.uk|guardiannews.com|theguardian.com)"""
  private val section = """(/[\w\d\.-]+)"""
  private val blog = section
  private val date = """(/\d\d\d\d/\w\w\w/\d\d)"""
  private val contentType = section
  private val wordsForUrl = section

  private val Front = domain.r

  private val SectionPath = section.r

  private val SectionUrl = (domain + section).r
  private val TagUrl = (domain + section + wordsForUrl).r
  private val BlogUrl = (domain + section + blog + wordsForUrl).r //also newspaper book sections e.t.c.

  private val ContentUrl = (domain + section + contentType + date + wordsForUrl).r
  private val BlogContentUrl = (domain + section + blog + contentType + date + wordsForUrl).r

  private val ArticleUrl = (domain + section + date + wordsForUrl).r
  private val ArticleBlogUrl = (domain + section + blog + date + wordsForUrl).r

  private val DiscussionLink = """.*/(discussion/comment-permalink)/.*""".r

  private val FeedArticle = """.*/(feedarticle)/.*""".r

  private object Supported {
    def unapply(s: String): Option[String] = if (supportedContentTypes.exists(_ == s.drop(1))) Some(s) else None
  }

  private object UnSupported {
    def unapply(s: String): Option[String] = if (unSupportedContentTypes.exists(_ == s.drop(1))) Some(s) else None
  }


  // TODO the Some(request) stuff is a bit ugly, but is needed till we are on single domain
  def apply(html: Html)(implicit request: RequestHeader): String = this(html.toString(), Edition(request), Some(request))
  def apply(link: String)(implicit request: RequestHeader): String = this(link, Edition(request), Some(request))

  // see http://www.scala-lang.org/node/7290
  // partial functions with Regex grow exponentially and the JVM has a max size for a method
  def apply(url: String, edition: Edition, request: Option[RequestHeader] = None): String = {
    val queryParams = url.dropWhile(_ != '?')
    val urlWithoutParams: String = url.takeWhile(_ != '?')
    val hash = urlWithoutParams.dropWhile(_ != '#')
    val urlWithoutHash: String = urlWithoutParams.takeWhile(_ != '#')
    val reslovedUrl = pageTypes(urlWithoutHash, request)(edition)
      .orElse(contentTypes(urlWithoutHash))
      .orElse(unknownUrl(urlWithoutHash))(urlWithoutHash)

    val result = reslovedUrl + queryParams + hash

    if (paramsOk(queryParams, result)) result else url

  }

  private def paramsOk(queryString: String, url: String) = {
    if (queryString.contains("mobile-redirect=false")) {
      log.debug("unsupported: url %s was a mobile redirect" format (url))
      false
    } else {
      true
    }
  }

  private def unknownUrl(url: String): PartialFunction[String, String] = {
    case unknown =>
      log.debug("unsupported: did not understand url %s" format (unknown))
      unknown
  }

  // TODO the Option[RequestHeader]) stuff is a bit ugly, but is needed till we are on single domain
  private def pageTypes(url: String, request: Option[RequestHeader])(implicit edition: Edition): PartialFunction[String, String] = {

    case Front(_) | "/" =>
      log.debug(s"supported: resolved $url as a front")
      s"/${Editionalise("", edition, request)}"

    case FeedArticle(_) =>
      log.debug("unsupported: resolved %s as a feed article" format (url))
      url

    case DiscussionLink(_) =>
      log.debug("unsupported: resolved %s as a discussion perma link" format (url))
      url

    case SectionUrl(_, section) =>
      log.debug("supported: resolved %s as a section" format (url))
      s"/${Editionalise(section.drop(1), edition, request)}"

    case SectionPath(_) =>
      log.debug(s"supported: resolved $url as a section path")
      s"/${Editionalise(url.drop(1), edition, request)}"

    case TagUrl(_, section, wordsForUrl) =>
      log.debug("supported: resolved %s as a tag" format (url))
      section + wordsForUrl

    case BlogUrl(_, section, blog, wordsForUrl) =>
      log.debug("supported: resolved %s as a blog tag" format (url))
      section + blog + wordsForUrl
  }

  private def contentTypes(url: String): PartialFunction[String, String] = {
    case ContentUrl(_, section, Supported(contentType), date, wordsForUrl) =>
      log.debug("supported: resolved %s as a %s" format (url, contentType))
      section + contentType + date + wordsForUrl

    case BlogContentUrl(_, section, blog, Supported(contentType), date, wordsForUrl) =>
      log.debug("supported: resolved %s as a %s blog" format (url, contentType))
      section + blog + contentType + date + wordsForUrl

    case ContentUrl(_, _, UnSupported(contentType), _, _) =>
      log.debug("unsupported: resolved %s as a %s" format (url, contentType))
      url

    case BlogContentUrl(_, _, _, UnSupported(contentType), _, _) =>
      log.debug("unsupported: resolved %s as a %s blog" format (url, contentType))
      url

    case ArticleUrl(_, section, date, wordsForUrl) =>
      log.debug("supported: resolved %s as an /article" format (url))
      section + date + wordsForUrl

    case ArticleBlogUrl(_, section, blog, date, wordsForUrl) =>
      log.debug("supported: resolved %s as an /article blog" format (url))
      section + blog + date + wordsForUrl
  }

}