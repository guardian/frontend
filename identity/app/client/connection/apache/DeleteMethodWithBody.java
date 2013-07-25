package client.connection.apache;

import org.apache.commons.httpclient.methods.EntityEnclosingMethod;

public class DeleteMethodWithBody extends EntityEnclosingMethod {
    public DeleteMethodWithBody(String uri) {
        super(uri);
    }

    @Override
    public String getName() {
        return "DELETE";
    }
}
