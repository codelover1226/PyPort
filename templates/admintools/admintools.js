function submitForm() {
    document.getElementById("sortForm").submit();
  }

  function confirmDeletion() {
    return confirm("Are you sure you want to delete this project?");
  }
document.addEventListener('DOMContentLoaded', function() {
  // Replace 'None' with '...' in all initial paginations
  const paginationContainers = document.querySelectorAll('.pagination-container');
  paginationContainers.forEach(container => {
      replaceNoneWithEllipsis(container);
  });
  attachPaginationEventListeners();
});

function attachPaginationEventListeners() {
  const paginationLinks = document.querySelectorAll('.ajax-pagination-link');
  paginationLinks.forEach(link => {
      link.removeEventListener('click', handlePaginationClick);
      link.addEventListener('click', handlePaginationClick);
  });
}

function handlePaginationClick(event) {
  event.preventDefault();
  const url = this.getAttribute('href');
  // Find the closest parent with the class .pagination-container
  const paginationContainer = this.closest('.pagination-container');
  if (!paginationContainer) {
      return; // Exit the function if no container is found
  }
  const sectionType = paginationContainer.getAttribute('data-pagination-type');
  // Prepare the updated URL based on the section type
  let updatedUrl = url;
  if (sectionType === 'map_object') {
      const searchQuery = document.getElementById('searchMapObject').value;
      updatedUrl = `${url}&searchMapObject=${searchQuery}`;
  } else if (sectionType === 'comment') {
      const searchQuery = document.getElementById('searchComment').value; // Assuming you have a search input for comments with this ID
      updatedUrl = `${url}&searchComment=${searchQuery}`;
  }
  updatePaginationContent(updatedUrl, sectionType);
}

function updateCommentList() {
  const userId = document.getElementById('searchCommentByUserId').value;
  const searchQuery = document.getElementById('searchComment').value;
  let queryParams = new URLSearchParams();
  if (userId) queryParams.set('searchCommentByUserId', userId);
  if (searchQuery) queryParams.set('searchComment', searchQuery);
  fetch(`/admintools?${queryParams.toString()}`, {
      headers: {
          'X-Requested-With': 'XMLHttpRequest'
      }
  }).then(response => response.text()).then(html => {
      const newContent = document.createElement('div');
      newContent.innerHTML = html;
      const oldCommentContainer = document.getElementById('comment-list-container');
      const newCommentContainer = newContent.querySelector('#comment-list-container') || document.createElement('div');
      newCommentContainer.innerHTML = newCommentContainer.innerHTML || " < p > Keine Kommentare gefunden. < /p>";
      oldCommentContainer.innerHTML = newCommentContainer.innerHTML;
      const oldPagination = document.querySelector('.pagination-container[data-pagination-type="comment"]');
      const newPagination = newContent.querySelector('.pagination-container[data-pagination-type="comment"]');
      if (oldPagination) {
          oldPagination.innerHTML = newPagination ? newPagination.innerHTML : '';
          oldPagination.style.display = newPagination && newPagination.innerHTML.trim() ? 'block' : 'none';
      }
      attachPaginationEventListeners();
  }).catch(error => {});
}

function searchComments() {
  updateCommentList();
}

function searchCommentsByUserId() {
  updateCommentList();
}

function updatePaginationContent(url, sectionType) {
  fetch(url + '&request_type=' + sectionType, {
      headers: {
          'X-Requested-With': 'XMLHttpRequest'
      },
      method: 'GET',
      credentials: 'same-origin'
  }).then(response => {
      return response.text();
  }).then(html => {
      const newContent = document.createElement('div');
      newContent.innerHTML = html;
      let oldContainer, newContainer;
      if (sectionType === 'project') {
          oldContainer = document.getElementById('project-list-container');
          newContainer = newContent.querySelector('#project-list-container');
      } else if (sectionType === 'map_object') {
          oldContainer = document.getElementById('map-object-list-container');
          newContainer = newContent.querySelector('#map-object-list-container');
      } else if (sectionType === 'comment') {
          oldContainer = document.getElementById('comment-list-container');
          newContainer = newContent.querySelector('#comment-list-container');
      } else if (sectionType === 'user') {
          oldContainer = document.getElementById('user-list-container');
          newContainer = newContent.querySelector('#user-list-container');
      }
      if (oldContainer && newContainer) {
          oldContainer.innerHTML = newContainer.innerHTML;
      } else {

      }
      reconstructPaginationButtons(newContent, sectionType);
      attachPaginationEventListeners();
  }).catch(error => {

  });
}

function handleResponse(response) {
  response.text().then(html => {
      const newContent = document.createElement('div');
      newContent.innerHTML = html;
      const oldCommentContainer = document.getElementById('comment-list-container');
      let newCommentContainer = newContent.querySelector('#comment-list-container');
      oldCommentContainer.innerHTML = newCommentContainer ? newCommentContainer.innerHTML : " < p > Keine Kommentare gefunden. < /p>";
      const oldPagination = document.querySelector('.pagination-container[data-pagination-type="comment"]');
      const newPagination = newContent.querySelector('.pagination-container[data-pagination-type="comment"]');
      if (newPagination) {
          oldPagination.innerHTML = newPagination.innerHTML;
      } else {
          oldPagination.innerHTML = '';
      }
      attachPaginationEventListeners();
  });
}

function handleError(error) {

}

function updateCommentSection(html) {
  const newContent = document.createElement('div');
  newContent.innerHTML = html;
  const oldCommentContainer = document.getElementById('comment-list-container');
  let newCommentContainer = newContent.querySelector('#comment-list-container');
  if (!newCommentContainer) {
      newCommentContainer = document.createElement('div');
      newCommentContainer.innerHTML = " < p > Keine Kommentare gefunden. < /p>";
  }
  if (oldCommentContainer) {
      oldCommentContainer.innerHTML = newCommentContainer.innerHTML;
  } else {

  }
  const oldPagination = document.querySelector('.pagination-container[data-pagination-type="comment"]');
  const newPagination = newContent.querySelector('.pagination-container[data-pagination-type="comment"]');
  if (oldPagination) {
      if (newPagination && newPagination.innerHTML.trim()) {
          oldPagination.innerHTML = newPagination.innerHTML;
          replaceNoneWithEllipsis(oldPagination);
      } else {
          oldPagination.innerHTML = ''; // Clear the pagination if no results or single page
      }
  }
  attachPaginationEventListeners();
}

function searchMapObjects() {
  const searchQuery = document.getElementById('searchMapObject').value;
  fetch(`/admintools?map_object_page=1&searchMapObject=${searchQuery}`, {
      headers: {
          'X-Requested-With': 'XMLHttpRequest'
      }
  }).then(response => response.text()).then(html => {
      const newContent = document.createElement('div');
      newContent.innerHTML = html;
      const oldMapObjectContainer = document.getElementById('map-object-list-container');
      let newMapObjectContainer = newContent.querySelector('#map-object-list-container');
      // Handle 'No results found' scenario
      if (!newMapObjectContainer) {
          newMapObjectContainer = document.createElement('div');
          newMapObjectContainer.innerHTML = " < p > Keine Ergebnisse gefunden. < /p>";
      }
      if (oldMapObjectContainer) {
          oldMapObjectContainer.innerHTML = newMapObjectContainer.innerHTML;
      } else {

      }
      // Update pagination
      const oldPagination = document.querySelector('.pagination-container[data-pagination-type="map_object"]');
      const newPagination = newContent.querySelector('.pagination-container[data-pagination-type="map_object"]');
      if (oldPagination) {
          if (newPagination && newPagination.innerHTML.trim()) {
              oldPagination.innerHTML = newPagination.innerHTML;
              replaceNoneWithEllipsis(oldPagination); // Call the function here
              oldPagination.style.display = 'block'; // Show pagination if there are links
          } else {
              oldPagination.style.display = 'none'; // Hide pagination if no links or no results
          }
      }
      attachPaginationEventListeners(); // Reattach event listeners to new pagination links
  }).catch(error => {

  });
}

