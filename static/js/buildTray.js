$(document).ready(function () {
    $('.restaurant').click(function () {
         var index = $(this).attr('id');
         var rid = restaurants[index].id;
         $.getJSON('/menuitems', { 'rid': rid }, function (menu) {
             var displayItems = [];
             menu.forEach(function (group) {
                 group.forEach(function (item) {
                     if (item.availability === 0) {
                         displayItems.push({
                            'name': item.name,
                             'description': item.descrip,
                             'price': item.price
                         });
                     }
                 });
             });
         )};
    });
});
