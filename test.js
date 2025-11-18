fetch("https://api.themoviedb.org/3/person/500?api_key=48f5a7ea9cee75de9724107b1010b16e")
  .then(res => res.json())
  .then(data => console.log("SUCCESS:", data.name))
  .catch(err => console.error("FAIL:", err));
