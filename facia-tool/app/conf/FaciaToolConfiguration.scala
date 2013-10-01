package conf

import com.gu.conf.ConfigurationFactory

object FaciaToolConfiguration {

  val configuration = ConfigurationFactory.getConfiguration("frontend", "env")

}
