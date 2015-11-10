package views.support.cleaner

import common.{Edition, LinkTo}
import conf.Configuration
import org.joda.time.DateTime
import org.jsoup.Jsoup
import org.jsoup.nodes.{Document, Element}
import play.api.mvc.RequestHeader
import views.support.{LinkInfo, HtmlCleaner}

import scala.collection.JavaConversions._
import scala.util.parsing.combinator._

case class InBodyLinkCleaner(dataLinkName: String, amp: Boolean = false, replicate: Boolean = false, date: Option[DateTime] = None)(implicit val edition: Edition, implicit val request: RequestHeader) extends HtmlCleaner {
  import implicits.CollectionsOps._

  def clean(body: Document): Document = {
    val links = body.getElementsByAttribute("href")

    val anchorLinks = links.filter(_.tagName == "a").toList
    anchorLinks.foreach { link =>
      link.attr("href", LinkTo(link.attr("href"), edition))
      link.attr("data-link-name", dataLinkName)
      link.attr("data-component", dataLinkName.replace(" ", "-"))
      link.addClass("u-underline")
    }

    if (replicate) {
      body.getElementsByTag("body").headOption.map { articleBody =>
        putMentionedBefore(articleBody) map { mentionedBefore =>
          replicatedLinks(body) map { linksDiv =>
            mentionedBefore.before(linksDiv)
          }
        }
      }
    }

    if (amp) {
      links.filter(_.hasAttr("style")).foreach { link =>
        link.removeAttr("style")
      }
    }

    // Prevent text in non clickable anchors from looking like links
    // <a name="foo">bar</a> -> <a name="foo"></a>bar
    val anchors = body.getElementsByAttribute("name")

    anchors.foreach { anchor =>
      if (anchor.tagName == "a") {
        val text = anchor.ownText()
        anchor.empty().after(text)
      }
    }

    body
  }

  def replicatedLinks(document: Document): Option[Element] = {
    val bodyLinks = getBodyLinks(document)
    if (bodyLinks.nonEmpty) {
      date map { date =>
        val (internalLinks, externalLinks): (List[LinkInfo], List[LinkInfo]) = bodyLinks.map { link =>
          LinkInfo(date.getMillis, UrlParser.externalDomain(link.attr("href")), link.attr("href"), link.text)
        }.partition(_.domain.isEmpty)
        val rendered = views.html.fragments.inbody.links(internalLinks, externalLinks).toString
        Jsoup.parseBodyFragment(rendered).body().child(0)
      }
    } else {
      None
    }
  }

  def getBodyLinks(document: Document): List[Element] =
    document.getElementsByTag("body").headOption.toList.flatMap { body =>
      body.children()
        .filter(_.tagName() == "p")
        .flatMap { p =>
        p.getElementsByAttribute("href")
          .filter(_.tagName == "a")
          //.filter(_.attr("href").startsWith(Configuration.site.host))
          .distinctBy(_.attr("href"))
      }

    }

  /*
  find the best place to put the mentioned... links in the article
   */
  def putMentionedBefore(element: Element): Option[Element] = {
    Some(element.children)
      .map(_.filter(_.text.endsWith(".")))
      .filter(_.size >= 2)
      .map(_.last)
  }

}


object UrlParser extends RegexParsers {
  def proto: Parser[Unit] = """([a-z]+:)?""".r ^^ { _ => () }
  def domain: Parser[String] = """//(www\.)?""".r ~> """([^/]+)""".r
  def path: Parser[Unit] = """.*""".r ^^ { _ => () }

  def userHint: Parser[String] = proto ~> domain <~ path

  def externalDomain(url: String, ourRoot: String = Configuration.site.host): Option[String] =
    Some(url)
      .filterNot(href => ourRoot.nonEmpty && (href.startsWith(ourRoot) || href.startsWith(ourRoot.split(":")(1))))
      .map(url => UrlParser.parse(UrlParser.userHint, url))
      .flatMap {
      case Success(matched, _) => Some(matched)
      case a => None
    }

}
