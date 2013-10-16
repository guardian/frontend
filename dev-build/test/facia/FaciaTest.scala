package facia

import org.scalatest.FlatSpec
import org.scalatest.matchers.ShouldMatchers
import common.{Grunt, Server}

class FaciaTest extends FlatSpec with ShouldMatchers {

  "Facia" should "pass integration tests" in Server{
    Grunt("facia") should be (0)
  }

}
