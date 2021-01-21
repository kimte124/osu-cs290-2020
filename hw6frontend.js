// Snippets of code used from course modules, W3 Schools and GeeksforGeeks.
// Function to GET to root directory and retrieve current workouts.
function getWorkouts() {
  var req = new XMLHttpRequest();
  
	req.open("GET", "http://flip1.engr.oregonstate.edu:9199/", true);
  req.addEventListener('load',function(){
    if(req.status >= 200 && req.status < 400){
      var response = req.responseText;
      console.log(response);

      // Constants to create DOMParser and grab response.
      const parser = new DOMParser();
      const newDoc = parser.parseFromString(response, 'text/html');

      // Use DOM to get just innerHTML of the table.
      document.getElementById("workoutTable").innerHTML = newDoc.getElementById("workoutTable").innerHTML;

      // Change 0 and 1 for units into lbs or kg.
      document.querySelectorAll('.entryUnit').forEach(function(item) {
        if(item.innerHTML == 0) {
          item.innerHTML = 'kg';
        } else {
        item.innerHTML = 'lbs';
      }});

      // Add event listener for each delete button.
      document.querySelectorAll('.deleteRow').forEach(function(item) {
        item.addEventListener('click', function(event) {
          deleteRow(item.value);
          event.preventDefault();
      })});

      // Add event listener for each edit button.
      document.querySelectorAll('.editRow').forEach(function(item) {
        item.addEventListener('click', function(event) {
          editRow(item.value);
          event.preventDefault();
      })});

      // Add event listener for each update button.
      document.querySelectorAll('.updateRow').forEach(function(item) {
        item.addEventListener('click', function(event) {
          updateRow(item.value);
          event.preventDefault();
      })});
    } else {
    console.log("Error in network request: " + req.statusText);
  }});
  
  req.send();
};

// Event listener for submit button for adding a new row.
document.getElementById("submitworkout").addEventListener("click", function(event) {
  // Variable for request.
  var req = new XMLHttpRequest();

  // Variables for each entry in form.
  var name = document.getElementById("name").value;
  var reps = document.getElementById("reps").value;
  var weight = document.getElementById("weight").value;
  var date = document.getElementById("date").value;
  var lbs = document.getElementById("unit").value;

  if (name && reps && weight && date && lbs) {
    req.open('POST', 'http://flip1.engr.oregonstate.edu:9199/?name=' + name + "&reps=" + reps + "&weight=" + weight + "&date=" + date + "&lbs=" + lbs, true);

    // Event listener that fires when entire page is loaded, and triggers function.
    req.addEventListener('load',function(){
      if(req.status >= 200 && req.status < 400){
        var response = req.responseText;
        console.log(response);

        // Get workout rows for database to display latest data on page.
        getWorkouts();

      } else {
      console.log("Error in network request: " + req.statusText);
    }});
   
    req.send();

    // Prevent page from reloading.
    event.preventDefault();
  } else {
    alert("Please fill in all fields.")
}});

// Function to delete row and takes id of row as a parameter.
function deleteRow(idVal) {
  var req = new XMLHttpRequest();
  var id = idVal;
    
  req.open('GET', 'http://flip1.engr.oregonstate.edu:9199/delete?id=' + id, true);
    
  // Event listener that fires when entire page is loaded, and triggers function.
  req.addEventListener('load',function(){
    if(req.status >= 200 && req.status < 400){
      var response = req.responseText;
      console.log(response);

      // Get workout rows for database to display latest data on page.
      getWorkouts();
    
    } else {
    console.log("Error in network request: " + req.statusText);
  }});
  req.send();
};

// Function to update row and takes id of row as a parameter.
function updateRow(idVal) {
  var req = new XMLHttpRequest();
  var id = idVal;
  var table = document.getElementById("mainWorkoutTable");
  var rowIndex = findRow(idVal)
  
  // Variables for each entry in row that needs to be upated after editing.
  var name = table.rows[rowIndex].cells[1].innerHTML;
  var reps = table.rows[rowIndex].cells[2].innerHTML;
  var weight = table.rows[rowIndex].cells[3].innerHTML;
  var date = table.rows[rowIndex].cells[4].innerHTML;
  var lbs = table.rows[rowIndex].cells[5].innerHTML;

  if (date == "") {
    date = ""
  } else {
  // Change date format back into year-month-date for MySQL.
  date = date.slice(6) + '-' + date.slice(0, 2) + '-' + date.slice(3, 5);
  };
  
  // Change kg and lbs back into 0 or 1.
  if(lbs == 'kg') {
    lbs = 0;
  } else {
  lbs = 1;
  };

  req.open('POST', 'http://flip1.engr.oregonstate.edu:9199/update?id=' + id + "&name=" + name + "&reps=" + reps + "&weight=" + weight + "&date=" + date + "&lbs=" + lbs, true);

  // Event listener that fires when entire page is loaded, and triggers function.
  req.addEventListener('load',function(){
    if(req.status >= 200 && req.status < 400){
      var response = req.responseText;
      console.log(response);
      
      // Change each cell back to being uneditable.
      table.rows[rowIndex].cells[1].contentEditable = false;
      table.rows[rowIndex].cells[2].contentEditable = false;
      table.rows[rowIndex].cells[3].contentEditable = false;
      table.rows[rowIndex].cells[4].contentEditable = false;
      table.rows[rowIndex].cells[5].contentEditable = false;

      getWorkouts();

    } else {
    console.log("Error in network request: " + req.statusText);
  };
  req.send();
})};

// Function to make table cells editable.
function editRow(idVal) {
  var table = document.getElementById("mainWorkoutTable");
  var rowIndex = findRow(idVal)
  // Let each cell in a particular row be editable.
  table.rows[rowIndex].cells[1].contentEditable = true;
  table.rows[rowIndex].cells[2].contentEditable = true;
  table.rows[rowIndex].cells[3].contentEditable = true;
  table.rows[rowIndex].cells[4].contentEditable = true;
  table.rows[rowIndex].cells[5].contentEditable = true;
};

// Function to find row with matching id value and return row index.
function findRow(idVal) {
  var table = document.getElementById("mainWorkoutTable");
  var rowIndex;

  // For loop to iterate through table rows.
  for (var i = 0, row; row = table.rows[i]; i++) {

    if (row.cells[0].innerHTML == idVal) {
      var rowIndex = i;
      return rowIndex;
}}};