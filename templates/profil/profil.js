document.addEventListener('DOMContentLoaded', function() {
    attachPaginationEvent('comments-container');
    attachPaginationEvent('map-objects-container');
    attachPaginationEvent('projects-container'); // Add this line
    if (!isAnySectionOpen()) {
        document.getElementById('toggleProjectProposals').click();
    }
});

function attachPaginationEvent(containerId) {
    let container = document.getElementById(containerId);
    if (container) {
        //console.log('Attaching click event to:', containerId);
        container.addEventListener('click', function(e) {
            if (e.target.tagName === 'A' && e.target.classList.contains('page-link')) {
                e.preventDefault();
                const url = new URL(e.target.href);
                //console.log('Fetching URL:', url.href);
                updatePaginationContent(url.href, containerId);
            }
        });
    } else {
        console.error(containerId + ' not found');
    }
}

function updatePaginationContent(url, containerId) {
    let section;
    switch (containerId) {
        case 'comments-container':
            section = 'comments';
            break;
        case 'map-objects-container':
            section = 'map_objects';
            break;
        case 'projects-container':
            section = 'projects';
            break;
    }
    const ajaxUrl = new URL(url);
    ajaxUrl.searchParams.set('section', section);
    fetch(ajaxUrl, {
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.text();
    }).then(html => {
        document.getElementById(containerId).innerHTML = html;
    }).catch(error => console.error('Error:', error));
}
// Toggle the navigation overlay when the hamburger button is clicked
document.getElementById('hamburger-button').addEventListener('click', function() {
    var navOverlay = document.getElementById('nav-overlay');
    navOverlay.classList.toggle('nav-overlay-active');
});
// Close the navigation overlay when clicking on the overlay background or on a non-button element
document.getElementById('nav-overlay').addEventListener('click', function(event) {
    // Close only if the clicked element is not a button or a link
    if (!event.target.closest('button, a')) {
        closeNavOverlay();
    }
});
// Function to close the navigation overlay
function closeNavOverlay() {
    var navOverlay = document.getElementById('nav-overlay');
    navOverlay.classList.remove('nav-overlay-active');
}
// Prevent closing when clicking on buttons (delegation)
document.getElementById('nav-links').addEventListener('click', function(event) {
    if (event.target.tagName === 'BUTTON' || event.target.tagName === 'A') {
        event.stopPropagation();
    }
});
// Resize event listener
window.addEventListener('resize', function() {
    // Check if the window width is greater than the threshold for mobile view
    if (window.innerWidth > 1080) {
        // Make sure the nav-overlay is displayed
        document.getElementById('nav-overlay').classList.add('nav-overlay-active');
    } else {
        // For mobile view, revert back to the default behavior
        document.getElementById('nav-overlay').classList.remove('nav-overlay-active');
    }
});
// Call the function on page load to set the initial state
function toggleOverlay() {
    var overlay = document.getElementById("category-choices");
    if (overlay.style.display === "none") {
        overlay.style.display = "flex";
    } else {
        overlay.style.display = "none";
    }
}
// JavaScript function to handle redirection to Stimmungskarte
function redirectToStimmungskarte() {
    window.location.href = '/karte';
}
// JavaScript function to handle redirection to Suggest an Idea
function redirectToList() {
    window.location.href = '/list';
}
// JavaScript function to handle redirection to List of Current Suggestions
function redirectToneuerbeitrag() {
    window.location.href = '/neuerbeitrag';
}

