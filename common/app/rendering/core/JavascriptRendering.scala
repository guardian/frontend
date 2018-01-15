package rendering.core

import java.io._
import java.nio.charset.StandardCharsets
import java.nio.file.{Files, Paths}
import java.util.concurrent.atomic.AtomicReference
import javax.script.{CompiledScript, SimpleScriptContext}

import common.Logging
import play.api.libs.json.{JsObject, JsValue, Json}
import rendering.core.JavascriptEngine.EvalResult

import scala.util.{Failure, Success, Try}

trait JavascriptRendering extends Logging {
  def javascriptFile: String

  private def memoizeJs(): Try[EvalResult] = {
    memoizedJs.get() match {
      case Some(js) =>
        Success(js)

      case None =>
        log.warn("UI - unable to find memoised parsed javascript, attempting to parse...")
        val parsed = loadJavascript()
        parsed.foreach { r =>
          log.info("UI - ...succeeded in parsing javascript")
          memoizedJs.set(Some(r))
        }

        parsed.failed.foreach { e =>
          log.warn("UI - ...parsing javascript failed")
        }

        parsed
    }
  }

  private implicit val scriptContext = createContext()
  private val memoizedJs: AtomicReference[Option[EvalResult]] = new AtomicReference(None)

  private def getProps(props: Option[JsValue] = None): JsValue =
    JavascriptProps.default.asJsValue.as[JsObject] ++ props.map(_.as[JsObject]).getOrElse(Json.obj())

  def render(props: Option[JsValue] = None, forceReload: Boolean = false): Try[String] = for {
      propsObject <- encodeProps(getProps(props))
      js <- if(forceReload) loadJavascript() else memoizeJs()
      rendering <- JavascriptEngine.invoke(js, "render", propsObject)
    } yield rendering

  private def createContext(): SimpleScriptContext = {
    val context = new SimpleScriptContext()
    JavascriptEngine.put("__play_webpack_logger", log.logger)(context) // Binding webpack logger to scala logger
    context
  }

  private def encodeProps(props: JsValue): Try[EvalResult] = {
    val propsId = "props"

    for {
      _ <- JavascriptEngine.put(propsId, props)
      propsObject <- JavascriptEngine.eval(s"JSON.parse($propsId)")
    } yield propsObject
  }

  private def compile(inputStream: InputStream): Try[CompiledScript] = {
    val fullScript = new InputStreamReader(new SequenceInputStream(prescript, inputStream))
    JavascriptEngine.compile(fullScript)
  }

  private def loadJavascript(): Try[EvalResult] = for {
    file <- loadFile(javascriptFile)
    cs <- compile(file)
    js <- JavascriptEngine.eval(cs)
  } yield js

  // Nashorn is only a JavaScript engine, i.e. an implementation of the ECMAScript 5.1 language specification.
  // This means that global JavaScript functions such as setTimeout, setInterval and console do not exist natively in Nashorn.
  // Therefore we need to define them manually
  private def prescript: ByteArrayInputStream = {
    val pre =
      """
        |var global = global || this, self = self || this;
        |
        |var console = {};
        |
        |var logger = function(type) {
        |  return function () {
        |    for (var i = 0, len = arguments.length; i < len; i++) {
        |      print(arguments[i]);
        |      __play_webpack_logger[type](arguments[i]);
        |    }
        |  }
        |};
        |console.debug = logger("debug");
        |console.warn = logger("warn");
        |console.error = logger("error");
        |console.log = logger("info");
        |console.trace = logger("trace");
        |
        |global.setTimeout = function(fn, delay) {
        |  return __play_webpack_setTimeout.apply(fn, delay || 0);
        |};
        |
        |global.clearTimeout = function(timer) {
        |  return __play_webpack_clearTimeout.apply(timer);
        |};
        |
        |global.setImmediate = function(fn) {
        |  return __play_webpack_setTimeout.apply(fn, 0);
        |};
        |
        |global.clearImmediate = function(timer) {
        |  return __play_webpack_clearTimeout.apply(timer);
        |};
      """
        .stripMargin
    new ByteArrayInputStream(pre.getBytes(StandardCharsets.UTF_8))
  }

  private def loadFile(file: String): Try[InputStream] = {
    Try(Files.newInputStream(Paths.get(file)))
      .recoverWith { case f => Failure(new FileNotFoundException(s"${f.getLocalizedMessage}. Have you run `make ui-compile`?")) }
  }

}
