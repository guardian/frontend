package conf

import com.gu.conf.ConfigurationFactory
import common.editions.{Us, Au, Uk}

object FaciaToolConfiguration {

  val configuration = ConfigurationFactory.getConfiguration("frontend", "env")

  lazy val sectionsFromNav: Seq[String] = (Uk.navigation ++ Us.navigation ++ Au.navigation).map(_.name.zone.toLowerCase).distinct
}
