document.getElementById("join").addEventListener("click", function() {
  sessionStorage.name = document.getElementById("name").value;
  sessionStorage.id = document.getElementById("id").value;
});