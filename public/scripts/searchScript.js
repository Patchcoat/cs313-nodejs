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
                resultsList.innerHTML += "<h1>"+results[i]["Title"]+
                    " <a onclick=\"detailsDB('"+results[i]["imdbID"]+"');\" href=\"#\">Details</a></h1><div id=\""+
                    results[i]["imdbID"]+"details\"></div>";
            }
        }
    }
    xhttp.open("GET", apiURL+"&s='"+query+"'", true);
    xhttp.send();
}

function detailsDB(id) {
    var details = document.getElementById(id+"details");
    if (details.innerHTML != "") {
        details.innerHTML = "";
        return;
    }
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var res = JSON.parse(this.responseText);
            console.log(res);
            details.innerHTML = "";
            details.innerHTML += "<p class='text-left'>";
            details.innerHTML += "Director: "+res.Director+"<br>";
            details.innerHTML += "Writer: "+res.Writer+"<br>";
            details.innerHTML += "Actors: "+res.Actors+"<br>";
            details.innerHTML += "Released: "+res.Released+"<br>";
            details.innerHTML += "Genre: "+res.Genre+"<br>";
            details.innerHTML += "Production: "+res.Production+"<br>";
            details.innerHTML += "Rated: "+res.Rated+"<br>";
            details.innerHTML += "Runtime: "+res.Runtime+"<br>";
            details.innerHTML += "Country: "+res.Country+"<br>";
            details.innerHTML += "<p>";
        }
    }
    xhttp.open("GET", apiURL+"&i="+id, true);
    xhttp.send();
}
