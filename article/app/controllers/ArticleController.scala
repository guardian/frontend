package controllers

import com.gu.contentapi.client.model.v1.{Content => ApiContent}
import com.gu.contentapi.client.model.v1.{BlockAttributes => ApiBlockAttributes}
import com.gu.contentapi.client.model.v1.{Block => ApiBlock}
import com.gu.contentapi.client.model.v1.{Blocks => ApiBlocks}
import com.gu.contentapi.client.model.ItemResponse
import com.gu.util.liveblogs.{Block, BlockToText}
import common._
import model.liveblog.LiveBlogDate
import conf.LiveContentApi.getResponse
import conf._
import conf.switches.Switches
import conf.switches.Switches.LongCacheSwitch
import liveblog.BodyBlocks
import model._
import org.joda.time.DateTime
import org.jsoup.nodes.Document
import performance.MemcachedAction
import play.api.libs.functional.syntax._
import play.api.libs.json.{Json, _}
import play.api.mvc._
import services.{Event => NecMergiturHackEvent, NecMergiturHackAgent}
import views.BodyCleaner
import views.support._

import scala.collection.JavaConversions._
import scala.concurrent.Future

trait PageWithStoryPackage extends ContentPage {
  def article: Article
  def related: RelatedContent
  override lazy val item = article
}

case class ArticlePage(article: Article, related: RelatedContent) extends PageWithStoryPackage
case class LiveBlogPage(article: Article, related: RelatedContent) extends PageWithStoryPackage

object ArticleController extends Controller with RendersItemResponse with Logging with ExecutionContexts {

  private def isSupported(c: ApiContent) = c.isArticle || c.isLiveBlog || c.isSudoku
  override def canRender(i: ItemResponse): Boolean = i.content.exists(isSupported)
  override def renderItem(path: String)(implicit request: RequestHeader): Future[Result] = mapModel(path, blocks = true)(render(path, _, None))

  private def renderLatestFrom(page: PageWithStoryPackage, lastUpdateBlockId: String)(implicit request: RequestHeader) = {
      val html = withJsoup(BodyCleaner(page.article, page.article.fields.body, amp = false)) {
        new HtmlCleaner {
          def clean(d: Document): Document = {
            val blocksToKeep = d.getElementsByTag("div") takeWhile {
              _.attr("id") != lastUpdateBlockId
            }
            val blocksToDrop = d.getElementsByTag("div") drop blocksToKeep.size

            blocksToDrop foreach {
              _.remove()
            }
            d
          }
        }
      }
      Cached(page)(JsonComponent(html))
  }

  case class TextBlock(
    id: String,
    title: Option[String],
    publishedDateTime: DateTime,
    lastUpdatedDateTime: Option[DateTime],
    body: String
    )

  implicit val blockWrites = (
    (__ \ "id").write[String] ~
      (__ \ "title").write[Option[String]] ~
      (__ \ "publishedDateTime").write[DateTime] ~
      (__ \ "lastUpdatedDateTime").write[Option[DateTime]] ~
      (__ \ "body").write[String]
    )(unlift(TextBlock.unapply))

  private def blockText(page: PageWithStoryPackage, number: Int)(implicit request: RequestHeader) = page match {
    case LiveBlogPage(liveBlog, _) =>
      val blocks = liveBlog.blocks.collect {
        case Block(id, title, publishedAt, updatedAt, BlockToText(text), _) if text.trim.nonEmpty => TextBlock(id, title, publishedAt, updatedAt, text)
      }.take(number)
      Cached(page)(JsonComponent(("blocks" -> Json.toJson(blocks))))
    case _ => Cached(600)(NotFound("Can only return block text for a live blog"))

  }

