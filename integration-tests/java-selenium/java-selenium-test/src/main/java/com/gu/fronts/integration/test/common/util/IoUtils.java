package com.gu.fronts.integration.test.common.util;

import java.io.StringWriter;

import org.apache.commons.io.IOUtils;

public class IoUtils {

    public static String loadPressedJsonStubFile(String fileName) {
        return loadResourceFromClassPath("stubbedData/" + fileName);
    }

    private static String loadResourceFromClassPath(String classPathResourcePath) {
        try {
            StringWriter stringWriter = new StringWriter();
            IOUtils.copy(IoUtils.class.getClassLoader().getResourceAsStream(classPathResourcePath), stringWriter);
            return stringWriter.toString();
        } catch (Exception e) {
            throw new RuntimeException("Could not load resource: " + classPathResourcePath, e);
        }
    }

}