function searchAndSortProjects() {
  const searchQuery = document.getElementById('search').value;
  const sortOption = document.getElementById('sort').value;
  fetch(`/admintools?page=1&search=${searchQuery}&sort=${sortOption}`, {
      headers: {
          'X-Requested-With': 'XMLHttpRequest'
      }
  }).then(response => response.text()).then(html => {
      const newContent = document.createElement('div');
      newContent.innerHTML = html;
      const oldProjectContainer = document.getElementById('project-list-container');
      let newProjectContainer = newContent.querySelector('#project-list-container');
      // Handle 'No results found' scenario
      if (!newProjectContainer) {
          newProjectContainer = document.createElement('div');
          newProjectContainer.innerHTML = " < p > Keine Ergebnisse gefunden. < /p>";
      }
      if (oldProjectContainer) {
          oldProjectContainer.innerHTML = newProjectContainer.innerHTML;
      } else {

      }
      // Update pagination
      const oldPagination = document.querySelector('.pagination-container[data-pagination-type="project"]');
      const newPagination = newContent.querySelector('.pagination-container[data-pagination-type="project"]');
      if (oldPagination) {
          if (newPagination && newPagination.innerHTML.trim()) {
              oldPagination.innerHTML = newPagination.innerHTML;
              replaceNoneWithEllipsis(oldPagination); // Update pagination content
              oldPagination.style.display = 'block'; // Show pagination if there are links
          } else {
              oldPagination.style.display = 'none'; // Hide pagination if no links or no results
          }
      }
      attachPaginationEventListeners(); // Reattach event listeners to new pagination links
  }).catch(error => {

  });
}

function extractTotalPagesFromPagination(paginationElement) {
  const pageLinks = paginationElement.querySelectorAll('.page-link');
  const pageNumbers = Array.from(pageLinks).map(link => parseInt(link.textContent.trim())).filter(num => !isNaN(num));
  return pageNumbers.length > 0 ? Math.max(...pageNumbers) : 1;
}
// Submit form when sorting options change or search input keyup event
// function submitForm() {
//   searchAndSortProjects();
// }

function searchUsers() {
  const searchName = document.getElementById('searchUserByName').value;
  const searchId = document.getElementById('searchUserById').value;
  fetch(`/admintools?user_page=1&searchUserByName=${searchName}&searchUserById=${searchId}`, {
      headers: {
          'X-Requested-With': 'XMLHttpRequest'
      }
  }).then(response => response.text()).then(html => {
      const newContent = document.createElement('div');
      newContent.innerHTML = html;
      const newContainer = newContent.querySelector('#user-list-container');
      const oldContainer = document.getElementById('user-list-container');
      if (oldContainer && newContainer) {
          oldContainer.innerHTML = newContainer.innerHTML;
      } else {

      }
      attachPaginationEventListeners(); // Reattach event listeners to new pagination links
  }).catch(error => {

  });
}

function updatePageParam(url, newPage) {
  const urlObj = new URL(url);
  urlObj.searchParams.set('page', newPage);
  return urlObj.toString();
}

function reconstructPaginationButtons(newContent, sectionType) {
  const oldPagination = document.querySelector(`.pagination-container[data-pagination-type="${sectionType}"] .pagination`);
  const newPagination = newContent.querySelector('.pagination');
  if (oldPagination && newPagination) {
      oldPagination.innerHTML = newPagination.innerHTML;
      replaceNoneWithEllipsis(oldPagination);
  } else {

  }
}

function replaceNoneWithEllipsis(paginationElement) {
  const pageLinks = paginationElement.querySelectorAll('.page-link');
  pageLinks.forEach(link => {
      if (link.textContent.trim() === 'None') {
          link.textContent = '...'; // Replace 'None' with '...'
          link.href = '#'; // Set href to '#' to prevent any action
          link.addEventListener('click', (e) => e.preventDefault()); // Prevent default action
      }
  });
}

function extractTotalPages() {
  const pageItems = Array.from(document.querySelectorAll('.pagination .page-link'));
  const pageNumbers = pageItems.map(item => parseInt(item.textContent.trim())).filter(num => !isNaN(num));
  return pageNumbers.length > 0 ? Math.max(...pageNumbers) : 1;
}

function deleteComment(commentId) {
  if (!confirm("Möchten Sie diesen Kommentar wirklich löschen?")) {
      return; // User canceled the action
  }

  // AJAX request to the deletion endpoint
  fetch(`/delete_comment/${commentId}`, {
          method: 'POST',
          headers: {
              'X-Requested-With': 'XMLHttpRequest',
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              commentId
          })
      })
      .then(response => response.json())
      .then(data => {
          if (data.success) {
              // Remove the comment from the DOM
              const commentElement = document.getElementById(`comment-${commentId}`);
              if (commentElement) {
                  commentElement.remove();
              }

              // Optionally, update the comment count display
              updateCommentCountDisplay();
          } else {
              alert('Fehler beim Löschen des Kommentars: ' + data.error);
          }
      })
      .catch(error => {});
}

function updateCommentCountDisplay() {
  const countSpan = document.getElementById('num-comments'); // Assuming you have a span with this ID
  if (countSpan) {
      let currentCount = parseInt(countSpan.innerText);
      if (!isNaN(currentCount)) {
          currentCount -= 1; // Decrement the count
          countSpan.innerText = `${currentCount} Kommentare.`; // Update the text
      }
  }
}

document.addEventListener("DOMContentLoaded", function() {
  var deleteAllProjectsSection = document.getElementById('deleteAllProjectsSection');
  // Find all buttons within the div
  var buttons = deleteAllProjectsSection.getElementsByTagName('button');
  // Add the 'register-button' class to each button
  for (var i = 0; i < buttons.length; i++) {
      buttons[i].classList.add('register-button');
  }
  // Function to fetch unique categories and populate the select dropdown
  function fetchUniqueCategories() {
      fetch('/get_unique_categories').then(response => response.json()).then(data => {
          if (data.success) {
              const categorySelect = document.getElementById('category');
              categorySelect.innerHTML = ''; // Clear existing options
              const allCategoriesOption = document.createElement('option');
              allCategoriesOption.value = '';
              allCategoriesOption.textContent = 'Alle Kategorien';
              categorySelect.appendChild(allCategoriesOption);
              data.categories.forEach(category => {
                  const option = document.createElement('option');
                  option.value = category;
                  option.textContent = category;
                  categorySelect.appendChild(option);
              });
          } else {}
      }).catch(error => {});
  }
  fetchUniqueCategories(); // Call the function to populate unique categories on page load
});

function toggleExportSection() {
  var exportSection = document.querySelector('.export-section');
  if (exportSection.style.display === 'none') {
      exportSection.style.display = 'block';
  } else {
      exportSection.style.display = 'none';
  }
}
// Add click event listener to the toggle button
function toggleProjectProposals() {
  var projectProposalsSection = document.getElementById('projectProposalsSection');
  if (projectProposalsSection.style.display === 'none') {
      projectProposalsSection.style.display = 'block';
  } else {
      projectProposalsSection.style.display = 'none';
  }
}

