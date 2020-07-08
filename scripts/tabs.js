
displayTab = function(id){
    itemsTab = document.getElementsByClassName('inactiveTab');
    for (var i in itemsTab){
        if (typeof itemsTab[i] != 'object') 
            continue;
        itemsTab[i].setAttribute('class', 'inactiveTab');
    }
    $(id).setAttribute('class', 'inactiveTab activeClass');
};

