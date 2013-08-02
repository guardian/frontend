package com.gu.fronts.endtoend.engine;

public class TrailBlock implements Managable {
	private String name;

	public TrailBlock(String name) {

		this.name = name;
	}

	public String getName() {
		return name;
	}

	public String URI() {
		return String.format("uk/news/%s", name);
	}
}