function toggleNotes() {
  var notesSection = document.getElementById('notesSection');
  if (notesSection.style.display === 'none') {
      notesSection.style.display = 'block';
  } else {
      notesSection.style.display = 'none';
  }
}
document.addEventListener('DOMContentLoaded', function() {
  toggleSection('deleteAllProjectsSection'); // Open the 'Statistik' section by default
  const filterButtons = document.querySelectorAll('#filter-overlay .c-button');
  filterButtons.forEach(button => {
      button.addEventListener('click', function(event) {
          // Get the section ID from the clicked button
          const sectionId = this.getAttribute('data-section-id');
          // Check if the clicked section is already open
          if (currentOpenSection === sectionId) {
              // Only close the overlay
              document.getElementById('filter-overlay').style.display = 'none';
          } else {
              // Close the overlay and toggle the respective section
              document.getElementById('filter-overlay').style.display = 'none';
              toggleSection(sectionId);
          }
      });
  });
});
// Your existing toggleSection function
let currentOpenSection = 'deleteAllProjectsSection';

function toggleSection(sectionId) {
  const section = document.getElementById(sectionId);
  const defaultSection = document.getElementById('deleteAllProjectsSection');
  const defaultButton = document.getElementById('toggleDeleteAllProjects');
  if (currentOpenSection !== sectionId) {
      const currentSection = document.getElementById(currentOpenSection);
      if (currentSection) {
          currentSection.style.display = 'none';
          document.querySelector(`[data-section-id="${currentOpenSection}"]`).classList.remove('active');
      }
  }
  if (section.style.display === 'none') {
      section.style.display = 'block';
      document.querySelector(`[data-section-id="${sectionId}"]`).classList.add('active');
      currentOpenSection = sectionId;
      if (defaultSection && defaultSection !== section && defaultSection.style.display === 'block') {
          defaultSection.style.display = 'none';
          defaultButton.classList.remove('active');
      }
  } else {
      section.style.display = 'none';
      document.querySelector(`[data-section-id="${sectionId}"]`).classList.remove('active');
      if (defaultSection.style.display === 'none') {
          defaultSection.style.display = 'block';
          defaultButton.classList.add('active');
          currentOpenSection = 'deleteAllProjectsSection';
      } else {
          currentOpenSection = null;
      }
  }
}
// Attach the toggleSection function to the new button
document.getElementById('toggleDeleteAllProjects').addEventListener('click', function() {
  toggleSection('deleteAllProjectsSection');
});
// Attach the toggleSection function to each button
document.querySelectorAll('.control-bar .c-button').forEach(button => {
  button.addEventListener('click', function() {
      const sectionId = this.getAttribute('data-section-id');
      toggleSection(sectionId);
  });
});

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
// Update event listeners
document.getElementById('toggleExportSection').addEventListener('click', function() {
  toggleSection('exportSection');
});
document.getElementById('toggleProjectProposals').addEventListener('click', function() {
  toggleSection('projectProposalsSection');
});
document.getElementById('toggleNotes').addEventListener('click', function() {
  toggleSection('notesSection');
});
document.getElementById('toggleComments').addEventListener('click', function() {
  toggleSection('commentsSection');
});
document.getElementById('toggleImportantProjects').addEventListener('click', function() {
  toggleSection('importantProjectsSection');
});
document.getElementById('toggleFeaturedProjects').addEventListener('click', function() {
  toggleSection('featuredProjectsSection');
});
document.getElementById('toggleUsers').addEventListener('click', function() {
  toggleSection('usersSection');
});
document.getElementById('toggleReportedProjects').addEventListener('click', function() {
  toggleSection('reportedProjectsSection');
});

function submitExportForm() {
  
  var formData = new FormData(document.getElementById("exportForm"));
  console.log(formData);
  formData.forEach(function(value, key) {});
  fetch('{{ url_for("export_projects") }}', {
      method: 'POST',
      body: formData
  }).then(response => {
      if (!response.ok) {
          throw new Error('Server responded with status ' + response.status);
      }
      return response.json(); // Expecting a JSON response now
  }).then(data => {
      if (data.filepath) {
          // Trigger download using the filepath received
          window.location.href = data.filepath; // This will start the download
      } else {}
  }).catch(error => {});
  return false; // Prevent traditional form submission
}

function handleLayoutChange() {
  const width = window.innerWidth;
  if (width > 1445) {} else if (width >= 1080 && width <= 1445) {} else {}
  resizeCharts(); // Resize the charts
}
// Function to resize all chart instances
function resizeCharts() {
  for (let chartId in chartInstances) {
      if (chartInstances.hasOwnProperty(chartId)) {
          chartInstances[chartId].resize(); // Resize each chart
      }
  }
}
// Add event listeners for load and resize events
window.addEventListener('load', handleLayoutChange);
window.addEventListener('resize', handleLayoutChange);

let currentMapObjectFilter = 'all'; // Initial filter state
let chartInstances = {}; // Object to hold chart instances
let currentDescriptionLengthFilter = 'all'; // Filter state for description length chart
let showPercentage = false; // Global variable to keep track of the toggle state
let engagedProjectsChart = null;
document.getElementById('engagedProjectsThreshold').addEventListener('change', function() {
  const threshold = this.value;
  fetchAndRenderEngagedProjectsChart(threshold);
});
document.getElementById('showEngagedProjectsList').addEventListener('click', function() {
  document.getElementById('projectsOverlay').style.display = 'block';
  loadEngagedProjects();
});
document.getElementById('projectsOverlay').addEventListener('click', function(event) {
  // Check if the click was outside the overlay content
  if (event.target == this) {
      closeOverlay();
  }
});

function closeOverlay() {
  document.getElementById('projectsOverlay').style.display = 'none';
}

function loadEngagedProjects() {
  const threshold = document.getElementById('engagedProjectsThreshold').value || 1;
  fetch(`/get_engaged_projects?threshold=${threshold}`).then(response => response.json()).then(projects => {
      const container = document.getElementById('projectsList');
      container.innerHTML = '';
      if (projects.length === 0) {
          container.innerHTML = ' < p > No projects found < /p>';
          return;
      }
      // Create a table
      const table = document.createElement('table');
      table.style.margin = 'auto';
      table.style.width = '90%'; // Adjust as needed
      // Create table header
      const thead = document.createElement('thead');
      thead.innerHTML = `

                                                <tr>
                                                  <th>Titel</th>
                                                  <th>Ansichten</th>
                                                  <th>Upvotes </th>
                                                  <th>Downvotes</th>
                                                  <th>Kommentare</th>
                                                  <th>Bookmarks</th>
                                                  <th>Meldungen</th>
                                                </tr>`;
      table.appendChild(thead);
      // Create table body
      const tbody = document.createElement('tbody');
      projects.forEach(project => {
          const row = document.createElement('tr');
          row.innerHTML = `
  
                                                <td>
                                                  <a href="/project_details/${project.id}">${project.name}</a>
                                                </td>
                                                <td>
                                                  <strong>${project.upvotes}</strong>
                                                </td>
                                                <td>
                                                  <strong>${project.downvotes}</strong>
                                                </td>
                                                <td>
                                                  <strong>${project.comments}</strong>
                                                </td>
                                                <td>
                                                  <strong>${project.bookmarks}</strong>
                                                </td>
                                                <td>
                                                  <strong>${project.reports}</strong>
                                                </td>
                                                <td>
                                                  <strong>${project.views}</strong>
                                                </td>`;
          tbody.appendChild(row);
      });
      table.appendChild(tbody);
      // Append the table to the container
      container.appendChild(table);
  }).catch(error => {
      container.innerHTML = ' < p > Error loading projects < /p>';
  });
}
// Updated function for fetching engaged projects
function getEngagedProjects() {
  const threshold = document.getElementById('engagedProjectsThreshold').value;
  return fetch(`/get_engaged_projects_data?threshold=${threshold}`).then(response => {
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      return response.json();
  }).then(data => {
      return Object.entries(data).map(([category, count]) => {
          return {
              name: category,
              count: count
          };
      });
  });
}
document.addEventListener("DOMContentLoaded", function() {
  fetchChartData(); // Load all charts initially
  setupToggleButtons();
  setupDescriptionLengthToggleButtons();
  setupPercentageToggle();
});

