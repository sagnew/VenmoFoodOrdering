// A placeholder for an item that would be added to the tray later.
var itemToAdd = {};
var rid;
var totalPrice = 0;

// Make a request to the server to place an order.
var placeOrder = function () {
    var trayString = tray.buildTrayString();
    $.ajax({
        type: "GET",
        url: "/placeorder",
        data: {
            'rid': rid,
            'email': email,
            'tray': trayString,
            'first_name': first_name,
            'last_name': last_name,
            'phone': phone,
            'zip': zip,
            'addr': addr,
            'city': city,
            'state': state,
            'totalPrice': totalPrice,
            'accessToken': accessToken
        },
        success: function(response){
            if (response._err !== '1') {
                $('#orderMessage').append('<h3>Your order has been placed!</h3>');
            } else {
                $('#orderMessage').append('<h3>There was something wrong! Please try again!</h3>');
            }
            console.log(response);
        }
    });
};

// Render the tray whenever a new item was added or removed.
var renderTray = function () {
    $('#currentTray').empty();

    totalPrice = 0;
    var i = 0;
    _.forEach(tray.items, function (item) {
        var optionString = "";
        var itemTotalPrice = parseFloat(item.price);

        // Calculate total price with all options included, and build string.
        _.forEach(item.options, function (option) {
            itemTotalPrice += parseFloat(option.price);
            optionString += option.name + ',';
        });

        $('#currentTray').append('<div id="' + i + '" class="row trayItem"><h4>' +
            item.name + ' $' + itemTotalPrice + '</h4><div class="trayOptions"><br><h5>' +
            optionString + '</h5></div></div>');
        totalPrice += itemTotalPrice;
        i += 1;
    });

    $('#currentTray').append('<div class="row" id="totalPrice"><h4><b>Total: $' +
            totalPrice + '</b></h4></div>');
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
    } else {
        _.forEach(itemToAdd.options, function (optionInItem) {
            if (optionInItem.id === option.id) {
                var optionIndex = itemToAdd.options.indexOf(optionInItem);
                itemToAdd.options.splice(optionIndex, 1);
                return;
            }
        });
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
                            'groupId': optionGroup.id,
                            'optionGroup': optionGroup.name,
                            'groupMaxChild': parseFloat(optionGroup.max_child_select),
                            'groupMinChild': parseFloat(optionGroup.min_child_select),
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
    var $optionsModal = $('#optionsModal');
    $optionsModal.append('<div class="row" align="center"><h3>' + item.name + '</h3></div>');

    // Actually display the options.
    var h = 0, currentGroup;
    _.forEach(optionsToDisplay, function (option) {
        if (currentGroup !== option.optionGroup) {
            var selectString = "";
            if (option.groupMaxChild === option.groupMinChild && option.groupMaxChild >= 0) {
                selectString = ' (Choose ' + option.groupMaxChild + ')';
            } else if(option.groupMaxChild > 0 && option.groupMinChild === 0) {
                selectString = ' (Choose at most ' + option.groupMaxChild + ')';
            } else if(option.groupMaxChild === 0 && option.groupMinChild > 0) {
                selectString = ' (Choose at least ' + option.groupMinChild + ')';
            } else if(option.groupMaxChild === 0 && option.groupMinChild === 0) {
                selectString = ' (Choose any amount)';
            }

            $optionsModal.append('<div class="row" align="center"><h3><b>' +
            option.optionGroup + selectString + '</b></h3></div>');
            currentGroup = option.optionGroup
        }

        $optionsModal.append('<div class="row" align="center">' +
            option.name + '</h4> <div class="row"> <h5>' +
            option.description + '</h5> </div> <div class="row"> <h5>' +
            option.price + '</h5> </div> <input type="checkbox"' +
            'class="option" id="' + h + '"></input><h4></div>');
        h += 1;
    });

    $optionsModal.append('<div align="center"><input type="text" placeholder="Quantity" id="quantity"></input>');
    $optionsModal.append('<div align="center">' +
            '<button id="closeModal" class="row large-12 small-12 columns">Add to order</button></div>');
    $optionsModal.foundation('reveal', 'open');
    $('.option').change(onOptionChange);
    $('#closeModal').click(function () {
        var addItem = true;

        var optionGroups = item.children;

        // Go through each option group to check number of options.
        _.forEach(optionGroups, function (optionGroup) {
            // Find out how many options from this group are in this item.
            var numSelected = 0, max = optionGroup.max_child_select, min = optionGroup.min_child_select;
            _.forEach(itemToAdd.options, function (option) {
                if (option.groupId === optionGroup.id) {
                    numSelected += 1;
                }
            });

            if ((numSelected > max && max !== 0) || numSelected < min) {
                addItem = false;
            }
            console.log("numSelected: " + numSelected + ", max: " + max + ", min: " + min + ", addItem: " + addItem);
        });

        if (addItem) {
            // Add the item to the tray.
            tray.addToTray(itemToAdd);
            renderTray();
            $('#optionsModal').foundation('reveal', 'close');
        }
    });
};

