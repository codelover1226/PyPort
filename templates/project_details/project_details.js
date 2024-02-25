function toggleReport(projectId) {
    //console.log(`Project_details.html: ${document.getElementById('report-button').innerText === 'Spam gemeldet 🛑' ? 'Removing report for' : 'Reporting'} project ID ${projectId} for user ${currentUserId}.`);

    fetch(`/report/${projectId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        let button = document.getElementById('report-button');
        if (data.reported) {
            //console.log(`Project_details.html: Logged in as user ID ${currentUserId}. You have reported this project. Transforming the Report button to "Spam gemeldet 🛑".`);
            button.innerText = 'Spam gemeldet 🛑';
        } else {
            //console.log(`Project_details.html: Report button clicked, removing the report of project ID ${projectId} for user ${currentUserId}.`);
            button.innerText = 'Spam melden ⚠️';
        }
    })
    .catch(error => {});
}
//console.log("Project_details.html: Logged in as user ID {{ current_user.id if current_user.is_authenticated else 'Anonymous' }}. {% if is_bookmarked %}You have already bookmarked this project. Transforming the Bookmark button to 'Bookmarked'.{% else %}This project is not bookmarked by you.{% endif %}");

var currentUserId = {{ currentUserId | tojson }};


function bookmarkProject(projectId) {
    //console.log("Attempting to bookmark project with ID:", projectId);
    fetch(`/bookmark/${projectId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            //console.log('Project bookmarked:', data);
            // Update the button to reflect bookmark status
            document.getElementById('bookmark-button').innerText = 'Bookmarked ✨';
        } else {
    }
})
.catch(error => {});
}

function toggleBookmark(projectId) {
//console.log(`Project_details.html: ${document.getElementById('bookmark-button').innerText === 'Bookmarked' ? 'Removing' : 'Adding'} bookmark for project ID ${projectId} for user ${currentUserId}.`);

fetch(`/bookmark/${projectId}`, {
method: 'POST',
headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
}
})
.then(response => response.json())
.then(data => {
if (data.success) {
    let button = document.getElementById('bookmark-button');
    if (data.bookmarked) {
        //console.log(`Project_details.html: Logged in as user ID ${currentUserId}. You have bookmarked this project. Transforming the Bookmark button to "Bookmarked".`);
        button.innerText = 'Bookmarked ✨';
    } else {
        //console.log(`Project_details.html: Bookmarked button clicked, removing the bookmark of project ID ${projectId} for user ${currentUserId}.`);
        button.innerText = 'Bookmark ⭐';
    }
} else {}
})
.catch(error => {});
}
function initClickableEdges() {
    const screenWidth = window.innerWidth;
    if (screenWidth <= 1080) {
        //console.log("Screen width less than 1080, activating clickable screen edges.");

        const leftEdge = document.createElement('div');
        leftEdge.className = 'clickable-edge-left';
        document.body.appendChild(leftEdge);

        const rightEdge = document.createElement('div');
        rightEdge.className = 'clickable-edge-right';
        document.body.appendChild(rightEdge);

        leftEdge.addEventListener('click', function() {
            {% if prev_project_id %}
                window.location.href = "{{ url_for('project_details', project_id=prev_project_id) }}";
            {% endif %}
        });

        rightEdge.addEventListener('click', function() {
            {% if next_project_id %}
                window.location.href = "{{ url_for('project_details', project_id=next_project_id) }}";
            {% endif %}
        });
    } else {
        //console.log("Screen width more than 1080, disabling / not activating the clickable screen edges.");
    }
}

window.onload = initClickableEdges;
window.onresize = initClickableEdges; // Re-initialize if screen size changes
// Refactored condition
{% if current_user.is_authenticated %}
    var isAuthor = "{{ current_user.id }}" === "{{ project.author }}";
    var isAdmin = {% if current_user.is_admin %} true {% else %} false {% endif %};

    //console.log("Is Author:", isAuthor);
    //console.log("Is Admin:", isAdmin);

    if (isAuthor || isAdmin) {
        //console.log("Project_details.html: Project created by ID {{ project.author }}. User is logged in as ID {{ current_user.id }}. Showing the editing button - Condition Met (Author/Admin)");
    } else {
        //console.log("Condition not met - User is neither the author nor an admin");
    }
{% else %}
    //console.log("User not authenticated - Cannot show edit button");
{% endif %}
</script>