function setupToggleButtons() {
  const toggleButtons = document.querySelectorAll('.mapobject-toggle');
  toggleButtons.forEach(button => {
      button.addEventListener('click', () => {
          currentMapObjectFilter = button.getAttribute('data-filter');
          fetchChartData(true);
          updateButtonStates(toggleButtons, currentMapObjectFilter);
      });
  });
}

function updateButtonStates(buttons, currentFilter) {
  buttons.forEach(button => {
      if (button.getAttribute('data-filter') === currentFilter) {
          button.classList.add('active');
      } else {
          button.classList.remove('active');
      }
  });
}

function setupDescriptionLengthToggleButtons() {
  const descriptionLengthToggleButtons = document.querySelectorAll('.description-length-toggle');
  descriptionLengthToggleButtons.forEach(button => {
      button.addEventListener('click', () => {
          currentDescriptionLengthFilter = button.getAttribute('data-filter');
          fetchChartData(false, true);
          updateButtonStates(descriptionLengthToggleButtons, currentDescriptionLengthFilter);
      });
  });
}

function setupPercentageToggle() {
  const togglePercentageBtn = document.getElementById('togglePercentage');
  togglePercentageBtn.addEventListener('click', () => {
      showPercentage = !showPercentage;
      togglePercentageBtn.textContent = showPercentage ? 'Show Numbers' : 'Show Percentages';
      fetchChartData(true); // Update only project category chart
  });
}

function fetchChartData(updateOnlyCategoryChart = false, updateOnlyDescriptionLengthChart = false) {
  const url = `/get_chart_data?filter=${currentMapObjectFilter}&description_length_filter=${currentDescriptionLengthFilter}`;
  fetch(url).then(response => response.json()).then(data => {
      if (document.getElementById('averageDescriptionLengthText')) {
          const averageLength = data.averageDescriptionLength ? data.averageDescriptionLength.toFixed(2) : 0;
          document.getElementById('averageDescriptionLengthText').textContent = `Durchschnittliche Länge: ${averageLength}`;
      }
      if (!updateOnlyCategoryChart && !updateOnlyDescriptionLengthChart) {
          if (document.getElementById('mapObjectChart')) {
              renderPieChart('mapObjectChart', '', data.mapobjectCounts, true);
          }
          if (document.getElementById('descriptionLengthChart')) {
              renderPieChart('descriptionLengthChart', '', data.descriptionLengthCounts, false, true);
          }
          if (document.getElementById('projectCategoryChart')) {
              renderPieChart('projectCategoryChart', '', data.categoryCounts);
              updateMostUsedCategoryText(data.categoryCounts);
          }
      } else if (updateOnlyCategoryChart) {
          if (document.getElementById('projectCategoryChart')) {
              renderPieChart('projectCategoryChart', '', data.categoryCounts);
              updateMostUsedCategoryText(data.categoryCounts);
          }
      } else if (updateOnlyDescriptionLengthChart) {
          if (document.getElementById('descriptionLengthChart')) {
              renderPieChart('descriptionLengthChart', '', data.descriptionLengthCounts, false, true);
          }
      }
  }).catch(error => {});
}

function updateMostUsedCategoryText(categoryCounts) {
  const mostUsedCategory = Object.keys(categoryCounts).reduce((a, b) => categoryCounts[a] > categoryCounts[b] ? a : b);
  const totalProjects = Object.values(categoryCounts).reduce((a, b) => a + b, 0);
  const mostUsedPercentage = ((categoryCounts[mostUsedCategory] / totalProjects) * 100).toFixed(2);
  const mostUsedCategoryText = `Häufigste Kategorie: 
                                                <strong>${mostUsedCategory}</strong> - 
                                                <strong>${categoryCounts[mostUsedCategory]}</strong> Beiträge (
                                                <strong>${mostUsedPercentage}%</strong> aller Beiträge)`;
  document.getElementById('mostUsedCategoryText').innerHTML = mostUsedCategoryText;
}

function renderPieChart(canvasId, title, data, isMapObjectChart = false, isDescriptionLengthChart = false) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) {
      return;
  }
  const ctx = canvas.getContext('2d');
  if (chartInstances[canvasId]) {
      chartInstances[canvasId].destroy();
  }
  let backgroundColors = defineBackgroundColors(data, isMapObjectChart, isDescriptionLengthChart);
  chartInstances[canvasId] = new Chart(ctx, {
      type: 'pie',
      data: {
          labels: Object.keys(data),
          datasets: [{
              data: Object.values(data),
              backgroundColor: backgroundColors,
              datalabels: {
                  formatter: (value, ctx) => {
                      if (showPercentage) {
                          const total = Object.values(data).reduce((a, b) => a + b, 0);
                          const percentage = (value / total * 100).toFixed(2);
                          return percentage + '%';
                      } else {
                          return value;
                      }
                  },
                  color: '#FFFFFF',
                  font: {
                      size: 14, // Adjust the font size as needed
                      weight: 'bold'
                  },
                  anchor: 'end',
                  align: 'start',
                  offset: 10,
                  textStrokeColor: '#000000',
                  textStrokeWidth: 4
              }
          }]
      },
      options: {
          responsive: true,
          plugins: {
              datalabels: {
                  color: '#FFFFFF',
                  font: {
                      size: 14, // Adjust the font size as needed
                      weight: 'bold'
                  },
                  textStrokeColor: '#000000',
                  textStrokeWidth: 4
              },
              legend: {
                  labels: {
                      font: {
                          size: 14,
                          weight: 'bold',
                          color: 'black'
                      }
                  }
              }
          },
          title: {
              display: title !== '',
              text: title,
              font: {
                  size: 20,
                  weight: 'bold',
                  color: 'black'
              }
          }
      }
  });
}

function defineBackgroundColors(data, isMapObjectChart, isDescriptionLengthChart) {
  if (isMapObjectChart) {
      return ['#021c4c', '#e82b10'];
  } else if (isDescriptionLengthChart) {
      return ['#021c4c', '#028d9e', '#f6e0bf', '#f57736', '#e82b10'];
  } else {
      const categoryColors = {
          'Öffentliche Plätze': '#ff5c00',
          'Transport': '#133873',
          'Gesundheit': '#9a031e',
          'Umwelt': '#4caf50',
          'Bildung': '#eab003',
          'Andere': '#212121',
          'Sport': '#3d4f53',
          'Kultur': '#431307',
          'Verwaltung': '#653993'
      };
      return Object.keys(data).map(category => categoryColors[category] || '#999999');
  }
}

