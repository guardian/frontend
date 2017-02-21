package controllers

import com.gu.contentapi.client.model.RecipesQuery
import common.{ExecutionContexts, Pagination}
import common.`package`._
import conf.Configuration
import contentapi.ContentApiClient
import model.Cached.RevalidatableResult
import model.{ApplicationContext, Cached, MetaData, SectionSummary, SimplePage, Tags}
import org.joda.time.DateTime
import play.api.mvc.Action
import services.{IndexPage, IndexPagePagination}
import structureddata.AtomTransformer._

class StructuredDataIndexController(val contentApiClient: ContentApiClient)(implicit val context: ApplicationContext) extends Paging with ExecutionContexts {

  def render(filterType: String, filterValue: String) = Action.async { implicit request =>

    val page = inferPage(request)
    val pageSize = if (request.isRss) IndexPagePagination.rssPageSize else IndexPagePagination.pageSize
    val baseQuery = contentApiClient.recipes.page(page).pageSize(pageSize)

    val query: String => RecipesQuery = filterType match {
      case "cuisine" => baseQuery.cuisines(_)
      case "dietary" => baseQuery.dietary(_)
      case "celebration" => baseQuery.celebration(_)
      case "category" => baseQuery.categories(_)
    }

    contentApiClient.getResponse(query(filterValue)) map { response =>

        val indexPage = IndexPage(
          page = SimplePage(
            MetaData.make(
              id = Configuration.site.host + request.path,
              section = Some(SectionSummary("lifeandstyle/food-and-drink")),
              webTitle = s"${filterValue.toLowerCase} recipes",
              pagination = Some(Pagination(currentPage = response.currentPage , lastPage = response.pages, totalContent = response.total)))),
          contents = response.results flatMap recipeAtomToContent,
          tags = Tags(List.empty),
          date = DateTime.now,
          tzOverride = None
        )

        Cached(indexPage.page)(RevalidatableResult.Ok(views.html.index(indexPage)))
    }
  }

}


