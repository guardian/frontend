package controllers

import util.SanitizeInput
import frontsapi.model._
import frontsapi.model.UpdateList
import play.api.mvc._
import play.api.libs.json._
import common.{FaciaToolMetrics, ExecutionContexts, Logging}
import conf.Configuration
import tools.FaciaApi
import model.{NoCache, Cached}
import com.gu.googleauth.{AuthenticatedRequest => AR, UserIdentity, Actions}
import play.api.mvc.Call
import org.joda.time.DateTime
import services._
import play.api.mvc.Result
import scala.concurrent.Future


object ExpiringActions extends implicits.Dates with implicits.Requests with ExecutionContexts {
  import play.api.mvc.Results.{Forbidden, Redirect}

  object AuthActions extends Actions {
    val loginTarget: Call = routes.OAuthLoginController.login()
  }

  val loginTarget: Call = routes.OAuthLoginController.login()

  private def withinAllowedTime(session: Session): Boolean = session.get(Configuration.cookies.lastSeenKey).map(new DateTime(_)).exists(_.age < Configuration.cookies.sessionExpiryTime)

  object ExpiringAuthAction {
    def async(f: AR[AnyContent] => Future[Result]) = AuthActions.AuthAction.async { request =>
      if (withinAllowedTime(request.session)) {
        f(request).map(_.withSession(request.session + (Configuration.cookies.lastSeenKey , DateTime.now.toString)))
      }
      else {
        if (request.isXmlHttpRequest)
          Future.successful(Forbidden.withNewSession)
        else {
          Future.successful(Redirect(AuthActions.loginTarget).withNewSession)
        }
      }
    }

    def apply(f: AR[AnyContent] => Result) = async(request => Future.successful(f(request)))
  }
}



object FaciaToolController extends Controller with Logging with ExecutionContexts {
  def priorities() = ExpiringAuthentication { request =>
    val identity = Identity(request).get
    Cached(60) { Ok(views.html.priority(Configuration.environment.stage, "", Option(identity))) }
  }

  def collectionEditor(priority: String) = ExpiringAuthentication { request =>
    val identity = Identity(request).get
    Cached(60) { Ok(views.html.collections(Configuration.environment.stage, priority, Option(identity))) }
  }

  def configEditor(priority: String) = ExpiringAuthentication { request =>
    val identity = Identity(request).get
    Cached(60) { Ok(views.html.config(Configuration.environment.stage, priority, Option(identity))) }
  }

  def listCollections = AjaxExpiringAuthentication { request =>
    FaciaToolMetrics.ApiUsageCount.increment()
    NoCache { Ok(Json.toJson(S3FrontsApi.listCollectionIds)) }
  }

  def getConfig = AjaxExpiringAuthentication { request =>
    FaciaToolMetrics.ApiUsageCount.increment()
    NoCache {
      S3FrontsApi.getMasterConfig map { json =>
        Ok(json).as("application/json")
      } getOrElse NotFound
    }
  }

  def updateConfig(): Action[AnyContent] = AjaxExpiringAuthentication { request =>
    FaciaToolMetrics.ApiUsageCount.increment()
    val configJson: Option[JsValue] = request.body.asJson
    NoCache {
      configJson.flatMap(_.asOpt[Config]).map(SanitizeInput.fromConfigSeo).map {
        case update: Config => {

          //Only update if it is a valid Config object
          configJson.foreach { json =>
            ConfigAgent.refreshWith(json)
          }

          val identity = Identity(request).get
          UpdateActions.putMasterConfig(update, identity)
          Ok
        }
        case _ => NotFound
      } getOrElse NotFound
    }
  }

  def readBlock(id: String) = AjaxExpiringAuthentication { request =>
    FaciaToolMetrics.ApiUsageCount.increment()
    NoCache {
      S3FrontsApi.getBlock(id) map { json =>
        Ok(json).as("application/json")
      } getOrElse NotFound
    }
  }

  def publishCollection(id: String) = AjaxExpiringAuthentication { request =>
    val identity = Identity(request).get
    FaciaToolMetrics.DraftPublishCount.increment()
    val block = FaciaApi.publishBlock(id, identity)
    block foreach { b =>
      UpdateActions.archivePublishBlock(id, b, identity)
      FaciaPress.press(PressCommand.forOneId(id).withPressDraft().withPressLive())
    }
    ContentApiPush.notifyContentApi(Set(id))
    NoCache(Ok)
  }

  def discardCollection(id: String) = AjaxExpiringAuthentication { request =>
    val identity = Identity(request).get
    val block = FaciaApi.discardBlock(id, identity)
    block.foreach { b =>
      UpdateActions.archiveDiscardBlock(id, b, identity)
      FaciaPress.press(PressCommand.forOneId(id).withPressDraft())
    }
    NoCache(Ok)
  }

  def updateCollectionMeta(id: String): Action[AnyContent] = AjaxExpiringAuthentication { request =>
    FaciaToolMetrics.ApiUsageCount.increment()
    NoCache {
      request.body.asJson flatMap(_.asOpt[CollectionMetaUpdate]) map {
        case update: CollectionMetaUpdate => {
          val identity = Identity(request).get
          UpdateActions.updateCollectionMeta(id, update, identity)
          ContentApiPush.notifyContentApi(Set(id))
          Ok
        }
        case _ => NotFound
      } getOrElse NotFound
    }
  }

  def collectionEdits(): Action[AnyContent] = AjaxExpiringAuthentication { request =>
    FaciaToolMetrics.ApiUsageCount.increment()
    NoCache {
      request.body.asJson flatMap (_.asOpt[Map[String, UpdateList]]) map {
        case update: Map[String, UpdateList] =>
          val identity: Identity = Identity(request).get
          val updatedCollections: Map[String, Block] = update.collect {
            case ("update", updateList) =>
              UpdateActions.updateCollectionList(updateList.id, updateList, identity).map(updateList.id -> _)
            case ("remove", updateList) =>
              UpdateActions.updateCollectionFilter(updateList.id, updateList, identity).map(updateList.id -> _)
          }.flatten.toMap

          val shouldUpdateLive: Boolean = update.exists(_._2.live)

          val collectionIds = updatedCollections.keySet

          FaciaPress.press(PressCommand(
            collectionIds,
            live = shouldUpdateLive,
            draft = (updatedCollections.values.exists(_.draft.isEmpty) && shouldUpdateLive) || update.exists(_._2.draft)
          ))
          ContentApiPush.notifyContentApi(collectionIds)

          if (updatedCollections.nonEmpty)
            Ok(Json.toJson(updatedCollections)).as("application/json")
          else
            NotFound
      } getOrElse NotFound
    }
  }

  def pressLivePath(path: String) = AjaxExpiringAuthentication { request =>
    FaciaPressQueue.enqueue(PressJob(FrontPath(path), Live))
    NoCache(Ok)
  }

  def pressDraftPath(path: String) = AjaxExpiringAuthentication { request =>
    FaciaPressQueue.enqueue(PressJob(FrontPath(path), Draft))
    NoCache(Ok)
  }
  
  def updateCollection(id: String) = AjaxExpiringAuthentication { request =>
    FaciaPress.press(PressCommand.forOneId(id).withPressDraft().withPressLive())
    ContentApiPush.notifyContentApi(Set(id))
    NoCache(Ok)
  }

  def getLastModified(path: String) = AjaxExpiringAuthentication { request =>
    val now: Option[String] = S3FrontsApi.getPressedLastModified(path)
    now.map(Ok(_)).getOrElse(NotFound)
  }
}