function createChartOptions(title) {
  return {
      responsive: true,
      title: {
          display: title !== '',
          text: title,
          font: {
              weight: 'bold',
              size: 20,
              color: 'black'
          }
      },
      plugins: {
          legend: {
              labels: {
                  font: {
                      weight: 'bold',
                      size: 14,
                      color: 'black'
                  }
              }
          }
      }
  };
}
let submissionChart = null; // Reference to the 'Submissions over time' chart
let activityChart = null; // Reference to the 'Activity over time' chart
let viewsChart = null;

function generateDateLabels(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const labels = [];
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      labels.push(`${('0' + date.getDate()).slice(-2)}.${('0' + (date.getMonth() + 1)).slice(-2)}.${date.getFullYear()}`);
  }
  return labels;
}

function updateChart(startDate, endDate, includeMapObjects, excludeMapObjects) {
  let urlParams = `start=${startDate}&end=${endDate}`;
  if (includeMapObjects) {
      urlParams += '&includeMapObjects=true';
  } else if (excludeMapObjects) {
      urlParams += '&excludeMapObjects=true';
  }
  const url = `/project_submission_stats?${urlParams}`;
  fetch(url).then(response => response.json()).then(data => {
      const ctx = document.getElementById('submissionChart').getContext('2d');
      const categories = Object.keys(data);
      if (categories.length === 0) {
          return;
      }
      const labels = generateDateLabels(startDate, endDate);
      const categoryColors = {
          'Öffentliche Plätze': '#ff5c00',
          'Transport': '#133873',
          'Gesundheit': '#9a031e',
          'Umwelt': '#4caf50',
          'Bildung': '#eab003',
          'Andere': '#212121',
          'Sport': '#3d4f53',
          'Kultur': '#431307',
          'Verwaltung': '#653993'
      };
      const datasets = categories.map(category => {
          const categoryData = labels.map(label => {
              const [day, month, year] = label.split('.');
              const formattedDate = `${year}-${month}-${day}`;
              return data[category][formattedDate] || 0;
          });
          return {
              label: category,
              data: categoryData,
              backgroundColor: categoryColors[category] + '66',
              borderColor: categoryColors[category],
              borderWidth: 3
          };
      });
      if (submissionChart) {
          submissionChart.destroy();
      }
      submissionChart = new Chart(ctx, {
          type: 'line',
          data: {
              labels: labels,
              datasets: datasets.map(dataset => ({
                  ...dataset,
                  fill: false
              }))
          },
          options: {
              scales: {
                  y: {
                      beginAtZero: true
                  }
              },
              plugins: {
                  legend: {
                      labels: {
                          font: {
                              weight: 'bold',
                              size: 14,
                              color: 'black'
                          }
                      }
                  }
              },
              title: {
                  display: false,
                  text: 'Your Chart Title Here', // Change as per requirement
                  font: {
                      weight: 'bold',
                      size: 16,
                      color: 'black'
                  }
              }
          }
      });
  }).catch(error => {
      return
  });
}
document.getElementById('updateChart').addEventListener('click', () => {
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  const includeMapObjects = document.getElementById('includeMapObjects').checked;
  const excludeMapObjects = document.getElementById('excludeMapObjects').checked;
  updateChart(startDate, endDate, includeMapObjects, excludeMapObjects);
});
document.getElementById('updateActivityChart').addEventListener('click', () => {
  const startDate = document.getElementById('activityStartDate').value;
  const endDate = document.getElementById('activityEndDate').value;
  updateActivityChart(startDate, endDate);
});

function updateActivityChart(startDate, endDate) {
  const url = `/get_activity_data?start=${startDate}&end=${endDate}`;
  fetch(url).then(response => response.json()).then(data => {
      const ctx = document.getElementById('activityChart').getContext('2d');
      const labels = generateDateLabels(startDate, endDate);
      const datasets = [{
          label: 'Upvotes 👍',
          data: labels.map(label => convertDateAndGetData(label, data.upvotes)),
          borderColor: '#4caf50',
          fill: false,
      }, {
          label: 'Downvotes 👎',
          data: labels.map(label => convertDateAndGetData(label, data.downvotes)),
          borderColor: '#9a031e',
          fill: false,
      }, {
          label: 'Kommentare',
          data: labels.map(label => convertDateAndGetData(label, data.comments)),
          borderColor: '#133873',
          fill: false,
      }, {
          label: 'Meldungen',
          data: labels.map(label => convertDateAndGetData(label, data.reports)),
          borderColor: '#eab003',
          fill: false,
      }, {
          label: 'Lesezeichen',
          data: labels.map(label => convertDateAndGetData(label, data.bookmarks)),
          borderColor: '#653993',
          fill: false,
      }];
      if (activityChart) {
          activityChart.destroy();
      }
      activityChart = new Chart(ctx, {
          type: 'line',
          data: {
              labels: labels,
              datasets: datasets
          },
          options: {
              scales: {
                  y: {
                      beginAtZero: true
                  }
              },
              plugins: {
                  legend: {
                      labels: {
                          font: {
                              weight: 'bold',
                              color: 'black'
                          }
                      }
                  }
              }
          }
      });
  }).catch(error => {
      return
  });
}

function convertDateAndGetData(label, dataDict) {
  let formattedDate = label.split('.').reverse().join('-'); // Convert to YYYY-MM-DD
  return dataDict[formattedDate] || 0;
}

function generateDateLabels(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const labels = [];
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      labels.push(`${('0' + date.getDate()).slice(-2)}.${('0' + (date.getMonth() + 1)).slice(-2)}.${date.getFullYear()}`);
  }
  return labels;
}
document.getElementById('updateViewsChart').addEventListener('click', () => {
  const startDate = document.getElementById('viewsStartDate').value;
  const endDate = document.getElementById('viewsEndDate').value;
  updateViewsChart(startDate, endDate);
});

function fetchAndRenderEngagedProjectsChart(threshold) {
  fetch(`/get_engaged_projects?threshold=${threshold}`).then(response => response.json()).then(data => {
      if (!data || data.length === 0) {
          return;
      }
      let categoryCounts = data.reduce((counts, project) => {
          counts[project.category] = (counts[project.category] || 0) + 1;
          return counts;
      }, {});
      const ctx = document.getElementById('engagedProjectsChart').getContext('2d');
      if (engagedProjectsChart) engagedProjectsChart.destroy();
      engagedProjectsChart = new Chart(ctx, {
          type: 'pie',
          data: {
              labels: Object.keys(categoryCounts),
              datasets: [{
                  data: Object.values(categoryCounts),
                  backgroundColor: ['#003056', '#36A2EB', '#e82b10', '#f57736', '#f6e0bf', '#028d9e', '#036a90'],
                  datalabels: {
                      formatter: (value, ctx) => {
                          return value; // Display the raw value
                      },
                      color: '#FFFFFF',
                      font: {
                          size: 14, // Ensure this matches your desired size
                          weight: 'bold'
                      },
                      anchor: 'end', // Set anchor to 'end' for positioning
                      align: 'start', // Set align to 'start' for positioning
                      offset: 10, // Adjust offset if needed
                      textStrokeColor: '#000000',
                      textStrokeWidth: 4
                  }
              }]
          },
          options: {
              responsive: true,
              plugins: {
                  datalabels: {
                      color: '#FFFFFF',
                      font: {
                          size: 14, // Ensure this matches your desired size
                          weight: 'bold'
                      },
                      textStrokeColor: '#000000',
                      textStrokeWidth: 4
                  },
                  legend: {
                      labels: {
                          font: {
                              size: 14,
                              weight: 'bold',
                              color: 'black'
                          }
                      }
                  }
              },
              title: {
                  display: false,
                  text: 'Engagierte Projektvorschläge'
              }
          }
      });
  }).catch(error => {
      if (engagedProjectsChart) engagedProjectsChart.destroy();
  });
}
document.addEventListener("DOMContentLoaded", function() {
  fetchAndRenderEngagedProjectsChart(1); // default threshold
});

