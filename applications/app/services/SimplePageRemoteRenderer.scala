package services

import play.api.mvc.Results._
import play.api.mvc.{Action, RequestHeader, Result}
import play.api.libs.ws.{WSClient, WSResponse}
import play.api.libs.json.{JsValue, Json, JsObject}
import common.{CanonicalLink, Edition}
import conf.Configuration
import experiments.ActiveExperiments
import model.{ApplicationContext, DotcomContentType, Cached, NoCache, MetaData, SectionId, SimplePage}
import model.dotcomrendering.{Config, DotcomRenderingUtils}
import services.newsletters.model.NewsletterResponse
import services.NewsletterData
import views.support.{CamelCase, JavaScriptPage}

import implicits.Requests._
import renderers.DotcomRenderingService
import scala.concurrent.{ExecutionContext, Future, duration, Await}
import java.util.concurrent.{TimeUnit}
import navigation.{Nav, NavMenu, NavLink}
import navigation.ReaderRevenueLinks
import model.dotcomrendering.DotcomNewslettersPageRenderingDataModel

object SimplePageRemoteRenderer {

  val remoteRenderer: renderers.DotcomRenderingService = DotcomRenderingService()

  def newslettersPage(newsletters: List[NewsletterResponse], page: SimplePage, ws: WSClient)(implicit
      request: RequestHeader,
      executionContext: ExecutionContext,
  ): Result = {

    val model = DotcomNewslettersPageRenderingDataModel.apply(page, newsletters,request)
    val json = DotcomNewslettersPageRenderingDataModel.toJson(model)

    Await.result(
      remoteRenderer.getEmailNewsletters(ws, json),
      duration.Duration.create(5, TimeUnit.SECONDS),
    )
  }
}
