package com.gu.fronts.endtoend.engine;

public class Story implements Managable {


    private String name;

    public Story(String name) {
        this.name = name;
    }

    @Override
    public String getName() {
        return name;
    }
}