function updateViewsChart(startDate, endDate) {
  const url = `/get_view_data?start=${startDate}&end=${endDate}`;
  fetch(url).then(response => response.json()).then(data => {
      const ctx = document.getElementById('viewsChart').getContext('2d');
      const labels = generateDateLabels(startDate, endDate);
      const dailyViewsData = labels.map(label => {
          let formattedDate = label.split('.').reverse().join('-'); // Convert to YYYY-MM-DD
          return data.daily_views[formattedDate] || 0;
      });
      // Calculate cumulative total views
      const cumulativeTotalViewsData = dailyViewsData.reduce((acc, current, index) => {
          if (index === 0) {
              acc.push(current);
          } else {
              acc.push(acc[index - 1] + current);
          }
          return acc;
      }, []);
      const datasets = [{
          label: 'Tägliche Ansichten',
          data: dailyViewsData,
          borderColor: '#e82b10',
          fill: false,
      }, {
          label: 'Gesamtansichten',
          data: cumulativeTotalViewsData,
          borderColor: '#021c4c',
          fill: false,
      }];
      if (viewsChart) {
          viewsChart.destroy();
      }
      viewsChart = new Chart(ctx, {
          type: 'line',
          data: {
              labels: labels,
              datasets: datasets
          },
          options: {
              scales: {
                  y: {
                      beginAtZero: true
                  }
              },
              plugins: {
                  legend: {
                      labels: {
                          font: {
                              weight: 'bold',
                              color: 'black'
                          }
                      }
                  }
              }
          }
      });
  }).catch(error => {
      return
  });
}
window.onload = function() {
  // Initialize 'Submissions over time' chart
  const initialEndDateSubmission = new Date();
  const initialStartDateSubmission = new Date(initialEndDateSubmission);
  initialStartDateSubmission.setDate(initialEndDateSubmission.getDate() - 7);
  document.getElementById('startDate').value = initialStartDateSubmission.toISOString().split('T')[0];
  document.getElementById('endDate').value = initialEndDateSubmission.toISOString().split('T')[0];
  updateChart(initialStartDateSubmission.toISOString().split('T')[0], initialEndDateSubmission.toISOString().split('T')[0], false, false);
  // Initialize 'Activity over time' chart
  const initialEndDateActivity = new Date();
  const initialStartDateActivity = new Date(initialEndDateActivity);
  initialStartDateActivity.setDate(initialEndDateActivity.getDate() - 7);
  document.getElementById('activityStartDate').value = initialStartDateActivity.toISOString().split('T')[0];
  document.getElementById('activityEndDate').value = initialEndDateActivity.toISOString().split('T')[0];
  updateActivityChart(initialStartDateActivity.toISOString().split('T')[0], initialEndDateActivity.toISOString().split('T')[0]);
  // Initialize 'Views over time' chart
  const initialEndDateViews = new Date();
  const initialStartDateViews = new Date(initialEndDateViews);
  initialStartDateViews.setDate(initialEndDateViews.getDate() - 7);
  document.getElementById('viewsStartDate').value = initialStartDateViews.toISOString().split('T')[0];
  document.getElementById('viewsEndDate').value = initialEndDateViews.toISOString().split('T')[0];
  updateViewsChart(initialStartDateViews.toISOString().split('T')[0], initialEndDateViews.toISOString().split('T')[0]);
  // Initialize 'Unique Viewers over time' chart
  document.getElementById('start-date').value = initialStartDateSubmission.toISOString().split('T')[0];
  document.getElementById('end-date').value = initialEndDateSubmission.toISOString().split('T')[0];
  fetchDataForRange();
};
document.addEventListener("DOMContentLoaded", function() {
  fetch('/get_unique_viewers_data').then(response => response.json()).then(data => {
      const formattedLabels = data.labels.map(label => {
          const dateParts = label.split('-'); // Assuming label is in the format YYYY-MM-DD
          return `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`; // Format as DD.MM.YYYY
      });
      const ctx = document.getElementById('uniqueViewersChart').getContext('2d');
      new Chart(ctx, {
          type: 'line',
          data: {
              labels: formattedLabels, // Use the formatted labels
              datasets: [{
                  label: 'Unique Viewers',
                  data: data.values,
                  backgroundColor: 'rgba(0, 48, 86, 0.5)', // Updated background color
                  borderColor: 'rgba(2, 107, 147, 1)', // Updated border color
                  borderWidth: 4
              }]
          },
          options: {
              scales: {
                  yAxes: [{
                      ticks: {
                          beginAtZero: true
                      }
                  }]
              }
          }
      });
      const now = new Date();
      const dateString = now.toLocaleString();
  }).catch(error => {
      return
  });
});
document.addEventListener("DOMContentLoaded", function() {
  fetchDataForRange(); // Fetch data for the initial range on page load
});

function fetchDataForRange() {
  const startDate = document.getElementById('start-date').value;
  const endDate = document.getElementById('end-date').value;
  fetch('/get_unique_viewers_data_range', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({
          start_date: startDate,
          end_date: endDate
      })
  }).then(response => response.json()).then(data => {
      updateUniqueViewersChart(data);
  }).catch(error => {
      return
  });
}

function updateUniqueViewersChart(data) {
  const formattedLabels = data.labels.map(label => {
      const dateParts = label.split('-'); // Assuming label is in the format YYYY-MM-DD
      return `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`; // Format as DD.MM.YYYY
  });
  const ctx = document.getElementById('uniqueViewersChart').getContext('2d');
  new Chart(ctx, {
      type: 'line',
      data: {
          labels: formattedLabels,
          datasets: [{
              label: 'Unique Viewers',
              data: data.values,
              backgroundColor: 'rgba(0, 48, 86, 0.5)',
              borderColor: 'rgba(2, 107, 147, 1)',
              borderWidth: 4
          }]
      },
      options: {
          scales: {
              yAxes: [{
                  ticks: {
                      beginAtZero: true
                  }
              }]
          }
      }
  });
  // Calculate and display additional stats
  displayViewerStats(data);
}

