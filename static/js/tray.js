// Adds an item to the tray.
var addToTray = function (item) {

    if (this.items.length > 0) {
        // Check for duplicate items, and update quantity instead.
        for (var i = 0; i < this.items.length; i += 1) {
            if (this.items[i].id === item.id) {
                var oldItemOptions = this.items[i].options;
                var newItemOptions = item.options;
                if (oldItemOptions && newItemOptions) {
                    // Both items have options.
                    for (var j = 0; j < oldItemOptions.length; j += 1) {
                        for (var k = 0; k < newItemOptions.length; k += 1) {
                            if (oldItemOptions[j] !== newItemOptions[k]) {
                                // Insert the item into the tray items array.
                                this.items.push(item);
                                return;
                            }
                        }
                    }
                }
                // These are the same items, therefore just increase quantity.
                this.items[i].quantity += item.quantity;
            } else {
                this.items.push(item);
                return;
            }
        }
    } else {
        this.items.push(item);
        return;
    }

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
