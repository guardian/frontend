package com.gu.fronts.integration.test.fw.wiremock;

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse;
import static com.github.tomakehurst.wiremock.client.WireMock.get;
import static com.github.tomakehurst.wiremock.client.WireMock.stubFor;
import static com.github.tomakehurst.wiremock.client.WireMock.urlMatching;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.stereotype.Component;

import com.github.tomakehurst.wiremock.client.MappingBuilder;
import com.gu.fronts.integration.test.common.util.IoUtils;

/**
 * <p>
 * Very simple builder implementation which just wraps Wiremock Java DSL to simply create stub expectations for
 * pressed.json.. Caveat, of its simple implementation, is that the methods must be called in order, for it to work. so
 * {@link #path(String)} must be called before {@link #withResponse()}
 * </p>
 * To verify that a request has been made just use the WireMock verify statement directly. E.g.
 * 
 * <pre>
 * WireMock.verify(getRequestedFor(urlMatching(".*\/uk/.*")));
 * </pre>
 * 
 * (observe the extra backslash, in the pattern match, is just for making the javadoc comment not break)
 */
@Component
public class WiremockStubPressedJsonBuilder {

    private static Log LOG = LogFactory.getLog(WiremockStubPressedJsonBuilder.class);

    // stubPath("/uk").withResponse("NetworkStartPage-pressed.json");
    // @Value("${fronts.env}")
    // protected String frontsEnv;
    private MappingBuilder mappingBuilder;
    private String path;

    /**
     * Mocks an outgoing request context path for a pressed.json request. E.g. /uk or /uk/commentisfree<br>
     * Use {@link #withResponse()} to specify the pressed.json file to be return.
     */
    public WiremockStubPressedJsonBuilder path(String path) {
        String requestPath = "/aws-frontend-store/(.*)/frontsapi/pressed" + path + "/pressed.json";
        LOG.debug("Creating pressed.json stub for path: " + requestPath);
        this.mappingBuilder = get(urlMatching(requestPath));
        this.path = path;
        return this;
    }

    /**
     * Specify the pressed.json response file to return as stubbed response. It is expected to be found, in the
     * classpath, under the path, specified in a previous {@link #path(String)} request, in stubbedFolder. E.g. a path
     * of /uk will expect the pressed.json stubbed file to be located under folder stubbedFolder/uk
     */
    public void withResponse(String stubbedResponseFilePath) {
        LOG.debug("Creating pressed.json stub using file: " + stubbedResponseFilePath);
        stubFor(mappingBuilder.willReturn(aResponse().withStatus(200).withHeader("Content-Type", "application/json")
                .withBody(IoUtils.loadPressedJsonStubFile(path, stubbedResponseFilePath))));
    }

}
