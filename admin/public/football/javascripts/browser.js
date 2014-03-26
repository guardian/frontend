jQuery(function($){
    'use strict';

    var selectors = {
            query: ".query",
            parameters: ".parameters",
            form: "form.browser-form",
            teamChange: '#team-change'
        },
        dom = (function(){
            var dom = {};
            for (var key in selectors) {
                if (selectors.hasOwnProperty(key)) {
                    dom[key] = $(selectors[key]);
                }
            }
            return dom;
        })(),
        hints = {
            teamID: [
                {
                    label: "Spurs",
                    value: "19"
                },
                {
                    label: "Chelsea",
                    value: "4"
                },
                {
                    label: "Hull",
                    value: "26"
                },
                {
                    label: "Man Utd",
                    value: "12"
                },
                {
                    label: "Newcastle",
                    value: "31"
                }
            ],
            playerID: [
                {
                    label: "Joe Hart",
                    value: "Joe_Hart"
                },
                {
                    label: "Emmanuel Adebayor",
                    value: "237670"
                }
            ],
            matchID: [{
                label: "Swansea v Spurs, 19/01/2014",
                value: "3684146"
            }],
            managerID: [{
                label: "Andre Villas-Boas",
                value: "468795"
            }],
            seasonID: [{
                label: "Premier league 2013/14",
                value: "785"
            }],
            competitionID: [{
                label: "Premier league 2013/14",
                value: "100"
            }],
            type: [
                {
                    label: "Strikers",
                    value: "Strikers"
                },
                {
                    label: "Midfielders",
                    value: "Midfielders"
                },
                {
                    label: "Defenders",
                    value: "Defenders"
                },
                {
                    label: "GoalKeepers",
                    value: "GoalKeepers"
                },
                {
                    label: "Top100",
                    value: "Top100"
                }
            ]
        },
        currentFields = {},
        createReplacements = function() {
            var r = /({.*?})/g,
                query = dom.query.val(),
                fields = $.map(query.match(r), function(field){
                    return field.replace("{", "").replace("}", "");
                }).filter(function(field){
                    return field !== "apiKey";
                });
            $.each(fields, function(_, field){
                if (!currentFields.hasOwnProperty(field)) {
                    addReplacementField(field);
                }
            });
            $.each(currentFields, function(currentFieldName, _){
                if (-1 === $.inArray(currentFieldName, fields)) {
                    currentFields[currentFieldName].remove();
                    delete currentFields[currentFieldName];
                }
            });
        },
        addReplacementField = function(name) {
            var field = $("<div class='param-field'><label>" + name + ": <input type='text' name='" + name + "' /></label></div>");
            if (hints.hasOwnProperty(name)) {
                $.each(hints[name], function(_, hint){
                    field.append($("<a href='#' class='hint' data-value='" + hint.value + "'>&larr; " + hint.label + "</a>"));
                });
            }
            if (/(Date|Day)$/.test(name) || "date" === name) {
                field.find("input").datepicker({dateFormat: 'yymmdd'})
            }
            currentFields[name] = field;
            dom.parameters.append(field);
        },
        insertHint = function(hintLink) {
            $(hintLink.parent()).find("input").val(hintLink.data("value"));
        };

    // alias hints
    hints.team1ID = hints.teamID;
    hints.team2ID = hints.teamID;
    hints.player1ID = hints.playerID;
    hints.player2ID = hints.playerID;
    hints.competition = hints.competitionID;

    dom.query.on("change", createReplacements);
    dom.query.on("keyup", createReplacements);
    dom.query.on("paste", function(){
        setTimeout(createReplacements, 10);
    });
    dom.form.on("submit", function() {
        dom.query.val(dom.query.val().replace("{", "%7B").replace("}", "%7D"));
    });
    dom.parameters.on("click", ".hint", function(e) {
        e.preventDefault();
        insertHint($(this));
    });

    dom.teamChange.on("change", function() {
        var select = this.elements.team;
        window.location = '/team/images/'+ select.options[select.selectedIndex].value;
    });

    $('.foot-autocomplete').footAutocomplete();
});

// autocomplete
$.widget('custom.footAutocomplete', {
    _create: function() {
        var self = this;
        $('<input type="text" class="fautocomplete__input form-control" />').autocomplete({
            delay: 0,
            _renderItem: function(ul, item) {
                return $('<li>')
                    .attr('data-id', item.id)
                    .append($('<a>').text( item.value ))
                    .appendTo(ul);
            },
            source: self.element.find('option')
                .filter(function(i, o) { return o.value; })
                .map(function(i, o) { return { id: o.value, value: o.innerHTML }; })
                .toArray(),

            select: function(event, ui) {
                self.element.val(ui.item.id);
                $('#focus-on-team').attr('checked', 'checked');
            }
        }).insertBefore(this.element.hide());
    }
});
