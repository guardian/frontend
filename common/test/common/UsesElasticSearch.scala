package common

import org.scalatest.{Suite, BeforeAndAfterEach}
import conf.Switches

trait UsesElasticSearch extends Suite with  BeforeAndAfterEach {

  override def beforeEach() {
    super.beforeEach()
    Switches.ElasticSearchSwitch.switchOn()
  }

  override def afterEach(){
    super.afterEach()
    Switches.ElasticSearchSwitch.switchOff()
  }

}