// Executes when a menu item is selected.
var onMenuItemClick = function () {
    // Index of the item in the menu
    var index = $(this).attr('id');

    // The index in the item group's children array.
    var itemIndex = displayItems[index].itemIndex;

    // The actual item that was clicked on.
    var item = currentMenu[displayItems[index].menuIndex].children[itemIndex];
    console.log(index);
    console.log(item);

    // The item to add to the tray.
    itemToAdd = { 'id': item.id,
        'name': item.name,
        'price': item.price,
        'index': index,
        'quantity': 1,
        'options': []
    };

    displayOptions(item);
};

// Executes when a restaurant is chosen, and displays the menu for that restaurant.
var onRestaurantClick = function () {
    $('#menu').html('<h3 align="center">Loading menu</h3>');

    // Empty the tray.
    tray.items = [];
    var $currentTray = $('#currentTray');
    $currentTray.empty();
    $currentTray.append('<h3 align="center">Add items to your tray to place an order.</h3>');

    var index = $(this).attr('id');
    rid = restaurants[index].id;
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

                var i = 0;
                // Iterate through the data to build an array of all valid menu items.
                _.forEach(menu, function (menuChild) {
                    var j = 0;
                    _.forEach(menuChild.children, function (item) {
                        var shouldReturn = false;
                        _.forEach(item.availability, function (mealTime) {
                            if (_.contains(availableMeals, mealTime)) {
                                displayItems.push({
                                    'id': item.id,
                                    'menuIndex': i,
                                    'itemIndex': j,
                                    'groupName': menuChild.name,
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
                var $menu = $('#menu');
                var i = 0, j = 0;
                _.forEach(displayItems, function (item) {
                    if (j === item.menuIndex){
                        // Then this is the first item of this group.
                        $menu.append('<div class="row" align="center"><h3><b>' +
                            item.groupName + '</b></h3></div>');
                        j += 1;
                    }

                    var itemString;
                    if (item.description) {
                        itemString = '<div class="row" align="center"><h4>' +
                            item.name + ' </h4> <div class="row"> <h5>' + item.description +
                            '</h5> </div> <div class="row"> <h5>' + item.price +
                            '</h5> </div> <button type="checkbox" class="tiny menu-item" id="' + i +
                            '">Add</input> </div>';
                    } else {
                        itemString = '<div class="row" align="center"><h4>' +
                            item.name + '</h4><div class="row"> <h5>' + item.price +
                            '</h5> </div> <button type="checkbox" class="tiny menu-item" id="' + i +
                            '">Add</input> </div>';
                    }

                    $menu.append(itemString);
                    i += 1;
                });

                $('.menu-item').click(onMenuItemClick);

            });
        }
    });
};

$(document).ready(function () {
    var displayItems = [];
    var currentMenu = {};
    $('.restaurant').click(onRestaurantClick);
    $('#placeOrder').click(placeOrder);
});
