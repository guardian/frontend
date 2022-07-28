package pages

import common.LinkTo
import html.HtmlPage
import html.HtmlPageHelpers._
import model.structuredData.{LiveBlogPosting, Organisation}
import model.{ApplicationContext, LiveBlogHelpers, LiveBlogPage}
import play.api.mvc.RequestHeader
import play.twirl.api.Html
import views.html.fragments.liveBlogHead
import views.html.liveblog.liveBlogBody

object LiveBlogHtmlPage extends HtmlPage[LiveBlogPage] {

  def html(page: LiveBlogPage)(implicit request: RequestHeader, applicationContext: ApplicationContext): Html = {
    implicit val p: LiveBlogPage = page

    val headContent = liveBlogHead(
      next = page.currentPage.pagination
        .flatMap(_.older)
        .map(_.suffix)
        .map(suffix => LinkTo(s"${page.article.content.metadata.id}$suffix")),
      prev = page.currentPage.pagination
        .flatMap(_.newer)
        .map(_.suffix)
        .map(suffix => LinkTo(s"${page.article.content.metadata.id}$suffix")),
      organisation = Html(Organisation().toString()),
      posting = Html(
        LiveBlogPosting(
          page.article,
          LiveBlogHelpers.blocksForLiveBlogRequest(
            page.article,
            request.getQueryString("page"),
            request.getQueryString("filterKeyEvents").exists(_.toBoolean),
          ),
        ).toString(),
      ),
    )

    StoryHtmlPage.html(
      maybeHeadContent = Some(headContent),
      header = guardianHeaderHtml(),
      content = liveBlogBody(page),
    )
  }

}