<script>
// Function to check comment limit and potentially start a timer
function checkCommentLimit() {
//console.log("Checking comment limit...");

fetch('/check_comment_limit')
    .then(response => response.json())
    .then(data => {
        //console.log("Comment Limit Check: ", data);
        var commentButton = document.querySelector('.comment-button');
        if (commentButton) {
            if (data.limit_reached) {
                //console.log(`LIMIT CHECK: 5/5 comments posted, limit has been reached. Turning button into a timer. Limit expires in: ${data.reset_time}`);
                commentButton.disabled = true;
                startTimer(data.reset_time, 'comment-button');
            } else {
                // Ensure the property name here matches what is sent from the server
                //console.log(`LIMIT CHECK: ${data.current_count}/5 comments posted.`);
            }
        } else {}
    })
    .catch(error => {});
}

// Timer function
function startTimer(expiryTime, elementId) {
if (!expiryTime) {
    return;
}

var countDownDate = new Date(expiryTime).getTime();
var element = document.getElementById(elementId);
if (element) {
} else {
    return;
}

var interval = setInterval(function() {
    var now = new Date().getTime();
    var distance = countDownDate - now;
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    var timerText = `Limit erreicht. Nächstes Kommentar möglich um: ${minutes}m ${seconds}s`;
    element.innerText = timerText;

    if (distance < 0) {
        clearInterval(interval);
        element.innerText = "Kommentar absenden";
        element.disabled = false;
    }
}, 1000);
}

// Function to update character count feedback
function updateCharCountFeedback(textareaElement, feedbackElement, minLimit, maxLimit) {
var charCount = textareaElement.value.length;
var charRemaining = maxLimit - charCount;

if (charCount < minLimit) {
    feedbackElement.textContent = `Sie müssen noch ${minLimit - charCount} Zeichen eingeben.`;
} else if (charCount <= maxLimit) {
    feedbackElement.textContent = `Sie können noch ${charRemaining} Zeichen eingeben.`;
} else {
    feedbackElement.textContent = "Zeichenlimit erreicht.";
    textareaElement.value = textareaElement.value.substring(0, maxLimit);
}
feedbackElement.style.color = '#003056';
}

// Event listener for DOMContentLoaded to initialize functionalities
document.addEventListener('DOMContentLoaded', function() {

var commentTextarea = document.querySelector('textarea[name="comment"]');
var charCountFeedback = document.getElementById('charCountFeedback');
var commentButton = document.querySelector('.comment-button'); // Modified line


if (commentTextarea && charCountFeedback && commentButton) {
    commentTextarea.addEventListener('input', function() {
        updateCharCountFeedback(commentTextarea, charCountFeedback, 20, 500);
    });

    updateCharCountFeedback(commentTextarea, charCountFeedback, 20, 500); // Initial update
    checkCommentLimit(); // Check comment limit on page load
} else {
}
function setInitialVoteBarStyles() {
    const upvoteElement = document.querySelector('.upvotes');
    const downvoteElement = document.querySelector('.downvotes');
    const upvotePercentage = parseFloat(upvoteElement.style.width);
    const downvotePercentage = parseFloat(downvoteElement.style.width);

    if (upvotePercentage > 0 && downvotePercentage > 0) {
        upvoteElement.style.borderRadius = '30px 0 0 30px';
        downvoteElement.style.borderRadius = '0 30px 30px 0';
    } else if (upvotePercentage > 0) {
        upvoteElement.style.borderRadius = '30px';
    } else if (downvotePercentage > 0) {
        downvoteElement.style.borderRadius = '30px';
    }

}

setInitialVoteBarStyles(); // Call the function on page load
});
</script>





<script>
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

</script>

<script>
// Initialize the map
{% if not project.is_global %}
var projectMap = L.map('project-map', {
    minZoom: 15
}).setView([51.505, -0.09], 15); // Set the initial zoom level to 15

// Load and display tile layer on the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(projectMap);

// Define custom icon
var customIcon = L.icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Extract geolocation from the project's data
var geoloc = "{{ project.geoloc }}".split(",");
var lat = parseFloat(geoloc[0]);
var lng = parseFloat(geoloc[1]);
//console.log("Project location: Latitude " + lat + " Longitude " + lng); // Debugging

// Set map view and add marker
if (!isNaN(lat) && !isNaN(lng)) {
    projectMap.setView([lat, lng], 15);
    L.marker([lat, lng], {icon: customIcon}).addTo(projectMap);
}
    {% else %}
    //console.log("Project is global, map initialization skipped.");
{% endif %}
</script>
<script>
document.getElementById('comment-form').addEventListener('submit', function(e) {
    e.preventDefault();

    var commentText = this.querySelector('textarea[name="comment"]').value;

    // Check if comment length is less than 20 characters
    if (commentText.length < 20) {
        alert('Der Kommentar muss mindestens 20 Zeichen lang sein.');
        return;
    }

    // Fetch the swear words list and proceed with the submission
    fetch('/static/filter.json')
        .then(response => response.json())
        .then(filter => {
            if (containsSwearWords(commentText, filter)) {
                alert('Bitte entfernen Sie unangebrachte Ausdrücke aus Ihrer Beschreibung.');
            } else {
                submitCommentForm(this, commentText);
            }
        })
        .catch(error => {
            // Optionally submit the form even if the filter can't be loaded
            submitCommentForm(this, commentText);
        });
});

