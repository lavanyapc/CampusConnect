const API_URL = "/api/notices";

const noticeList = document.getElementById("noticeList");
const noticeForm = document.getElementById("noticeForm");

// Fetch and display all announcements
async function loadNotices() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Unable to load announcements");
        }

        const notices = await response.json();
        noticeList.innerHTML = "";

        if (notices.length === 0) {
            noticeList.innerHTML =
                '<p class="empty-message">No announcements yet. Be the first to post one!</p>';
            return;
        }

        notices.forEach(notice => {
            const card = document.createElement("div");
            card.className = "notice-card";

            const title = document.createElement("h3");
            title.textContent = notice.title;

            const content = document.createElement("p");
            content.className = "content";
            content.textContent = notice.content;

            const meta = document.createElement("p");
            meta.className = "notice-meta";

            const date = notice.createdAt
                ? new Date(notice.createdAt).toLocaleString()
                : "Just posted";

            meta.textContent = `Posted by ${notice.author} • ${date}`;

            const deleteButton = document.createElement("button");
            deleteButton.className = "delete-button";
            deleteButton.textContent = "Delete Notice";
            deleteButton.addEventListener("click", () => deleteNotice(notice.id));

            card.append(title, content, meta, deleteButton);
            noticeList.appendChild(card);
        });

    } catch (error) {
        noticeList.textContent = "Unable to load announcements. Please try again later.";
        console.error(error);
    }
}

// Post a new announcement
noticeForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const notice = {
        title: document.getElementById("title").value.trim(),
        content: document.getElementById("content").value.trim(),
        author: document.getElementById("author").value.trim()
    };

    if (!notice.title || !notice.content || !notice.author) {
        alert("Please fill in all fields.");
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(notice)
        });

        if (!response.ok) {
            throw new Error("Unable to post announcement");
        }

        noticeForm.reset();
        await loadNotices();
        alert("Announcement posted successfully!");

    } catch (error) {
        alert("Could not post announcement. Please try again.");
        console.error(error);
    }
});

// Delete an announcement
async function deleteNotice(id) {
    if (!confirm("Are you sure you want to delete this announcement?")) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Unable to delete announcement");
        }

        await loadNotices();

    } catch (error) {
        alert("Could not delete announcement. Please try again.");
        console.error(error);
    }
}

// Load announcements when the page opens
loadNotices();
