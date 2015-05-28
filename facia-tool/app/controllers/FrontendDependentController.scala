package controllers

import play.api.mvc._
import play.api.libs.json.{JsNull, Json, JsString, JsValue}
import play.api.Play
import play.api.Play.current
import model.Cached
import auth.PanDomainAuthActions
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
  sentryPublicDSN: Option[String],
  fixedContainers: Seq[ContainerJsonConfig],
  dynamicContainers: Seq[ContainerJsonConfig]
)

object FrontendDependentController extends Controller with PanDomainAuthActions {
  private val DynamicGroups = Seq(
    "standard",
    "big",
    "very big",
    "huge"
  )

  private val DynamicPackage = Seq(
    "standard",
    "snap"
  )

  def configuration = AuthAction { request =>
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
        Configuration.faciatool.sentryPublicDSN,
        FixedContainers.all.keys.toSeq.map(id => ContainerJsonConfig(id, None)),
        DynamicContainers.all.keys.toSeq.map(id =>
          if (id == "dynamic/package") {
            ContainerJsonConfig(id, Some(DynamicPackage))
          } else {
            ContainerJsonConfig(id, Some(DynamicGroups))
          }
        )
      )))
    }
  }
}
