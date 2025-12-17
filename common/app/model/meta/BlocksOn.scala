package model.meta

import com.gu.contentapi.client.model.v1.Blocks

/** Blocks are often passed around with the Page they belong to. It makes sense to give them a type that holds the two
  * together - this reduces parameter-count on many methods, improves consistency, and makes clear what things usefully
  * belong together for the work we're performing.
  *
  * https://docondev.com/blog/2020/6/2/refactoring-introduce-parameter-object
  */
case class BlocksOn[+P](page: P, blocks: Blocks) {
  def mapBoth[Q >: P](p: P => Q, b: Blocks => Blocks) = BlocksOn(p(page), b(blocks))
}