function toggleMenu() {
    var x = document.getElementById("nav-links");
    if (x.style.display === "block") {
        x.style.display = "none";
    } else {
        x.style.display = "block";
    }
}
document.getElementById('delete-data-btn').addEventListener('click', function() {
    var confirmation = confirm('Are you sure you want to permanently delete all your data? This action cannot be undone.');
    if (confirmation) {
        fetch('{{ url_for("delete_my_data") }}', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
                // Add CSRF token if you're using CSRF protection, otherwise remove this line
            }
        }).then(response => response.json()).then(data => {
            alert(data.message);
            if (data.success) {
                window.location.href = '/'; // Redirect to the homepage or login page
            }
        }).catch(error => console.error('Error:', error));
    }
});
let currentOpenSection = null;
// Attach event listeners
document.querySelectorAll('.control-bar .c-button').forEach(button => {
    button.addEventListener('click', function() {
        const sectionId = this.getAttribute('data-section-id');
        toggleSection(sectionId);
    });
});
// Initialize with project proposals section open
document.addEventListener('DOMContentLoaded', function() {
    if (!isAnySectionOpen()) {
        toggleSection('projectProposalsSection');
    }
});
// Function to check if any section is open
function isAnySectionOpen() {
    let sections = document.querySelectorAll('.section');
    return Array.from(sections).some(section => section.style.display === 'block');
}
// Function to open the project proposals section
function openProjectProposalsSection() {
    const projectProposalsButton = document.getElementById('toggleProjectProposals');
    projectProposalsButton.click();
    console.debug('No sections open, opening projectProposalsSection');
}
// Attach event listeners
document.getElementById('toggleLesezeichen').addEventListener('click', function() {
    toggleSection('bookmarksSection');
});
// Attach the toggleSection function to the new button

// Attach the toggleSection function to each button
document.querySelectorAll('.control-bar .c-button').forEach(button => {
    button.addEventListener('click', function() {
        const sectionId = this.getAttribute('data-section-id');
        toggleSection(sectionId);
    });
});


function toggleSection(sectionId) {
    
    console.log(sectionId)
    const section = document.getElementById(sectionId);
    const projectProposalsSection = document.getElementById('projectProposalsSection');
    const projectProposalsButton = document.getElementById('toggleProjectProposals');
    // Close the current open section if it's not the one being toggled
    if (currentOpenSection && currentOpenSection !== sectionId) {
        const currentSection = document.getElementById(currentOpenSection);
        if (currentSection) {
            currentSection.style.display = 'none';
            document.querySelector(`[data-section-id="${currentOpenSection}"]`).classList.remove('active');
            console.debug(currentOpenSection + ' section closed');
        }
    }
    // Toggle the clicked section
    if (section.style.display === 'none') {
        section.style.display = 'block';
        document.querySelector(`[data-section-id="${sectionId}"]`).classList.add('active');
        console.debug(sectionId + ' section opened');
        currentOpenSection = sectionId;
        // Close project proposals if it's open and not the current section
        if (projectProposalsSection.style.display === 'block' && sectionId !== 'projectProposalsSection') {
            projectProposalsSection.style.display = 'none';
            projectProposalsButton.classList.remove('active');
            console.debug('projectProposalsSection section closed');
        }
    } else {
        section.style.display = 'none';
        document.querySelector(`[data-section-id="${sectionId}"]`).classList.remove('active');
        console.debug(sectionId + ' section closed, opening projectProposalsSection');
        // Open project proposals section if it's not already open
        if (projectProposalsSection.style.display === 'none') {
            projectProposalsSection.style.display = 'block';
            projectProposalsButton.classList.add('active');
            console.debug('projectProposalsSection section opened');
            currentOpenSection = 'projectProposalsSection';
        } else {
            currentOpenSection = null;
        }
    }
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
// Update event listeners

document.getElementById('toggleProjectProposals').addEventListener('click', function() {
    toggleSection('projectProposalsSection');
});
document.getElementById('toggleNotes').addEventListener('click', function() {
    toggleSection('notesSection');
});
document.getElementById('toggleComments').addEventListener('click', function() {
    toggleSection('commentsSection');
});

document.getElementById('toggleUsers').addEventListener('click', function() {
    toggleSection('usersSection');
});

function submitExportForm() {
    
    var formData = new FormData(document.getElementById("exportForm"));
    formData.forEach(function(value, key) {
        console.debug("Form Data - Key:", key, "Value:", value);
    });
    console.debug("Sending POST request to /export_projects");
    fetch('{{ url_for("export_projects") }}', {
        method: 'POST',
        body: formData
    }).then(response => {
        console.debug("Server Response:", response);
        if (!response.ok) {
            console.error('Server responded with status:', response.status);
            throw new Error('Server responded with status ' + response.status);
        }
        return response.json(); // Expecting a JSON response now
    }).then(data => {
        if (data.filepath) {
            // Trigger download using the filepath received
            window.location.href = data.filepath; // This will start the download
        } else {
            console.error('File path not received from server');
        }
    }).catch(error => {
        console.error('Export error:', error);
    });
    return false; // Prevent traditional form submission
}


function deleteComment(event, commentId) {
    event.preventDefault(); // Prevent the form from submitting normally

    if (!confirm('Möchten Sie diesen Kommentar wirklich löschen?')) {
        return; // User canceled the action
    }

    fetch(`/delete_comment/${commentId}`, {
            method: 'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                commentId: commentId
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Remove the comment from the DOM
                document.querySelector(`.stat-box2[data-comment-id="${commentId}"]`).remove();

                // Update the number of comments displayed in the comments section
                updateNumComments();

                // Specifically update the comment count in the "marker-limit-info" div
                updateCommentCountInStatistics();
            } else {
                alert('Fehler beim Löschen des Kommentars.');
            }
        })
        .catch(error => console.error('Error:', error));
}