function containsSwearWords(text, filter) {
    var words = text.toLowerCase().split(/\s+/);
    var swearWords = filter.de.concat(filter.en); // Assuming you want to check both German and English words
    return words.some(word => swearWords.includes(word));
}

function submitCommentForm(form, commentText) {
var formData = new FormData(form);
var xhr = new XMLHttpRequest();
xhr.open('POST', form.action, true);
xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

xhr.onload = function() {
    if (this.status >= 200 && this.status < 400) {
        // Parse response, update comments, and clear textarea
        var response = JSON.parse(this.response);
        var commentsContainer = document.getElementById('comments-container');
        var newCommentHtml = `
            <div class="comment">
                <p>"${response.text}"</p>
                <p>${response.author_name} am ${response.timestamp}</p>
            </div>
        `;
        commentsContainer.insertAdjacentHTML('beforeend', newCommentHtml);

        // Clear the textarea after successful submission
        form.querySelector('textarea[name="comment"]').value = '';

        // Check comment limit after adding a comment
        checkCommentLimit();
    } else {}
};

xhr.send(formData);
}

</script>

<script>
function vote(projectId, voteType) {
fetch(`/vote/${projectId}/${voteType}`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    body: JSON.stringify({ 'project_id': projectId, 'vote_type': voteType })
})
.then(response => response.json())
.then(data => {
    if (data.success) {
        //console.log('Vote recorded:', data);

        // Update UI elements with formatted text
        const upvoteElement = document.querySelector('.upvotes');
        const downvoteElement = document.querySelector('.downvotes');
        const upvoteCount = data.upvote_count;
        const downvoteCount = data.downvote_count;
        const upvotePercentage = data.upvote_percentage.toFixed(1);
        const downvotePercentage = data.downvote_percentage.toFixed(1);

    document.getElementById('upvote-count').innerHTML = `Gefällt: <strong style="font-weight: bold;">${upvoteCount}</strong> (${upvotePercentage}%)`;
document.getElementById('downvote-count').innerHTML = `Gefällt nicht: <strong style="font-weight: bold;">${downvoteCount}</strong> (${downvotePercentage}%)`;

        upvoteElement.style.width = `${upvotePercentage}%`;
        downvoteElement.style.width = `${downvotePercentage}%`;

        // Adjust border-radius based on vote counts
        if (upvoteCount > 0 && downvoteCount > 0) {
            upvoteElement.style.borderRadius = '30px 0 0 30px';
            downvoteElement.style.borderRadius = '0 30px 30px 0';
            //console.log(`Vote casted. Now there are ${upvoteCount} upvotes and ${downvoteCount} downvotes. The border-radius will not change.`);
        } else if (upvoteCount > 0 && downvoteCount === 0) {
            upvoteElement.style.borderRadius = '30px';
            //console.log(`Vote casted. Now there are 0 downvotes and ${upvoteCount} upvotes. The border-radius for both ends of upvotes will be 30px.`);
        } else if (upvoteCount === 0 && downvoteCount > 0) {
            downvoteElement.style.borderRadius = '30px';
            //console.log(`Vote casted. Now there are 0 upvotes and ${downvoteCount} downvotes. The border-radius for both ends of downvotes will be 30px.`);
        }
    } else {}
})
.catch(error => {});
}


</script>


<script>
    // Share on WhatsApp
    document.getElementById('share-whatsapp').addEventListener('click', function(e) {
        e.preventDefault();
        //console.log("Sharing to WhatsApp");
        var whatsappUrl = `https://wa.me/?text=Schau dir dieses Projekt an, das könnte unsere Stadt verbessern! ${window.location.href}`;
        window.open(whatsappUrl, '_blank');
    });

    // Share on Facebook
    document.getElementById('share-facebook').addEventListener('click', function(e) {
        e.preventDefault();
        //console.log("Sharing to Facebook");
        var facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
        window.open(facebookUrl, '_blank');
    });



    // General share
    document.getElementById('share-share').addEventListener('click', function(e) {
        e.preventDefault();
        //console.log("Opening general share dialog");
        if (navigator.share) {
            navigator.share({
                title: 'Project Sharing',
                url: window.location.href
            }).then(() => {
                //console.log('Thanks for sharing!');
            })
            .catch();
        } else {
            //console.log('Web share not supported');
            alert('Web share not supported. Copy the URL to share.');
        }
    });