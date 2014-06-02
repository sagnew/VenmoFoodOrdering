// A placeholder for an item that would be added to the tray later.
var itemToAdd = {};

// Render the tray whenever a new item was added or removed.
var renderTray = function () {
    $('#tray').empty();
};

// Executes when an option's checkbox is checked or unchecked.
var onOptionChange = function () {
    // Index of the option in the menu
    var index = $(this).attr('id');

    // The index in the item group's children array.
    var option = optionsToDisplay[index];

    if (this.checked) {
        // Add the option to the current item to be placed in the tray.
        itemToAdd.options.push(option);
    }
};

// Displays a menu for selection options for a given item.
var displayOptions = function (item) {
    $('#optionsModal').empty();
    $('#optionsModal').append('<h3 align="center">Options</h3>' +
        '<a class="close-reveal-modal">&#215;</a>');

    // Intentionally global for now.
    optionsToDisplay = [];
    if (item.children) {
        _.forEach(item.children, function (optionGroup) {
            _.forEach(optionGroup.children, function (option) {
                _.forEach(option.availability, function (mealTime) {
                    if (_.contains(availableMeals, mealTime)) {
                        optionsToDisplay.push({
                            'id': option.id,
                            'itemId': item.id,
                            'name': option.name,
                            'price': option.price,
                            'description': option.descrip
                        });
                    }
                });
            });
        });
    }

    // Item name for reminder.
    $('#optionsModal').append('<div class="row" align="center"><h3>' + item.name + '</h3></div>');

    // Actually display the options.
    var h = 0;
    _.forEach(optionsToDisplay, function (option) {
        $('#optionsModal').append('<div class="row" align="center">' +
            option.name + '</h4> <div class="row"> <h5>' +
            option.description + '</h5> </div> <div class="row"> <h5>' +
            option.price + '</h5> </div> <input type="checkbox"' +
            'class="option" id="' + h + '"></input><h4></div>');
        h += 1;
    });

    $('#optionsModal').append('<div align="center"><input type="text" placeholder="Quantity" id="quantity"></input>');
    $('#optionsModal').append('<div align="center">' +
            '<button id="closeModal" class="row large-12 small-12 columns">Add to order</button></div>');
    $('#optionsModal').foundation('reveal', 'open');
    $('.option').change(onOptionChange);
    $('#closeModal').click(function () {
        // Add the item to the tray.
        tray.addToTray(itemToAdd);
        $('#optionsModal').foundation('reveal', 'close');
    });
};

// Executes when a menu item's checkbox is checked or unchecked.
var onMenuItemChange = function () {
    // Index of the item in the menu
    var index = $(this).attr('id')

    // The index in the item group's children array.
    var itemIndex = displayItems[index].itemIndex;

    // The actual item that was clicked on.
    var item = currentMenu[displayItems[index].menuIndex].children[itemIndex];

    // The item to add to the tray.
    itemToAdd = { 'id': item.id,
        'name': item.name,
        'price': item.price,
        'quantity': 1,
        'options': []
    };

    displayOptions(item);
};

// Executes when a restaurant is chosen, and displays the menu for that restaurant.
var onRestaurantClick = function () {
    $('#menu').html('<h3 align="center">Loading menu</h3>');
    var index = $(this).attr('id');
    var rid = restaurants[index].id;
    $.getJSON('/fee', { 'rid': rid, 'addr': addr, 'city': city, 'zip': zip }, function (feeData) {
        var minOrderAmount = parseFloat(feeData.mino);
        availableMeals = feeData.meals;
        var willStillDeliver = feeData.delivery;

        // Clear the loading message.
        $('#menu').empty();

        //Display either a menu or a notifaction that there is no delivery.
        if (willStillDeliver === '0' || feeData.msg){
            $('#menu').append('<h3 align="center">This restaurant is no longer currently delivering</h3>');
        } else {
            $.getJSON('/menuitems', { 'rid': rid }, function (menu) {
                displayItems = [];
                currentMenu = menu;

                // Iterate through the data to build an array of all valid menu items.
                _.forEach(menu, function (menuChild) {
                    var i = 0;
                    _.forEach(menuChild.children, function (item) {
                        var j = 0;
                        var shouldReturn = false;
                        _.forEach(item.availability, function (mealTime) {
                            if (_.contains(availableMeals, mealTime)) {
                                displayItems.push({
                                    'id': item.id,
                                    'menuIndex': i,
                                    'itemIndex': j,
                                    'name': item.name,
                                    'description': item.descrip,
                                    'price': item.price
                                });
                                shouldReturn = true;
                                return;
                            }
                        });
                        j += 1;
                        if (shouldReturn) {
                            shouldReturn = false;
                            return;
                        }
                    });
                    i += 1;
                });

                // Populate the menu div with all valid menu items.
                var k = 0;
                _.forEach(displayItems, function (item) {
                    $('#menu').append('<div class="row" align="center"><h4>' +
                        item.name + ' <input type="checkbox" class="menu-item" id="' + k +
                        '"></input> </h4> <div class="row"> <h5>' + item.description +
                        '</h5> </div> <div class="row"> <h5>' + item.price +
                        '</h5> </div></div>');
                    k += 1;
                });

                $('.menu-item').change(onMenuItemChange);

            });
        }
    });
};

$(document).ready(function () {
    var displayItems = [];
    var currentMenu = {};
    $('.restaurant').click(onRestaurantClick);
});
