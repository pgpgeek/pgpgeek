$ = (el) => {
    if (typeof (el) == 'string') {
      switch (el.charAt(0)) {
        case '#':
          return document.getElementById(el.substr(1, 50));
          break;
        case '.':
          return document.getElementsByClassName(el.substr(1, 50))
          break;
        default:
          return document.getElementsByTagName(el)
          break;
      }
    }
    return null;
  }