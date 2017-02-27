module.exports = {
    description: "Ok, taking some screenshots for you... This may take a while ⏳",
    task: [require("./check-network"), require("./screenshot")],
};
