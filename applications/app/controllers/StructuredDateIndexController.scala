package controllers

import com.gu.contentapi.client.model.RecipesQuery
import common.ExecutionContexts
import common.`package`._
import contentapi.ContentApiClient
import model.{ApplicationContext, MetaData, SimplePage, Tags}
import org.joda.time.DateTime
import play.api.mvc.Action
import services.{IndexPage, IndexPagePagination}
import structureddata.AtomTransformer._

class StructuredDateIndexController(val contentApiClient: ContentApiClient)(implicit val context: ApplicationContext) extends Paging with ExecutionContexts {

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

      if (response.results.nonEmpty) {
        val page = IndexPage(
          page = SimplePage(MetaData.make(id = "", section = None, webTitle = s"${filterValue.capitalize} Recipes")),
          contents = response.results flatMap recipeAtomToContent,
          tags = Tags(List.empty),
          date = DateTime.now,
          tzOverride = None
        )

        Ok(views.html.index(page))

      } else NotFound


    }
  }

}


