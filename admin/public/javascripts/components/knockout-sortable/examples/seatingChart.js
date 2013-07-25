(function(ko, $, undefined) {
ko.bindingHandlers.flash = {
    init: function(element) {
        $(element).hide();
    },
    update: function(element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        if (value) {
            $(element).stop().hide().text(value).fadeIn(function() {
                clearTimeout($(element).data("timeout"));
                $(element).data("timeout", setTimeout(function() {
                    $(element).fadeOut();
                    valueAccessor()(null);
                }, 3000));
            });
        }
    },
    timeout: null
};

var Student = function(id, name, gender) {
    this.id = id;
    this.name = ko.observable(name);
    this.gender = gender;
};

var Table = function(id, students) {
    this.students = ko.observableArray(students);
    this.students.id = id;
};

var SeatingChartModel = function(tables, availableStudents) {
    var self = this;
    this.tables = ko.observableArray(tables);
    this.availableStudents = ko.observableArray(availableStudents);
    this.availableStudents.id = "Available Students";
    this.lastAction = ko.observable();
    this.lastError = ko.observable();
    this.maximumStudents = 4;
    this.isTableFull = function(parent) {
        return parent().length < self.maximumStudents;
    };

    this.updateLastAction = function(arg) {
        self.lastAction("Moved " + arg.item.name() + " from " + arg.sourceParent.id + " (seat " + (arg.sourceIndex + 1) + ") to " + arg.targetParent.id + " (seat " + (arg.targetIndex + 1) + ")");
    };

    //verify that if a fourth member is added, there is at least one member of each gender
    this.verifyAssignments = function(arg) {
        var gender, found,
            parent = arg.targetParent;

        if (parent.id !== "Available Students" && parent().length === 3 && parent.indexOf(arg.item) < 0) {
            gender = arg.item.gender;
            if (!ko.utils.arrayFirst(parent(), function(student) { return student.gender !== gender;})) {
                self.lastError("Cannot move " + arg.item.name() + " to " + arg.targetParent.id + " because there would be too many " + gender + " students");
                arg.cancelDrop = true;
            }
        }
    };
};

var extraStudents = [
    new Student(16, "Parker", "male"),
    new Student(17, "Dennis", "male"),
    new Student(18, "Angel", "female")
];

var initialTables = [
    new Table("Table One",  [
        new Student(1, "Bobby", "male"),
        new Student(2, "Ted", "male"),
        new Student(3, "Jim", "male")
    ]),
    new Table("Table Two", [
        new Student(4, "Michelle", "female"),
        new Student(5, "Erin", "female"),
        new Student(6, "Chase", "male")
    ]),
    new Table("Table Three", [
        new Student(7, "Denise", "female"),
        new Student(8, "Chip", "male"),
        new Student(9, "Kylie", "female")
    ]),
    new Table("Table Four", [
        new Student(10, "Cheryl", "female"),
        new Student(11, "Doug", "male"),
        new Student(12, "Connor", "male")
    ]),
    new Table("Table Five", [
        new Student(13, "Cody", "male"),
        new Student(14, "Farrah", "female"),
        new Student(15, "Lyla", "female")
    ])
];

var vm = new SeatingChartModel(initialTables, extraStudents);

ko.bindingHandlers.sortable.beforeMove = vm.verifyAssignments;
ko.bindingHandlers.sortable.afterMove = vm.updateLastAction;

ko.applyBindings(vm);
})(ko, jQuery);
