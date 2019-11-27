var apiURL = "http://www.omdbapi.com/?apikey=7fb4142";

function searchDB() {
    var query = document.getElementById("search").value;
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var results = JSON.parse(this.responseText).Search;
            console.log(results);
            var resultsList = document.getElementById("results");
            resultsList.innerHTML = "";
            for (var i = 0; i < results.length; i++) {
                resultsList.innerHTML += "<p>"+results[i]["Title"]+"</p>";
            }
        }
    }
    xhttp.open("GET", apiURL+"&s='"+query+"'", true);
    xhttp.send();
}
