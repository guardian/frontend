package json

import com.github.blemale.scaffeine.Scaffeine
import com.gu.etagcaching.ConfigCache
import play.api.libs.json.Format

/**
  * This class is a memory optimisation for when many identical objects (eg `Tag`s) are being
  * read from JSON, and then held in memory. If the objects are immutable & identical,
  * we don't want to hold multiple copies of them - we can just hold one in a cache, and have all
  * references to the object point to that same object.
  *
  * In practice, this means when we deserialize Json to some Scala object, we _do_ create a
  * new instance of that Scala object, but we immediately throw it away if we find we already
  * have a matching one in our cache - we use the cached one in preference, and we get the desired
  * situation where all the instances of that unique value in memory are represented by one single
  * instance.
  *
  * We key our cached instances by hashcode (which is mostly unique, apart from
  * https://en.wikipedia.org/wiki/Birthday_problem collisions) combined with a user-defined id function
  * (which is a only precaution, to eliminate Birthday Problem collisions). So in our cache, we
  * might have several instances of the Tag `sport/cycling`, if the tag has changed - but the hashcode
  * ensures that we do not substitute old data in place of new data. Old data can be configured to
  * eventually expire out of the cache (eg `.expireAfterAccess(1.hour)`).
  */
object ObjectDeduplication {

  /**
    * @param id as precaution, this function provides an object distinguisher beyond the object hashcode. For a Tag,
    *           you might just provide the tag id.
    */
  def deduplicate[A](f: Format[A], id: A => Any, configCache: ConfigCache): Format[A] = {
    val cache = configCache(Scaffeine()).build[(Int, Any), A]().asMap()
    def key(a: A): (Int, Any) = (a.hashCode(), id(a))

    f.bimap(a => cache.getOrElseUpdate(key(a), a), identity)
  }
}
