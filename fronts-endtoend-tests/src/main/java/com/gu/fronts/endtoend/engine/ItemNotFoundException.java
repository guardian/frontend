package com.gu.fronts.endtoend.engine;

public class ItemNotFoundException extends RuntimeException {
    public ItemNotFoundException(String label) {
        super(String.format("Item %s is not registered", label));
    }
}
