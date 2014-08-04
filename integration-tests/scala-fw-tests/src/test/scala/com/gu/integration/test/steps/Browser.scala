package com.gu.integration.test.steps

sealed trait Browser {
  val name: String
  val version: String
}

case object Firefox extends Browser {
  val name = "Firefox"
  val version = "30"
}
