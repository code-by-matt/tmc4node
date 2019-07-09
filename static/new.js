document.getElementById("new").addEventListener("click", function() {
  sessionStorage.name = document.getElementById("name").value;
  sessionStorage.id = Math.random().toString(36).substr(6);
});
