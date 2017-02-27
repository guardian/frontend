module.exports = {
    description: "Lint assets",
    task: [require("./javascript"), require("./sass")],
    concurrent: true,
};