function displayViewerStats(data) {
  const totalViewers = data.values.reduce((total, count) => total + count, 0);
  const maxViewers = Math.max(...data.values);
  const maxViewersDateIndex = data.values.indexOf(maxViewers);
  let maxViewersDate = data.labels[maxViewersDateIndex];
  // Convert date to DD.MM.YYYY format
  if (maxViewersDate) {
      const dateParts = maxViewersDate.split('-');
      maxViewersDate = `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`;
  }
  const statsElement = document.getElementById('viewerStats');
  statsElement.innerHTML = `
  <p>Most ever views on: 
    <strong>${maxViewersDate}</strong> - 
    <strong>${maxViewers} view(s);</strong> Total views: 
    <strong>${totalViewers}</strong>
  </p>

`;
}
document.getElementById('hamburger-button').addEventListener('click', function() {
  var navOverlay = document.getElementById('nav-overlay');
  navOverlay.style.display = navOverlay.style.display === 'block' ? 'none' : 'block';
});
document.getElementById('hamburger-button-filter').addEventListener('click', function() {
  var filterOverlay = document.getElementById('filter-overlay');
  filterOverlay.style.display = filterOverlay.style.display === 'flex' ? 'none' : 'flex';
});
document.getElementById('filter-overlay').addEventListener('click', function(event) {
  var filterForm = document.getElementById('filter-form-mobile');
  if (!filterForm.contains(event.target)) {
      this.style.display = 'none';
  }
});
document.getElementById('filter-form-mobile').addEventListener('click', function(event) {
  event.stopPropagation();
});
document.addEventListener('click', function(event) {
  var navOverlay = document.getElementById('nav-overlay');
  var navLinks = document.getElementById('nav-links');
  var hamburgerButton = document.getElementById('hamburger-button');
  if (window.innerWidth <= 1080) {
      if (navOverlay.style.display === 'block' && !navOverlay.contains(event.target) && !hamburgerButton.contains(event.target)) {
          navOverlay.style.display = 'none';
      } else if (navLinks.contains(event.target)) {
          navOverlay.style.display = 'none';
      }
  }
});
document.addEventListener("DOMContentLoaded", function() {
  const urlParams = new URLSearchParams(window.location.search);
  const projectID = urlParams.get('projectID');
  if (projectID) {
      showOverlayForProjectID(projectID);
  }
  document.getElementById('overlay').addEventListener('click', function(event) {
      if (event.target === this) {
          closeOverlay();
          history.pushState(null, '', '/list');
      }
  });
  document.getElementById('filter-form-mobile').addEventListener('keypress', function(event) {
      if (event.keyCode === 13) { // Enter key
          event.preventDefault();
      }
  });
});

function showOverlayForProjectID(projectID) {
  fetch('/api/project/' + projectID).then(response => response.json()).then(data => {
      document.getElementById('overlay-title').textContent = data.title;
      document.getElementById('overlay-description').textContent = data.description;
      document.getElementById('overlay').style.display = 'flex';
  });
}

function closeOverlay() {
  document.getElementById('overlay').style.display = 'none';
}
document.getElementById('deleteMapObjectsByDateBtn').addEventListener('click', function() {
  const fromDate = document.getElementById('deleteFromDate').value;
  const toDate = document.getElementById('deleteToDate').value;
  if (!fromDate || !toDate) {
      alert('Bitte wählen Sie sowohl das Von Datum als auch das Bis Datum.');
      return;
  }
  fetch('/preview_delete_map_objects_by_date', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          fromDate: fromDate,
          toDate: toDate
      })
  }).then(response => response.json()).then(data => {
      if (data.success) {
          if (confirm(`Möchten Sie alle Kartenobjekte zwischen ${fromDate} und ${toDate} löschen?`)) {
              deleteMapObjects(fromDate, toDate);
          }
      } else {
          alert('Fehler beim Abrufen von Kartenobjekten.');
      }
  }).catch(error => {});
});

function deleteMapObjects(fromDate, toDate) {
  fetch('/delete_map_objects_by_date', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          fromDate: fromDate,
          toDate: toDate
      })
  }).then(response => response.json()).then(data => {
      if (data.success) {
          alert('Kartenobjekte erfolgreich gelöscht.');
      } else {
          alert('Fehler beim Löschen von Kartenobjekten.');
      }
  }).catch(error => {});
}

function deleteMapObject(event, projectId) {
  event.preventDefault(); // Prevent form submission and page reload

  if (!confirm("Möchten Sie dieses Kartenobjekt wirklich löschen?")) {
      return; // User canceled the action
  }

  // AJAX request to the deletion endpoint
  fetch(`/delete_project/${projectId}`, {
          method: 'POST',
          headers: {
              'X-Requested-With': 'XMLHttpRequest',
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              projectId
          })
      })
      .then(response => response.json())
      .then(data => {
          if (data.success) {
              // Remove the map object from the DOM
              const mapObjectElement = document.getElementById(`map-object-${projectId}`);
              if (mapObjectElement) {
                  mapObjectElement.remove();
              }

              // Update the map object count display
              updateMapObjectCountDisplay();
          } else {
              alert('Fehler beim Löschen des Kartenobjekts: ' + data.message);
          }
      })
      .catch(error => {});
}



function updateMapObjectCountDisplay() {
  const countSpan = document.getElementById('num-mapobjects'); // Locate the span by its ID
  if (countSpan) {
      let currentCount = parseInt(countSpan.innerText);
      if (!isNaN(currentCount)) {
          currentCount -= 1; // Decrement the count
          countSpan.innerText = `${currentCount} Notizen.`; // Update the text to include "Notizen"
      }
  }
}

function deleteProject(event, projectId) {
  event.preventDefault(); // Prevent the form from submitting

  // Confirm deletion
  if (!confirm("Möchten Sie dieses Projekt wirklich löschen?")) {
      return; // User canceled the action
  }

  // AJAX request to the deletion endpoint
  fetch(`/delete_project/${projectId}`, {
          method: 'POST',
          headers: {
              'X-Requested-With': 'XMLHttpRequest',
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              projectId
          })
      })
      .then(response => response.json())
      .then(data => {
          if (data.success) {
              // Remove the project from the DOM
              const projectElement = document.getElementById(`project-${projectId}`);
              if (projectElement) {
                  projectElement.parentNode.removeChild(projectElement); // Ensure removal from DOM
                  updateProjectCountDisplay(); // Update the project count display
              }
          } else {
              alert('Fehler beim Löschen des Projekts: ' + data.error);
          }
      })
      .catch(error => {});
}


function updateProjectCountDisplay() {
  const countSpan = document.getElementById('num-projects'); // Assuming you have a span with this ID for projects count
  if (countSpan) {
      let currentCount = parseInt(countSpan.innerText);
      if (!isNaN(currentCount)) {
          currentCount -= 1; // Decrement the count
          countSpan.innerText = `${currentCount} Projektvorschläge.`; // Update the text
      }
  }
}

function markProjectImportant(projectId) {
  fetch(`/mark_important/${projectId}`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify({
              projectId
          })
      })
      .then(response => response.json())
      .then(data => {
          if (data.success) {
              alert('Projekt als wichtig markiert.');
              addToImportantProjects(data.project); // Use the project details from the response
          } else {
              alert('Fehler beim Markieren des Projekts als wichtig.');
          }
      })
      .catch(error => {});
}

// Assuming this function is correctly defined to take a project object and add it to the DOM
function addToImportantProjects(project) {
  // Ensure this selector targets the correct container for important projects
  const list = document.getElementById('important-projects-list');
  if (!list) {
      return;
  }

  // Dynamically create the HTML structure for the new project
  const projectElement = document.createElement('div');
  projectElement.className = 'project-thumbnail';
  projectElement.innerHTML = `
  <h3><strong>${project.name}</strong></h3>
  <p class="project-date"> Gepostet am: <strong>${project.date}</strong>, Ansichten: <strong>${project.view_count}</strong></p>
  <!-- Add other project details as needed -->
`;

  // Append the new project element to the list
  list.appendChild(projectElement);
}

// Example usage: attaching the markProjectImportant function to button click events
document.querySelectorAll('.mark-important-btn').forEach(button => {
  button.addEventListener('click', function() {
      const projectId = this.getAttribute('data-project-id');
      markProjectImportant(projectId);
  });
});



