package com.gu.contentatom.renderer

import com.gu.contentatom.thrift.Atom
import com.gu.fezziwig.CirceScroogeMacros._
import io.circe._, io.circe.generic.semiauto._

package object json {
    implicit val atomDecoder: Decoder[Atom] = Decoder[Atom]
}