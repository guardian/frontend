package facia

import org.scalatest.{Matchers, FlatSpec}
import common.{Grunt, Server}

class FaciaTest extends FlatSpec with Matchers {

  ignore should "pass integration tests" in Server{
    Grunt("facia") should be (0)
  }

}