function markAsFeatured(projectId) {
  fetch(`/mark_featured/${projectId}`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify({
              projectId: projectId
          })
      })
      .then(response => response.json())
      .then(data => {
          if (data.success) {
              alert('Project marked as featured successfully.');
              // Find the project element in the DOM and update its visual state
              // For example, add a class to highlight it or update text/icon
              const projectElement = document.getElementById(`project-${projectId}`);
              if (projectElement) {
                  projectElement.classList.add('featured'); // Assuming you have CSS styles for .featured
                  // Optionally, update a specific part of the project element, like an icon or text
                  const featuredStatusElement = projectElement.querySelector('.featured-status');
                  if (featuredStatusElement) {
                      featuredStatusElement.textContent = 'Featured'; // Update text or icon
                  }
              }
          } else {
              alert('Failed to mark the project as featured.');
          }
      })
      .catch(error => {});
}

// Example of attaching the function to a button click event
document.querySelectorAll('.mark-featured-btn').forEach(button => {
  button.addEventListener('click', function() {
      const projectId = this.getAttribute('data-project-id'); // Ensure your button has a data-project-id attribute
      markAsFeatured(projectId);
  });
});

function addToImportantProjects(project) {
  const list = document.getElementById('important-projects-list'); // Get the container where important projects are displayed

  // Create the HTML structure for the new project
  const projectElement = document.createElement('div');
  projectElement.className = 'project-thumbnail'; // Assuming this is the class for styling project thumbnails
  projectElement.innerHTML = `
  <h3>
      <strong>${project.name}</strong>
  </h3>
  <p class="project-date"> Gepostet am: <strong>${project.date}</strong>, Ansichten: <strong>${project.view_count}</strong>
  </p>
  <div class="voting-bar">
      ${project.upvotes > 0 ? `<div class="upvotes" style="width: ${project.upvote_percentage}%;"><span>${project.upvotes} 👍 (${project.upvote_percentage}%)</span></div>` : ''}
      ${project.downvotes > 0 ? `<div class="downvotes" style="width: ${project.downvote_percentage}%;"><span>${project.downvotes} 👎 (${project.downvote_percentage}%)</span></div>` : ''}
  </div>
  <a href="/project_details/${project.id}" target="_blank">
      <img src="/static/usersubmissions/${project.image_file}" alt="${project.name}" class="project-image">
  </a>
  <div class="project-description">${project.descriptionwhy}</div>
  <form method="POST" action="/admintools">
      <input type="hidden" name="project_id" value="${project.id}">
      <button type="submit" class="register-button" name="unmark_important">Von "Wichtig" entfernen</button>
      <a href="/project_details/${project.id}" class="register-button" target="_blank">Anzeigen</a>
  </form>
`;

  // Append the new project element to the list
  list.appendChild(projectElement);
}

document.addEventListener('DOMContentLoaded', function() {
  // Event listener for unmarking a project as important
  document.querySelectorAll("button[name='unmark_important']").forEach(button => {
      button.addEventListener('click', function(event) {
          event.preventDefault();
          const projectId = this.getAttribute('data-project-id');
          fetch(`/unmark_important/${projectId}`, {
                  method: 'POST',
                  headers: {
                      'X-Requested-With': 'XMLHttpRequest',
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                      projectId: projectId
                  })
              })
              .then(response => response.json())
              .then(data => {
                  if (data.success) {
                      alert('Projekt erfolgreich als nicht wichtig markiert.');
                      // Remove the project-thumbnail div for this project
                      const projectThumbnail = this.closest('.project-thumbnail');
                      if (projectThumbnail) {
                          projectThumbnail.remove();
                      }
                  } else {
                      alert('Fehler beim Markieren des Projekts als nicht wichtig.');
                  }
              })
              .catch(error => {});
      });
  });

  // Event listener for unmarking a project as featured
  document.querySelectorAll("button[name='unmark_featured']").forEach(button => {
      button.addEventListener('click', function(event) {
          event.preventDefault();
          const projectId = this.getAttribute('data-project-id');
          fetch(`/unmark_featured/${projectId}`, {
                  method: 'POST',
                  headers: {
                      'X-Requested-With': 'XMLHttpRequest',
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                      projectId: projectId
                  })
              })
              .then(response => response.json())
              .then(data => {
                  if (data.success) {
                      alert('Projekt erfolgreich als nicht ausgewählt markiert.');
                      // Remove the project-thumbnail div for this project
                      const projectThumbnail = this.closest('.project-thumbnail');
                      if (projectThumbnail) {
                          projectThumbnail.remove();
                      }
                  } else {
                      alert('Fehler beim Markieren des Projekts als nicht ausgewählt.');
                  }
              })
              .catch(error => {});
      });
  });
});


// Function to add a project to the DOM
function addProjectToDOM(project) {
  $('#project-list').append(`
  <div id="project-${project.id}">
      <h3>${project.name}</h3>
      <!-- Other project details -->
      <button class="mark-important" data-project-id="${project.id}">Mark as Important</button>
      <button class="unmark-important" data-project-id="${project.id}" style="display:none;">Unmark as Important</button>
  </div>
`);
}

// Example of dynamically adding a project (this could be retrieved from the server on page load)
addProjectToDOM({
  id: 1,
  name: "Project 1"
});

$(document).ready(function() {
  // Delegate event for dynamically added elements
  $(document).on('click', '.mark-important', function() {
      const projectId = $(this).data('project-id');
      $.post('/mark_important/' + projectId, function(response) {
          if (response.success) {
              alert(response.message);
              $(`#project-${projectId} .mark-important`).hide();
              $(`#project-${projectId} .unmark-important`).show();
          }
      });
  });

  $(document).on('click', '.unmark-important', function() {
      const projectId = $(this).data('project-id');
      $.post('/unmark_important/' + projectId, function(response) {
          if (response.success) {
              alert(response.message);
              $(`#project-${projectId} .unmark-important`).hide();
              $(`#project-${projectId} .mark-important`).show();
          }
      });
  });
});


document.addEventListener("DOMContentLoaded", function() {
  document.querySelectorAll('.project-thumbnail').forEach(projectThumbnail => {
      const upvotesElement = projectThumbnail.querySelector('.upvotes');
      const downvotesElement = projectThumbnail.querySelector('.downvotes');

      let upvotes = 0,
          downvotes = 0;

      if (upvotesElement) {
          upvotes = parseInt(upvotesElement.textContent.match(/\d+/) ? upvotesElement.textContent.match(/\d+/)[0] : "0");
      }

      if (downvotesElement) {
          downvotes = parseInt(downvotesElement.textContent.match(/\d+/) ? downvotesElement.textContent.match(/\d+/)[0] : "0");
      }

      // Log the project details and adjust border-radius
      if (upvotes > 0 && downvotes > 0) {
          if (upvotesElement) upvotesElement.style.borderRadius = '30px 0 0 30px';
          if (downvotesElement) downvotesElement.style.borderRadius = '0 30px 30px 0';
      } else if (upvotes > 0 && downvotes === 0) {
          if (upvotesElement) upvotesElement.style.borderRadius = '30px';
      } else if (downvotes > 0 && upvotes === 0) {
          if (downvotesElement) downvotesElement.style.borderRadius = '30px';
      } else {
          if (upvotesElement) upvotesElement.style.borderRadius = '30px';
          if (downvotesElement) downvotesElement.style.borderRadius = '30px';
      }
  });
});
fetch('/log_view').then(response => response.json()).then(data => {}).catch();