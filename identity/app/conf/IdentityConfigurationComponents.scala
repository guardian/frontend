package conf

import com.gu.identity.cookie.{IdentityKeys, PreProductionKeys, ProductionKeys}
import com.softwaremill.macwire._
import common.GuardianConfiguration
import play.api.i18n.I18nComponents
import play.api.Mode

trait IdentityConfigurationComponents extends I18nComponents {

  def guardianConf: GuardianConfiguration

  val identityConfiguration = wire[IdentityConfiguration]
  lazy val frontendIdentityCookieDecoder = wire[FrontendIdentityCookieDecoder]

  lazy val identityKeys: IdentityKeys = environment.mode match {
    case Mode.Prod if conf.Configuration.environment.isNonProd => new PreProductionKeys
    case Mode.Prod                                             => new ProductionKeys
    case _                                                     => new PreProductionKeys
  }
}