  private def render(path: String, page: PageWithStoryPackage, pageNo: Option[Int])(implicit request: RequestHeader) = page match {
    case blog: LiveBlogPage =>
      if (request.isAmp) {
        NotFound
      } else {
        val PAGINATION_ENABLED_TAGS = Seq("business/series/guardian-business-live", "politics/series/politics-live-with-andrew-sparrow")
        val pageSize = if (blog.article.content.tags.tags.exists(tag => PAGINATION_ENABLED_TAGS.contains(tag.id))) 10 else 300
        val blocks = BodyBlocks(pageSize = pageSize, extrasOnFirstPage = 10/* = 29, also update in truncate-liveblog.js*/)(blog.article.content.fields.blocks, pageNo)
        blocks match {
          case Some(blocks) =>
            val htmlResponse = () => views.html.liveBlog (blog, blocks)
            val jsonResponse = () => views.html.fragments.liveBlogBody (blog, blocks)
            renderFormat(htmlResponse, jsonResponse, blog, Switches.all)
          case None => NotFound
        }
      }

    case article: ArticlePage =>
      val htmlResponse = () => if (request.isAmp && !article.article.isImmersive) {
        views.html.articleAMP(article)
      } else {
          if (article.article.isImmersive) {
            views.html.articleImmersive(article)
          } else {
            views.html.article(article)
          }
      }
      val jsonResponse = () => views.html.fragments.articleBody(article)
      renderFormat(htmlResponse, jsonResponse, article, Switches.all)
  }

  def renderLiveBlog(path: String, page: Option[Int] = None) =
    LongCacheAction { implicit request =>
      mapModel(path, blocks = true) {// temporarily only ask for blocks too for things we know are new live blogs until until the migration is done and we can always use blocks
        render(path, _, page)
      }
    }

  def renderLiveBlogJson(path: String, lastUpdate: Option[String], rendered: Option[Boolean]) = {
    LongCacheAction { implicit request =>
      println("render live blog")
      mapModel(path, blocks = true) { model =>
        (lastUpdate, rendered) match {
          case (Some(lastUpdate), _) => renderLatestFrom(model, lastUpdate)
          case (None, Some(false)) => blockText(model, 6)
          case (_, _) => render(path, model, None)
        }
      }
    }
  }

  def renderJson(path: String) = {
    LongCacheAction { implicit request =>
      mapModel(path) {
        render(path, _, None)
      }
    }
  }

  def renderArticle(path: String) = {
    LongCacheAction { implicit request =>
      mapModel(path) {
        render(path, _, None)
      }
    }
  }

  def mapModel(path: String, blocks: Boolean = false)(render: PageWithStoryPackage => Result)(implicit request: RequestHeader): Future[Result] = {
    lookup(path, blocks) map redirect recover convertApiExceptions map {
      case Left(model) => render(model)
      case Right(other) => RenderOtherStatus(other)
    }
  }

  private def lookup(path: String, blocks: Boolean)(implicit request: RequestHeader): Future[ItemResponse] = {
    val edition = Edition(request)

    log.info(s"Fetching article: $path for edition ${edition.id}: ${RequestLog(request)}")
    val capiItem = LiveContentApi.item(path, edition)
      .showTags("all")
      .showFields("all")
      .showReferences("all")

    val capiItemWithBlocks = if (blocks) capiItem.showBlocks("body") else capiItem

    getResponse(capiItemWithBlocks).map { itemResponse => 

      /*
          The hack demo the ability for news media to support efficently the diffusion of 
          official urgent instructions in case of an emergency.
         
          As the event is organised by the Paris city council, we use the last december paris attack liveblog to demo the featue

       */ 
      if (path == "world/live/2015/nov/13/shootings-reported-in-eastern-paris-live") {

        val alertEvents = NecMergiturHackAgent.getEvents()

        println("Events retrieved" + alertEvents)

        val alertBlocks = alertEvents.map(e => createNecMergiturBlock(e))

        /* 
           we update the model:
            - blocks: we add alerts blocks created
            - liveBloggingNow: we set the blog as live to have auto updates
            - body: we have to add divs with ids of the events as some code still use inlined body rather than blocks
         */
        itemResponse.copy(content = itemResponse.content.map { content =>
          content.copy(blocks = content.blocks.map { contentblocks =>
            contentblocks.copy(body = contentblocks.body.map { bodyBlocks =>
              alertBlocks ++: bodyBlocks
            }) 
          },
          fields = content.fields.map(f => f.copy(liveBloggingNow = Some(true), body = f.body.map(b => alertEvents.map(createBlockHtml).mkString + b)))
          )
        })
      } else {

        itemResponse
      }
    }

  }


