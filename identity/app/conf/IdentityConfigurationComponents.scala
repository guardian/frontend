package conf

import com.gu.identity.cookie.{ProductionKeys, PreProductionKeys, IdentityKeys}
import com.softwaremill.macwire._
import play.api.i18n.I18nComponents
import play.api.Mode

trait IdentityConfigurationComponents extends I18nComponents {
  val a: String = ""

  lazy val idConfig = wire[IdConfig]
  val identityConfiguration = wire[IdentityConfiguration]
  lazy val frontendIdentityCookieDecoder = wire[FrontendIdentityCookieDecoder]

  lazy val identityKeys: IdentityKeys = environment.mode match {
    case Mode.Prod if conf.Configuration.environment.isNonProd => new PreProductionKeys
    case Mode.Prod => new ProductionKeys
    case _ => new PreProductionKeys
  }
}
