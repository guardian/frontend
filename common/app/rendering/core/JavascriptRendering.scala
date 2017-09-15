package rendering.core

import java.io._
import java.nio.charset.StandardCharsets
import java.nio.file.{Files, Paths}
import javax.script.{CompiledScript, SimpleScriptContext}

import common.Logging
import play.api.libs.json.{JsValue, Json, JsObject}
import rendering.core.JavascriptEngine.EvalResult

import scala.util.{Failure, Try}

trait JavascriptRendering extends Logging {

  def javascriptFile: String

  private implicit val scriptContext = createContext()
  private val memoizedJs: Try[EvalResult] = loadJavascript()

  private def getCommonProps(props: Option[JsValue] = None): Option[JsValue] = {
    val bundleUrl = conf.Static("javascripts/ui.bundle.browser.js")
    val polyfillioUrl =
      if (conf.switches.Switches.PolyfillIO.isSwitchedOn) common.Assets.js.polyfillioUrl
      else conf.Static("javascripts/vendor/polyfillio.fallback.js")
    val commonProps = Json.obj("bundleUrl" -> bundleUrl, "polyfillioUrl" -> polyfillioUrl)

    props.map(_.as[JsObject] ++ commonProps)
  }

  def render(props: Option[JsValue] = None, forceReload: Boolean = false): Try[String] = for {
      propsObject <- encodeProps(getCommonProps(props))
      js <- if(forceReload) loadJavascript() else memoizedJs
      rendering <- JavascriptEngine.invoke(js, "render", propsObject)
    } yield rendering

  private def createContext(): SimpleScriptContext = {
    val context = new SimpleScriptContext()
    JavascriptEngine.put("__play_webpack_logger", log.logger)(context) // Binding webpack logger to scala logger
    context
  }

  private def encodeProps(props: Option[JsValue] = None): Try[EvalResult] = {
    val propsId = "props"
    val emptyJson = Json.obj()

    for {
      _ <- JavascriptEngine.put(propsId, props.getOrElse(emptyJson))
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