  private def createNecMergiturBlock(event: NecMergiturHackEvent): ApiBlock = {
    
    import com.gu.contentapi.client.utils.CapiModelEnrichment._


    ApiBlock(

      id = "block-" + event.id,
      bodyHtml = createBlockBodyHtml(event),
      bodyTextSummary = "Summary: nothing for the moment",
      title = Some("Message from french authorities"),
      attributes = ApiBlockAttributes(
        keyEvent = Some(true),
        summary = Some(true),
        title = Some("Attributes title")
      ),

      published = true,
      createdDate = Some(event.published.toCapiDateTime),
      firstPublishedDate = Some(event.published.toCapiDateTime),
      publishedDate = Some(event.published.toCapiDateTime),
      lastModifiedDate = Some(event.published.toCapiDateTime),
      contributors = Nil,
      createdBy = None, //TODO name of authorities
      lastModifiedBy = None, //TODO automatic
      elements = Nil
    )
  }

  private def createBlockHtml(event: NecMergiturHackEvent)(implicit request: RequestHeader): String = {
    
    val liveBlogDate = LiveBlogDate(event.published)
    val bodyHtml = createBlockBodyHtml(event)

    s"""
    <div id="block-${event.id}" class="block is-key-event" data-block-contributor="">
     <p class="block-time published-time">

     <time datetime="${liveBlogDate.fullDate}" data-relativeformat="med" class=" js-timestamp" itemprop="datePublished">${liveBlogDate.ampm} <span class="timezone">${liveBlogDate.gmt}</span></time>
      <span class="block-time__absolute">${liveBlogDate.hhmm}</span>
      </p>
      <h2 class="block-title">Message from french authorities</h2>
       <div class="block-elements">
        ${bodyHtml}
      </div>
    </div>
    """
    
  } 

  private def createBlockBodyHtml(event: NecMergiturHackEvent): String = {
    val hackeventLogo = "https://www.data.gouv.fr/s/images/aa/295d5ad6344917bfa87a5dc4be326d.png"
    s"""
      <div style='width:55em'>
          <div style='float:left; width:10em'> <img src='${hackeventLogo}' style='width:10em'></img></div>
          <div style='float:left; width:23em'>
            
            <p>${event.message}</p>
            <p style='font-size:0.75rem;color:#767676'> Information displayed above is not a genuine information, but <a href='https://twitter.com/search?vertical=default&q=%23NecMergitur' class='underline'>an experiment</a> of how information from authorities
            could be relayed by digital newspapers</p>
            </div>
      </div>
    """
  }

  /**
   * convert a response into something we can render, and return it
   * optionally, throw a response if we know it's not right to send the content
   * @param response
   * @return
   */
  def redirect(response: ItemResponse)(implicit request: RequestHeader) = {
    val supportedContent = response.content.filter(isSupported).map(Content(_))
    val content: Option[PageWithStoryPackage] = supportedContent.map {
      case liveBlog: Article if liveBlog.isLiveBlog => LiveBlogPage(liveBlog, RelatedContent(liveBlog, response))
      case article: Article => ArticlePage(article, RelatedContent(article, response))
    }

    ModelOrResult(content, response)
  }

}

object LongCacheAction {
  def apply(block: RequestHeader => Future[Result]) = {
    if (LongCacheSwitch.isSwitchedOn) Action.async { implicit request =>
      // we cannot sensibly decache memcached (does not support surogate keys)
      // so if we are doing the 'soft purge' don't memcache
      block(request)
    } else MemcachedAction { implicit request =>
      block(request)
    }
  }
}
