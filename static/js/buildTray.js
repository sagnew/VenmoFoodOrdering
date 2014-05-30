// Displays a menu for selection options for a given item.
var displayOptions = function (index) {
    console.log(index);
    var item = currentMenu[displayItems[index].menuIndex];
    optionsToDisplay = [];
    console.log(item);
    console.log(item.children.length > 0);
    if (item.children.length > 0) {
        for (var i = 0; i < item.children.length; i += 1) {
            var option = item.children[i];
            console.log(availableMeals);
            console.log(option.availability);
            for (var j = 0; j < option.availability.length; j += 1) {
                if (availableMeals.indexOf(option.availability[j]) !== -1) {
                    optionsToDisplay.push({
                        'id': option.id,
                        'name': option.name,
                        'price': option.price,
                        'description': option.descrip
                    });
                }
            }
        }

        // Actually display the options.
        for (var h = 0; h < optionsToDisplay.length; h += 1) {
            option = optionsToDisplay[h];
            $('#optionsModal').append('<div class="row" align="center">' +
                '<input type="checkbox" class="menu-item" id="' + h +
                '"></input><h4>' + option.name + '</h4> <div class="row"> <h5>' +
                option.description + '</h5> </div> <div class="row"> <h5>' +
                option.price + '</h5> </div></div>');
        }
        $('#optionsModal').foundation('reveal', 'open');
    }
};

// Executes when a menu item's checkbox is checked or unchecked.
var onMenuItemChange = function () {
    if (this.checked) {
        displayOptions($(this).attr('id'));
    }
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
                for (var i = 0; i < menu.length; i += 1) {
                    for (var j = 0; j < menu[i].children.length; j += 1) {
                        // i is the index in the menu, and j is the index
                        // for the menu's children
                        var item = menu[i].children[j];
                        for (var h =0; h < item.availability.length; h += 1) {
                            if (availableMeals.indexOf(item.availability[h]) !== -1) {
                                displayItems.push({
                                    'id': item.id,
                                    'menuIndex': i,
                                    'name': item.name,
                                    'description': item.descrip,
                                    'price': item.price
                                });
                                break;
                            }
                        }
                    };
                };

                // Populate the menu div with all valid menu items.
                for (var k = 0; k < displayItems.length; k += 1) {
                    var item = displayItems[k];
                    $('#menu').append('<div class="row" align="center"><h4>' +
                        item.name + ' <input type="checkbox" class="menu-item" id="' + k +
                        '"></input> </h4> <div class="row"> <h5>' + item.description +
                        '</h5> </div> <div class="row"> <h5>' + item.price +
                        '</h5> </div></div>');
                }

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
