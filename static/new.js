(function() {
  document.getElementsByTagName("button")[0].addEventListener("click", function() {
    document.getElementsByTagName("input")[0].value = Math.random().toString(36).substr(6);
    document.getElementsByTagName("form")[0].submit();
  });
})();