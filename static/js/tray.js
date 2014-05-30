// Adds an item to the tray.
var addToTray = function (item) {
    // Insert the item into the key, value store.
    this.items.push(item);

    // Render the tray.
};

// Removes an item with the given ID from the tray.
var removeFromTray = function (id) {
    // Delete the item from the key, value store.
    delete this.items[id];

    // Render the new tray.
};

// Builds the string needed to order with the Ordr.in API.
var buildTrayString = function () {
};

// Create the tray object.
tray = {
    'addToTray': addToTray,
    'removeFromTray': removeFromTray,
    'buildTrayString': buildTrayString,
    'items': []
};
