$(document).ready(function () {
    $('.restaurant').click(function () {
        $('#menu').html('<h2 align="center">Menu</h2>');
        var index = $(this).attr('id');
        var rid = restaurants[index].id;
        $.getJSON('/fee', { 'rid': rid, 'addr': addr, 'city': city, 'zip': zip }, function (feeData) {
            var minOrderAmount = parseFloat(feeData.mino);
            var availableMeals = feeData.meals;
            var willStillDeliver = feeData.delivery;
            if (willStillDeliver === '0' || feeData.msg){
                $('#menu').append('<h3 align="center">This restaurant is no longer currently delivering</h3>');
            } else {
                $.getJSON('/menuitems', { 'rid': rid }, function (menu) {
                    // Intentionally global for now
                    displayItems = [];
                    // Iterate through the data to build an array of all valid menu items
                    for (var i = 0; i < menu.length; i += 1) {
                        for (var j = 0; j < menu[i].children.length; j += 1) {
                            // i is the index in the menu, and j is the index
                            // for the menu's children
                            var item = menu[i].children[j];
                            for (var h =0; h < item.availability.length; h += 1) {
                                if (availableMeals.indexOf(item.availability[h]) !== -1) {
                                    displayItems.push({
                                        'name': item.name,
                                        'description': item.descrip,
                                        'price': item.price
                                    });
                                }
                            }
                        };
                    };

                    // Populate the menu div with all valid menu items
                    for (var k = 0; k < displayItems.length; k += 1) {
                        var item = displayItems[k];
                        $('#menu').append('<div class="row" id="' + k + '"><h3>' +
                                item.name + '</h3> <br> <h4>' + item.description +
                                '</h4> <br> <h4>' + item.price + '</h4> </div>');
                    }
                });
            }
        });
    });
});
