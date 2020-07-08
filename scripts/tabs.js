
displayTab = function(id){
    itemsTab = document.getElementsByClassName('inactiveTab');

    console.log(itemsTab);
    for (var i in itemsTab){
        if (typeof itemsTab[i] != 'object') continue;
        console.log('==========>', itemsTab[i].id, itemsTab[i].getAttribute('class'))
        itemsTab[i].setAttribute('class', 'inactiveTab');
    }
    document.getElementById(id).setAttribute('class', 'inactiveTab activeClass');
};

document.getElementById("actions-tab").addEventListener("click", displayTab.bind(null,  'box-actions'));
document.getElementById("settings-tab").addEventListener("click", displayTab.bind(null, 'box-settings'));
document.getElementById("others-tab").addEventListener("click", displayTab.bind(null,   'box-others'));
