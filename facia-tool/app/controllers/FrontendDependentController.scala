package controllers

import play.api.mvc._
import play.api.libs.json.{JsNull, Json, JsString, JsValue}
import play.api.Play
import play.api.Play.current
import model.Cached
import auth.ExpiringActions
import slices.{FixedContainers, DynamicContainers, ContainerJsonConfig}
import conf.{Configuration, FaciaToolConfiguration}
import common.Edition


object Defaults {
  implicit val jsonFormat = Json.format[Defaults]
}

case class Defaults(
  dev: Boolean,
  env: String,
  editions: Seq[String],
  navSections: Seq[String],
  email: String,
  avatarUrl: Option[String],
  lowFrequency: Int,
  highFrequency: Int,
  standardFrequency: Int,
  sentryPublicDSN: String,
  fixedContainers: Seq[ContainerJsonConfig],
  dynamicContainers: Seq[ContainerJsonConfig]
)

object FrontendDependentController extends Controller {
  private val DynamicGroups = Seq(
    "standard",
    "big",
    "very big",
    "huge"
  )

  def config() = ExpiringActions.ExpiringAuthAction { request =>
    Cached(60) {
      Ok(Json.toJson(Defaults(
        Play.isDev,
        Configuration.environment.stage,
        Edition.all.map(_.id.toLowerCase),
        FaciaToolConfiguration.sectionsFromNav,
        request.user.email,
        request.user.avatarUrl,
        Configuration.faciatool.adminPressJobLowPushRateInMinutes,
        Configuration.faciatool.adminPressJobHighPushRateInMinutes,
        Configuration.faciatool.adminPressJobStandardPushRateInMinutes,
        "https://4527e03d554a4962ae99a7481e9278ff@app.getsentry.com/35467",
        FixedContainers.all.keys.toSeq.map(id => ContainerJsonConfig(id, None)),
        DynamicContainers.all.keys.toSeq.map(id => ContainerJsonConfig(id, Some(DynamicGroups)))
      )))
    }
  }
}

