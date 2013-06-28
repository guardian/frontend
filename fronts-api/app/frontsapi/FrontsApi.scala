package frontsapi

import com.redis.RedisClient
import com.redis.serialization.{Format, Parse}

trait FrontsApi {
  def getList(listName: String): List[String]

  def add(listName: String, pivot: String, value: String, after: Option[Boolean] = None): Option[_]
  def addAtPosition(listName: String, position: Int, value: String): Option[_]

  def removeItem(listName: String, value: String): Option[_]
  def removeList(listName: String): Option[_]
}

class FrontsApiRedis(redisClient: CustomRedisClient) extends FrontsApi {

  def getList(listName: String) = redisClient.lrange(listName, 0 ,-1) map {_.flatten} getOrElse Nil

  def addAtPosition(listName: String, position: Int, value: String): Option[Boolean] = Option(redisClient.lset(listName, position, value))
  //Library does not seem to have LINSERT yet
  def add(listName: String, pivot: String, value: String, after: Option[Boolean] = None) = after match {
    case Some(false) => redisClient.linsert(listName, "AFTER", pivot, value)
    case _           => redisClient.linsert(listName, "BEFORE", pivot, value)
  }

  def removeItem(listName: String, value: String): Option[Long] = redisClient.lrem(listName, 0, value)
  def removeList(listName: String):Option[Long] = redisClient.del(listName)

  def push(listName: String, value: String): Option[Long] = redisClient.lpush(listName, value)
}

class CustomRedisClient(address: String, port: Int) extends RedisClient(address, port) {
  def linsert(key: Any, position: Any, pivot: Any, value: Any)(implicit format: Format): Option[Long] =
    send("LINSERT", List(key, position, pivot, value))(asLong)
}

object FrontsApi extends FrontsApiRedis(new CustomRedisClient("localhost", 6379))