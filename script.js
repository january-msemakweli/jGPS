// Initialize project data
let currentProject = { name: null, locations: [] };

const projectTitle = document.getElementById('project-title');
const gpsTableBody = document.querySelector('#gps-table tbody');
const mainContent = document.getElementById('main-content');

// Button References
const newProjectButton = document.getElementById('new-project');
const loadProjectButton = document.getElementById('load-project');
const saveProjectButton = document.getElementById('save-project');
const addLocationButton = document.getElementById('add-location');
const exportDataButton = document.getElementById('export-data');
const closeProjectButton = document.getElementById('close-project');

// Initial View Setup
function showInitialView() {
  newProjectButton.style.display = 'block';
  loadProjectButton.style.display = 'block';
  mainContent.style.display = 'none';
}

function showProjectView() {
  newProjectButton.style.display = 'none';
  loadProjectButton.style.display = 'none';
  mainContent.style.display = 'block';
}

// Update the Table with Project Data
function updateTable() {
  gpsTableBody.innerHTML = '';
  currentProject.locations.forEach((location, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${index + 1}</td><td>${location.latitude}</td><td>${location.longitude}</td><td><button onclick="deleteLocation(${index})">Delete</button></td>`;
    gpsTableBody.appendChild(row);
  });
}

// Delete Location
function deleteLocation(index) {
  currentProject.locations.splice(index, 1);
  updateTable();
}

// Create a New Project
newProjectButton.addEventListener('click', () => {
  const projectName = prompt('Enter a name for the new project:');
  if (projectName) {
    currentProject = { name: projectName, locations: [] };
    projectTitle.textContent = `Project: ${projectName}`;
    updateTable();
    showProjectView();
  }
});

// Load an Existing Project with .jgps Extension
loadProjectButton.addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.jgps';
  input.onchange = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function(event) {
      const savedProject = event.target.result;
      currentProject = JSON.parse(savedProject);
      projectTitle.textContent = `Project: ${currentProject.name}`;
      updateTable();
      showProjectView();
    };
    reader.readAsText(file);
  };
  input.click();
});

// Save the Project as .jgps
saveProjectButton.addEventListener('click', () => {
  if (currentProject.name) {
    const projectData = JSON.stringify(currentProject);
    const blob = new Blob([projectData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentProject.name}.jgps`;
    link.click();
  } else {
    alert('No project to save.');
  }
});

// Add a New Location
addLocationButton.addEventListener('click', () => {
  if (!currentProject.name) {
    alert('Create a project first.');
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      currentProject.locations.push({ latitude, longitude });
      updateTable();
    },
    () => {
      alert('Geolocation error.');
    }
  );
});

// Export Data to CSV
exportDataButton.addEventListener('click', () => {
  if (!currentProject.locations.length) {
    alert('No data to export.');
    return;
  }
  const csvContent = 'data:text/csv;charset=utf-8,ID,Latitude,Longitude\n' + currentProject.locations.map((loc, idx) => `${idx + 1},${loc.latitude},${loc.longitude}`).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.href = encodedUri;
  link.download = `${currentProject.name}_locations.csv`;
  link.click();
});

// Close the Current Project
closeProjectButton.addEventListener('click', () => {
  if (confirm('Are you sure you want to close the project? Unsaved changes will be lost.')) {
    currentProject = { name: null, locations: [] };
    projectTitle.textContent = 'No Project Loaded';
    updateTable();
    showInitialView();
  }
});

// Initial Call to Setup the View
showInitialView();