function updateNumComments() {
    const numCommentsSpan = document.querySelector('.my-comments h2 span');
    let numComments = parseInt(numCommentsSpan.textContent);
    if (!isNaN(numComments) && numComments > 0) {
        numCommentsSpan.textContent = `${numComments - 1} Kommentar(e)`; // Decrement the comment count
    }
}

function updateCommentCountInStatistics() {
    // Assuming the comment count is the second element with the class 'highlight' in its parent container
    const numCommentsStatSpan = document.querySelectorAll('.marker-limit-info .highlight')[1];
    if (numCommentsStatSpan) {
        let numComments = parseInt(numCommentsStatSpan.textContent);
        if (!isNaN(numComments) && numComments > 0) {
            numCommentsStatSpan.textContent = `${numComments - 1}`;
            // If there is a specific wording to update (e.g., "Kommentare" word itself), handle that here as well
        }
    }
}


function removeBookmark(event, projectId) {
    event.preventDefault(); // Stop the form from submitting
    const confirmation = confirm('Möchten Sie dieses Lesezeichen wirklich entfernen?');
    if (!confirmation) {
        return; // User canceled the action
    }

    fetch(`/remove_bookmark/${projectId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            // Include CSRF token if your application requires it
        },
    }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }
        return response.json();
    }).then(data => {
        //console.log('Bookmark removed:', data);
        // Remove the project thumbnail from the DOM
        const thumbnailToRemove = document.getElementById(`project-thumbnail-${projectId}`);
        if (thumbnailToRemove) {
            thumbnailToRemove.remove();
        }
        // Update the number of bookmarks displayed
        updateNumBookmarks();
    }).catch(error => console.error('Error:', error));
}

function updateNumBookmarks() {
    const numBookmarksSpan = document.getElementById('num-bookmarks');
    let numBookmarks = parseInt(numBookmarksSpan.textContent);
    if (!isNaN(numBookmarks)) {
        numBookmarksSpan.textContent = `${numBookmarks - 1} Lesezeichen`; // Decrement the bookmark count
    }
}

function confirmDeleteMapObject(event, projectId) {
    event.preventDefault(); // Prevent default form submission
    const confirmation = confirm('Möchten Sie diese Notiz wirklich löschen?');
    if (!confirmation) {
        return; // User canceled the action
    }

    fetch(`/delete_project/${projectId}`, {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json'
            // Include CSRF token as necessary
        },
    }).then(response => response.json()).then(data => {
        if (data.success) {
            alert('Notiz erfolgreich gelöscht.');
            // Remove the map object from the DOM
            document.querySelector(`.project-thumbnail[data-project-id="${projectId}"]`).remove();
            // Update the count of map objects
            updateNumMapObjects();
        } else {
            alert('Fehler beim Löschen der Notiz.');
        }
    }).catch(error => console.error('Error:', error));
}

function updateNumMapObjects() {
    const numMapObjectsSpan = document.getElementById('num-map-objects');
    let numMapObjects = parseInt(numMapObjectsSpan.textContent);
    if (!isNaN(numMapObjects)) {
        // Reconstruct the sentence with the updated count
        numMapObjectsSpan.innerHTML = `${numMapObjects - 1} Notizen <span style="color: #003056;">gepostet.</span>`; // Decrement the count and ensure "gepostet." remains
    }
}


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
            //console.log(`Project loaded with ${upvotes} upvotes and ${downvotes} downvotes. Adjusting border-radius.`);
            if (upvotesElement) upvotesElement.style.borderRadius = '30px 0 0 30px';
            if (downvotesElement) downvotesElement.style.borderRadius = '0 30px 30px 0';
        } else if (upvotes > 0 && downvotes === 0) {
            //console.log(`Project loaded with ${upvotes} upvotes and 0 downvotes. Adjusting border-radius for upvotes.`);
            if (upvotesElement) upvotesElement.style.borderRadius = '30px';
        } else if (downvotes > 0 && upvotes === 0) {
            //console.log(`Project loaded with ${downvotes} downvotes and 0 upvotes. Adjusting border-radius for downvotes.`);
            if (downvotesElement) downvotesElement.style.borderRadius = '30px';
        } else {
            //console.log(`Project loaded with 0 upvotes and 0 downvotes. Setting border-radius to 30px on both sides.`);
            if (upvotesElement) upvotesElement.style.borderRadius = '30px';
            if (downvotesElement) downvotesElement.style.borderRadius = '30px';
        }
    });
});
let currentPageNumber = 1; // Default to page 1
document.addEventListener('DOMContentLoaded', function() {
    //console.log('DOM fully loaded. Initializing event listeners.');
    attachEventListeners();
    updateCurrentPageNumberFromURL(); // Initialize currentPageNumber based on URL at load
});

function attachEventListeners() {
    document.body.addEventListener('submit', handleFormSubmit);
    document.addEventListener('click', attachPaginationEventListeners);
}

function handleFormSubmit(event) {
    if (event.target.matches('.my-map-objects .project-thumbnail form')) {
        event.preventDefault();
        handleDeleteRequest(event.target);
    }
}

function attachPaginationEventListeners(event) {
    if (event.target.matches('.pagination .page-link')) {
        event.preventDefault();
        updateCurrentPageNumberFromLink(event.target.href);
        fetchPage(event.target.href);
    }
}

function handleDeleteRequest(form) {
    const projectId = new URL(form.action).pathname.split('/').pop();
    //console.log('Attempting to delete project with ID:', projectId);
    fetch(form.action, {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    }).then(response => response.json()).then(data => {
        if (data.success) {
            //console.log('Project deleted successfully:', projectId);
            updatePageAfterDeletion();
        } else {
            console.error('Error deleting project:', data.message);
        }
    }).catch(error => console.error('Error in delete request:', error));
}

function updateCurrentPageNumberFromLink(url) {
    const urlObj = new URL(url);
    const pageParam = urlObj.searchParams.get('map_object_page');
    if (pageParam) {
        currentPageNumber = pageParam;
        //console.log('Updated currentPageNumber from link:', currentPageNumber);
    }
}

function updatePageAfterDeletion() {
    const remainingProjects = document.querySelectorAll('.my-map-objects .project-thumbnail').length;
    const currentBaseURL = window.location.href.split('?')[0];
    let newURL;
    if (remainingProjects > 0) {
        newURL = `${currentBaseURL}?project_page=1&map_object_page=${currentPageNumber}&comment_page=1`;
    } else {
        // Handle case when no remaining projects on current page
        let newPageNumber = currentPageNumber > 1 ? currentPageNumber - 1 : 1;
        newURL = `${currentBaseURL}?project_page=1&map_object_page=${newPageNumber}&comment_page=1`;
    }
    //console.log(`Page update triggered. Fetching URL: ${newURL}`);
    fetchPage(newURL);
}

function fetchPage(url) {
    //console.log('Fetching page section:', url);
    fetch(url, {
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.text();
    }).then(html => {
        updateSectionContent(html);
    }).catch(error => console.error('Error fetching page section:', error));
}

function updateSectionContent(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const newContent = doc.querySelector('.my-map-objects');
    if (newContent) {
        document.querySelector('.my-map-objects').innerHTML = newContent.innerHTML;
        //console.log('Page content updated.');
    } else {
        console.error('New content not found in the response');
    }
}

function updateCurrentPageNumberFromURL() {
    const urlObj = new URL(window.location.href);
    const pageParam = urlObj.searchParams.get('map_object_page');
    if (pageParam) {
        currentPageNumber = pageParam;
        //console.log('Updated currentPageNumber from URL:', currentPageNumber);
    }
}
document.addEventListener('DOMContentLoaded', function() {
    let currentOpenSection = null;

    function toggleSection(sectionId) {
        
        const section = document.getElementById(sectionId);
        if (!section) {
            console.error("Section not found:", sectionId);
            return;
        }

        // Toggle only if the section is not already open
        if (section.style.display === 'none') {
            section.style.display = 'block';
            if (currentOpenSection && currentOpenSection !== sectionId) {
                const currentSection = document.getElementById(currentOpenSection);
                if (currentSection) {
                    currentSection.style.display = 'none';
                    console.debug(currentOpenSection + ' section closed');
                }
            }
            currentOpenSection = sectionId;
            console.debug(sectionId + ' section opened');
        } else {
            section.style.display = 'none';
            console.debug(sectionId + ' section closed');
            currentOpenSection = null;
        }
    }

    const filterOverlayButtons = document.querySelectorAll('#filter-overlay .c-button');
    filterOverlayButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            const sectionId = this.getAttribute('data-section-id');

            // Check if the clicked section is the same as the currently open section
            if (currentOpenSection === sectionId) {
                // Close only the overlay
                document.getElementById('filter-overlay').style.display = 'none';
                console.debug('Overlay closed, current section remains open:', sectionId);
            } else {
                // Toggle the section and close the overlay
                toggleSection(sectionId);
                document.getElementById('filter-overlay').style.display = 'none';
            }
        });
    });

    // Opening 'projectProposalsSection' by default
    if (!isAnySectionOpen()) {
        toggleSection('projectProposalsSection');
    }

    // Open 'projectProposalsSection' by default when the page loads
    toggleSection('projectProposalsSection');

    // Toggle filter overlay
    const hamburgerButtonFilter = document.getElementById('hamburger-button-filter');
    const filterOverlay = document.getElementById('filter-overlay');
    if (hamburgerButtonFilter && filterOverlay) {
        hamburgerButtonFilter.addEventListener('click', function() {
            filterOverlay.style.display = filterOverlay.style.display === 'flex' ? 'none' : 'flex';
        });
    }

    // Close filter overlay when clicking outside
    if (filterOverlay) {
        filterOverlay.addEventListener('click', function(event) {
            if (event.target === this) {
                this.style.display = 'none';
            }
        });
    }

    // Toggle navigation overlay
    const hamburgerButton = document.getElementById('hamburger-button');
    const navOverlay = document.getElementById('nav-overlay');
    if (hamburgerButton && navOverlay) {
        hamburgerButton.addEventListener('click', function() {
            navOverlay.style.display = navOverlay.style.display === 'block' ? 'none' : 'block';
        });
    }
});

function isAnySectionOpen() {
    let sections = document.querySelectorAll('.section');
    return Array.from(sections).some(section => section.style.display === 'block');
}

function deleteProject(event, projectId) {
    event.preventDefault(); // Prevent form submission
    const confirmation = confirm('Möchten Sie dieses Projekt wirklich löschen?');
    if (!confirmation) {
        return; // Stop if the user cancels
    }

    fetch(`/delete_project/${projectId}`, {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json'
        },
        // Include CSRF token as needed
    }).then(response => response.json()).then(data => {
        if (data.success) {
            alert('Projekt erfolgreich gelöscht.');
            document.querySelector(`form[data-project-id="${projectId}"]`).closest('.project-thumbnail').remove();
            // Call function to update project counts
            updateProjectCounts();
        } else {
            alert('Fehler beim Löschen des Projekts.');
        }
    }).catch(error => console.error('Error:', error));
}

function updateProjectCounts() {
    const projectCountSpan = document.querySelector('.highlight'); // Adjust the selector as necessary
    let currentCount = parseInt(projectCountSpan.textContent);
    if (!isNaN(currentCount)) {
        projectCountSpan.textContent = currentCount - 1; // Decrement count
    }
}

