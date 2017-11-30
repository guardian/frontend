package com.gu.contentatom.renderer
package renderers

import com.gu.contentatom.thrift.Atom

import play.twirl.api.Html

import scala.io.Source

import twirl.Css

trait Rendering[A] {
  def html(atom: Atom, data: A): Html
  def css: Option[Css]
  def js: Option[String]
}
