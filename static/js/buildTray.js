$(document).ready(function () {
    $('.restaurant').click(function () {
        var index = $(this).attr('id');
        var rid = restaurants[index].id;
        $.getJSON('/fee', { 'rid': rid, 'addr': addr, 'city': city, 'zip': zip }, function (feeData) {
            var minOrderAmount = parseFloat(feeData.mino);
            var availableMeals = feeData.meals;
            var willStillDeliver = feeData.delivery;
            if (willStillDeliver === '0'){
                // Display a notifation that this restaurant is no longer delivering
            }
            else{
                $.getJSON('/menuitems', { 'rid': rid }, function (menu) {
                    var displayItems = [];
                    for (var i = 0; i < menu.length; i += 1) {
                        for (var j = 0; j < menu[i].children.length; j += 1) {
                            // i is the index in the menu, and j is the index
                            // for the menu's children
                            var item = menu[i].children[j];
                            if (item.availability === 0) {
                                displayItems.push({
                                    'name': item.name,
                                    'description': item.descrip,
                                    'price': item.price
                                });
                            }
                        };
                    };
                });
            }
        });
    });
});
