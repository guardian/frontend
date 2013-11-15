package conf

import com.tzavellas.sse.guice.ScalaModule
import com.google.inject.Provides
import com.gu.identity.cookie.{IdentityKeys, PreProductionKeys, ProductionKeys}


class ProdModule extends ScalaModule {
  def configure() {
  }

  @Provides()
  def getKeys():IdentityKeys = new ProductionKeys
}

class PreProdModule extends ScalaModule {
  def configure() {
  }

  @Provides()
  def getKeys():IdentityKeys = new PreProductionKeys
}

class DevModule extends ScalaModule {
  def configure() {
  }

  @Provides()
  def getKeys():IdentityKeys = new PreProductionKeys
}

class TestModule extends ScalaModule {
  def configure() {
  }

  @Provides()
  def getKeys():IdentityKeys = new PreProductionKeys
}
