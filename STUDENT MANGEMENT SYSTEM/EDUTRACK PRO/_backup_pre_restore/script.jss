/**
 * EduTrack Pro - Student Management System
 * Full-Stack Client: Vanilla JavaScript connecting to Spring Boot REST API & MySQL
 */

// REST API Base URL (Spring Boot server port 8080)
const API_BASE_URL = 'http://localhost:8080/api/students';

// LocalStorage Key for UI Theme Preference ONLY
const THEME_KEY = 'sms_theme';

// Application State (Source of Truth is MySQL Database via REST API)
let students = [];
let editingStudentDbId = null;  // Database Long ID of student currently being edited
let studentToDelete = null;     // Student object selected for deletion

// DOM Elements - Form
const studentForm = document.getElementById('studentForm');
const formHeading = document.getElementById('formHeading');
const formSubheading = document.getElementById('formSubheading');
const editingIndicator = document.getElementById('editingIndicator');
const submitBtn = document.getElementById('submitBtn');
const submitBtnText = document.getElementById('submitBtnText');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const resetFormBtn = document.getElementById('resetFormBtn');

// Inputs
const studentIdInput = document.getElementById('studentId');
const nameInput = document.getElementById('name');
const departmentInput = document.getElementById('department');
const yearInput = document.getElementById('year');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');

// Error Containers
const nameError = document.getElementById('nameError');
const deptError = document.getElementById('deptError');
const yearError = document.getElementById('yearError');
const emailError = document.getElementById('emailError');
const phoneError = document.getElementById('phoneError');

// Table & Search/Filter Elements
const studentTableBody = document.getElementById('studentTableBody');
const recordCountBadge = document.getElementById('recordCountBadge');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const filterDept = document.getElementById('filterDept');
const filterYear = document.getElementById('filterYear');
const resetFiltersBtn = document.getElementById('resetFiltersBtn');
const emptyState = document.getElementById('emptyState');
const emptyStateDesc = document.getElementById('emptyStateDesc');
const clearFiltersEmptyBtn = document.getElementById('clearFiltersEmptyBtn');

// Dashboard Metric Counters
const statTotalStudents = document.getElementById('statTotalStudents');
const statTotalDepartments = document.getElementById('statTotalDepartments');
const statYear1 = document.getElementById('statYear1');
const statYear2 = document.getElementById('statYear2');
const statYear3 = document.getElementById('statYear3');
const statYear4 = document.getElementById('statYear4');

// View Modal
const viewModal = document.getElementById('viewModal');
const viewModalContent = document.getElementById('viewModalContent');
const closeViewModalBtn = document.getElementById('closeViewModalBtn');
const closeViewModalFooterBtn = document.getElementById('closeViewModalFooterBtn');
const viewModalEditBtn = document.getElementById('viewModalEditBtn');
let currentlyViewingStudent = null;

// Delete Modal
const deleteModal = document.getElementById('deleteModal');
const deleteStudentPill = document.getElementById('deleteStudentPill');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const closeDeleteModalBtn = document.getElementById('closeDeleteModalBtn');

// Toast Container
const toastContainer = document.getElementById('toastContainer');

// Theme Toggle & Export
const themeToggleBtn = document.getElementById('themeToggleBtn');
const exportCsvBtn = document.getElementById('exportCsvBtn');

/* ==========================================================================
   Initialization
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setupEventListeners();
    fetchStudentsFromApi();
    fetchNextStudentIdPreview();
});

/**
 * Initialize theme from LocalStorage or system preference
 */
function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    showToast(`Switched to ${newTheme} mode`, 'info');
}

/* ==========================================================================
   REST API Integration (Fetch from Spring Boot Backend)
   ========================================================================== */

/**
 * GET /api/students - Load all students from MySQL
 */
async function fetchStudentsFromApi() {
    try {
        const response = await fetch(API_BASE_URL);

        if (!response.ok) {
            throw new Error(`Server returned HTTP ${response.status}`);
        }

        const data = await response.json();
        students = Array.isArray(data) ? data : [];

        updateDashboardStats();
        renderStudentTable();
    } catch (error) {
        console.error('Error fetching students from Spring Boot backend:', error);
        students = [];
        updateDashboardStats();
        renderStudentTable();

        showToast(
            'Unable to connect to the server. Please make sure the Spring Boot backend is running on http://localhost:8080.',
            'error'
        );

        if (emptyState && emptyStateDesc) {
            emptyState.style.display = 'flex';
            emptyStateDesc.textContent = 'Backend server unavailable. Please start Spring Boot on port 8080 and ensure MySQL is running.';
        }
    }
}

/**
 * GET /api/students/next-id - Fetch next formatted student ID for form preview
 */
async function fetchNextStudentIdPreview() {
    if (editingStudentDbId) return; // Keep existing ID when editing

    try {
        const response = await fetch(`${API_BASE_URL}/next-id`);
        if (response.ok) {
            const data = await response.json();
            if (data && data.nextId) {
                studentIdInput.value = data.nextId;
                return;
            }
        }
    } catch (e) {
        // Fallback calculation if backend is briefly unreachable
    }

    // Fallback ID preview calculation
    let maxId = 1000;
    students.forEach(s => {
        const match = String(s.studentId || '').match(/\d+/);
        if (match) {
            const num = parseInt(match[0], 10);
            if (num > maxId) maxId = num;
        }
    });
    studentIdInput.value = `STU-${maxId + 1}`;
}

/* ==========================================================================
   Dashboard Metrics Calculation
   ========================================================================== */
function updateDashboardStats() {
    const totalCount = students.length;

    // Unique departments among enrolled students
    const uniqueDepts = new Set(students.map(s => s.department).filter(Boolean));
    const deptCount = uniqueDepts.size;

    // Academic Year breakdown
    let countYear1 = 0;
    let countYear2 = 0;
    let countYear3 = 0;
    let countYear4 = 0;

    students.forEach(student => {
        const yr = String(student.year || '').trim();
        if (yr.startsWith('1')) countYear1++;
        else if (yr.startsWith('2')) countYear2++;
        else if (yr.startsWith('3')) countYear3++;
        else if (yr.startsWith('4')) countYear4++;
    });

    statTotalStudents.textContent = totalCount;
    statTotalDepartments.textContent = deptCount;
    statYear1.textContent = countYear1;
    statYear2.textContent = countYear2;
    statYear3.textContent = countYear3;
    statYear4.textContent = countYear4;
}

/* ==========================================================================
   Client-side Form Validation
   ========================================================================== */
function clearError(input, errorElement) {
    input.classList.remove('is-invalid');
    errorElement.textContent = '';
    errorElement.classList.remove('visible');
}

function setError(input, errorElement, message) {
    input.classList.add('is-invalid');
    errorElement.textContent = message;
    errorElement.classList.add('visible');
}

function validateForm() {
    let isValid = true;

    // Name Validation
    const nameVal = nameInput.value.trim();
    if (!nameVal) {
        setError(nameInput, nameError, 'Student name is required.');
        isValid = false;
    } else if (/\d/.test(nameVal)) {
        setError(nameInput, nameError, 'Student name should not contain numbers.');
        isValid = false;
    } else if (!/^[a-zA-Z\s.'-]+$/.test(nameVal) || nameVal.length < 2) {
        setError(nameInput, nameError, 'Please enter a valid full name (at least 2 letters).');
        isValid = false;
    } else {
        clearError(nameInput, nameError);
    }

    // Department Validation
    const deptVal = departmentInput.value;
    if (!deptVal) {
        setError(departmentInput, deptError, 'Please select a department.');
        isValid = false;
    } else {
        clearError(departmentInput, deptError);
    }

    // Year Validation
    const yearVal = yearInput.value;
    if (!yearVal) {
        setError(yearInput, yearError, 'Please select an academic year.');
        isValid = false;
    } else {
        clearError(yearInput, yearError);
    }

    // Email Validation (RFC standard pattern)
    const emailVal = emailInput.value.trim();
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailVal) {
        setError(emailInput, emailError, 'Email address is required.');
        isValid = false;
    } else if (!emailPattern.test(emailVal)) {
        setError(emailInput, emailError, 'Please enter a valid email address (e.g. name@college.edu).');
        isValid = false;
    } else {
        clearError(emailInput, emailError);
    }

    // Phone Validation (10 to 15 digits)
    const phoneVal = phoneInput.value.trim();
    const cleanDigits = phoneVal.replace(/\D/g, '');
    if (!phoneVal) {
        setError(phoneInput, phoneError, 'Phone number is required.');
        isValid = false;
    } else if (cleanDigits.length < 10 || cleanDigits.length > 15) {
        setError(phoneInput, phoneError, 'Phone number must contain between 10 and 15 digits.');
        isValid = false;
    } else {
        clearError(phoneInput, phoneError);
    }

    return isValid;
}

// Live Validation error reset on user interaction
nameInput.addEventListener('input', () => clearError(nameInput, nameError));
departmentInput.addEventListener('change', () => clearError(departmentInput, deptError));
yearInput.addEventListener('change', () => clearError(yearInput, yearError));
emailInput.addEventListener('input', () => clearError(emailInput, emailError));
phoneInput.addEventListener('input', () => clearError(phoneInput, phoneError));

/* ==========================================================================
   CRUD Operations via REST API: Add, Edit, Update, Delete
   ========================================================================== */

/**
 * Handle Form Submit (POST for Add / PUT for Update)
 */
studentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateForm()) {
        showToast('Please correct the highlighted errors before submitting.', 'error');
        return;
    }

    const payload = {
        name: nameInput.value.trim(),
        department: departmentInput.value,
        year: yearInput.value,
        email: emailInput.value.trim().toLowerCase(),
        phone: phoneInput.value.trim()
    };

    submitBtn.disabled = true;

    try {
        if (editingStudentDbId !== null) {
            // PUT /api/students/{id} - UPDATE EXISTING STUDENT
            const response = await fetch(`${API_BASE_URL}/${editingStudentDbId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || `Server returned HTTP ${response.status}`);
            }

            const updatedStudent = await response.json();
            showToast(`Student ${updatedStudent.studentId} updated successfully in MySQL!`, 'success');
            resetForm();
            await fetchStudentsFromApi();

        } else {
            // POST /api/students - ADD NEW STUDENT
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || `Server returned HTTP ${response.status}`);
            }

            const createdStudent = await response.json();
            showToast(`Student ${createdStudent.name} added successfully with ID ${createdStudent.studentId}!`, 'success');
            resetForm();
            await fetchStudentsFromApi();
        }
    } catch (error) {
        console.error('Error saving student:', error);
        showToast(`Operation failed: ${error.message}`, 'error');
    } finally {
        submitBtn.disabled = false;
    }
});

/**
 * Load student into form for Editing
 */
function editStudent(identifier) {
    const student = students.find(s => String(s.id) === String(identifier) || String(s.studentId) === String(identifier));
    if (!student) {
        showToast('Student record not found.', 'error');
        return;
    }

    editingStudentDbId = student.id;

    // Populate form fields
    studentIdInput.value = student.studentId;
    nameInput.value = student.name;
    departmentInput.value = student.department;
    yearInput.value = student.year;
    emailInput.value = student.email;
    phoneInput.value = student.phone;

    // Switch form UI to Edit state
    formHeading.textContent = 'Edit Student Profile';
    formSubheading.textContent = `Updating information for ${student.name} (${student.studentId})`;
    submitBtnText.textContent = 'Update Student';
    cancelEditBtn.style.display = 'inline-flex';
    editingIndicator.style.display = 'inline-flex';

    // Clear any previous validation errors
    clearError(nameInput, nameError);
    clearError(departmentInput, deptError);
    clearError(yearInput, yearError);
    clearError(emailInput, emailError);
    clearError(phoneInput, phoneError);

    // Smooth scroll to form
    const formCard = document.getElementById('formCard');
    if (formCard) {
        formCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    nameInput.focus();

    // Close view modal if opened
    closeViewModal();
}

/**
 * Reset form back to 'Add Student' state
 */
function resetForm() {
    studentForm.reset();
    editingStudentDbId = null;

    formHeading.textContent = 'Add New Student';
    formSubheading.textContent = 'Fill in the student details below. ID is generated automatically.';
    submitBtnText.textContent = 'Add Student';
    cancelEditBtn.style.display = 'none';
    editingIndicator.style.display = 'none';

    clearError(nameInput, nameError);
    clearError(departmentInput, deptError);
    clearError(yearInput, yearError);
    clearError(emailInput, emailError);
    clearError(phoneInput, phoneError);

    fetchNextStudentIdPreview();
}

cancelEditBtn.addEventListener('click', () => {
    resetForm();
    showToast('Editing cancelled.', 'info');
});

resetFormBtn.addEventListener('click', resetForm);

/**
 * Open Delete Confirmation Modal
 */
function openDeleteModal(identifier) {
    const student = students.find(s => String(s.id) === String(identifier) || String(s.studentId) === String(identifier));
    if (!student) return;

    studentToDelete = student;
    deleteStudentPill.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
                <strong>${escapeHtml(student.name)}</strong>
                <div style="font-size: 0.8rem; color: var(--text-muted);">${escapeHtml(student.department)} &bull; ${escapeHtml(student.year)}</div>
            </div>
            <span class="profile-id-badge">${escapeHtml(student.studentId)}</span>
        </div>
    `;
    deleteModal.style.display = 'flex';
}

function closeDeleteModal() {
    studentToDelete = null;
    deleteModal.style.display = 'none';
}

/**
 * Confirm deletion -> DELETE /api/students/{id}
 */
confirmDeleteBtn.addEventListener('click', async () => {
    if (!studentToDelete) return;

    const target = studentToDelete;
    confirmDeleteBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/${target.id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`Server returned HTTP ${response.status}`);
        }

        showToast(`Student ${target.name} deleted successfully from MySQL.`, 'success');

        if (editingStudentDbId === target.id) {
            resetForm();
        }

        closeDeleteModal();
        await fetchStudentsFromApi();
    } catch (error) {
        console.error('Error deleting student:', error);
        showToast('Failed to delete student from database.', 'error');
        closeDeleteModal();
    } finally {
        confirmDeleteBtn.disabled = false;
    }
});

cancelDeleteBtn.addEventListener('click', closeDeleteModal);
closeDeleteModalBtn.addEventListener('click', closeDeleteModal);

/**
 * View Student Modal
 */
function openViewModal(identifier) {
    const student = students.find(s => String(s.id) === String(identifier) || String(s.studentId) === String(identifier));
    if (!student) return;

    currentlyViewingStudent = student;
    const initials = getInitials(student.name);

    viewModalContent.innerHTML = `
        <div class="profile-card-header">
            <div class="profile-avatar-large">${initials}</div>
            <div>
                <h4 class="profile-name">${escapeHtml(student.name)}</h4>
                <span class="profile-id-badge">${escapeHtml(student.studentId)}</span>
            </div>
        </div>

        <div class="profile-details-grid">
            <div class="profile-detail-item">
                <span class="profile-detail-label">Department</span>
                <span class="profile-detail-value">
                    <span class="dept-badge dept-badge-${escapeHtml(student.department)}">${escapeHtml(student.department)}</span>
                </span>
            </div>

            <div class="profile-detail-item">
                <span class="profile-detail-label">Academic Year</span>
                <span class="profile-detail-value">
                    <span class="year-chip">${escapeHtml(student.year)}</span>
                </span>
            </div>

            <div class="profile-detail-item">
                <span class="profile-detail-label">Email Address</span>
                <span class="profile-detail-value">
                    <a href="mailto:${escapeHtml(student.email)}" class="profile-detail-link">${escapeHtml(student.email)}</a>
                </span>
            </div>

            <div class="profile-detail-item">
                <span class="profile-detail-label">Phone Number</span>
                <span class="profile-detail-value">
                    <a href="tel:${escapeHtml(student.phone)}" class="profile-detail-link">${escapeHtml(student.phone)}</a>
                </span>
            </div>
        </div>
    `;

    viewModal.style.display = 'flex';
}

function closeViewModal() {
    viewModal.style.display = 'none';
    currentlyViewingStudent = null;
}

closeViewModalBtn.addEventListener('click', closeViewModal);
closeViewModalFooterBtn.addEventListener('click', closeViewModal);

viewModalEditBtn.addEventListener('click', () => {
    if (currentlyViewingStudent) {
        editStudent(currentlyViewingStudent.id);
    }
});

// Close modals on outside click or ESC key
window.addEventListener('click', (e) => {
    if (e.target === viewModal) closeViewModal();
    if (e.target === deleteModal) closeDeleteModal();
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeViewModal();
        closeDeleteModal();
    }
});

/* ==========================================================================
   Table Rendering, Live Search & Combined Filters
   ========================================================================== */

/**
 * Filter students across active query, department, and year
 */
function getFilteredStudents() {
    const query = searchInput.value.trim().toLowerCase();
    const dept = filterDept.value;
    const year = filterYear.value;

    return students.filter(student => {
        // Search filter condition
        let matchesSearch = true;
        if (query) {
            const sid = String(student.studentId || '').toLowerCase();
            const name = String(student.name || '').toLowerCase();
            const department = String(student.department || '').toLowerCase();
            const email = String(student.email || '').toLowerCase();
            const phone = String(student.phone || '').toLowerCase();

            matchesSearch = sid.includes(query) ||
                            name.includes(query) ||
                            department.includes(query) ||
                            email.includes(query) ||
                            phone.includes(query);
        }

        // Department filter condition
        let matchesDept = true;
        if (dept !== 'ALL') {
            matchesDept = student.department === dept;
        }

        // Year filter condition
        let matchesYear = true;
        if (year !== 'ALL') {
            matchesYear = student.year === year;
        }

        return matchesSearch && matchesDept && matchesYear;
    });
}

/**
 * Render table rows
 */
function renderStudentTable() {
    const filtered = getFilteredStudents();
    studentTableBody.innerHTML = '';

    // Record count badge
    recordCountBadge.textContent = `${filtered.length} ${filtered.length === 1 ? 'Student' : 'Students'}`;

    // Clear search button visibility
    clearSearchBtn.style.display = searchInput.value.trim() ? 'block' : 'none';

    if (filtered.length === 0) {
        emptyState.style.display = 'flex';
        emptyStateDesc.textContent = students.length === 0
            ? 'No student records in the database. Add a student above to get started!'
            : 'No student records match your current search query or filter selection.';
        return;
    }

    emptyState.style.display = 'none';

    const fragment = document.createDocumentFragment();

    filtered.forEach(student => {
        const tr = document.createElement('tr');
        const initials = getInitials(student.name);

        tr.innerHTML = `
            <td class="student-id-cell">${escapeHtml(student.studentId)}</td>
            <td>
                <div class="student-name-cell">
                    <span class="avatar-circle">${initials}</span>
                    <span>${escapeHtml(student.name)}</span>
                </div>
            </td>
            <td>
                <span class="dept-badge dept-badge-${escapeHtml(student.department)}">${escapeHtml(student.department)}</span>
            </td>
            <td>
                <span class="year-chip">${escapeHtml(student.year)}</span>
            </td>
            <td>
                <a href="mailto:${escapeHtml(student.email)}" style="color: inherit; text-decoration: none;" title="Send email to ${escapeHtml(student.name)}">
                    ${escapeHtml(student.email)}
                </a>
            </td>
            <td>
                <a href="tel:${escapeHtml(student.phone)}" style="color: inherit; text-decoration: none;" title="Call ${escapeHtml(student.name)}">
                    ${escapeHtml(student.phone)}
                </a>
            </td>
            <td>
                <div class="actions-cell">
                    <button type="button" class="btn-icon btn-icon-view" onclick="openViewModal(${student.id})" title="View student profile" aria-label="View student ${escapeHtml(student.name)}">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                    <button type="button" class="btn-icon btn-icon-edit" onclick="editStudent(${student.id})" title="Edit student" aria-label="Edit student ${escapeHtml(student.name)}">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button type="button" class="btn-icon btn-icon-delete" onclick="openDeleteModal(${student.id})" title="Delete student" aria-label="Delete student ${escapeHtml(student.name)}">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </td>
        `;

        fragment.appendChild(tr);
    });

    studentTableBody.appendChild(fragment);
}

// Live Search & Filter Event Listeners
searchInput.addEventListener('input', renderStudentTable);
clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    renderStudentTable();
    searchInput.focus();
});

filterDept.addEventListener('change', renderStudentTable);
filterYear.addEventListener('change', renderStudentTable);

function resetFilters() {
    searchInput.value = '';
    filterDept.value = 'ALL';
    filterYear.value = 'ALL';
    renderStudentTable();
}

resetFiltersBtn.addEventListener('click', resetFilters);
clearFiltersEmptyBtn.addEventListener('click', resetFilters);

/* ==========================================================================
   Export to CSV Feature
   ========================================================================== */
exportCsvBtn.addEventListener('click', () => {
    const listToExport = getFilteredStudents();
    if (listToExport.length === 0) {
        showToast('No student records to export.', 'info');
        return;
    }

    const headers = ['Student ID', 'Full Name', 'Department', 'Academic Year', 'Email Address', 'Phone Number'];
    const rows = listToExport.map(s => [
        `"${s.studentId}"`,
        `"${(s.name || '').replace(/"/g, '""')}"`,
        `"${s.department}"`,
        `"${s.year}"`,
        `"${s.email}"`,
        `"${s.phone}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `EduTrack_Students_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${listToExport.length} student records to CSV!`, 'success');
});

/* ==========================================================================
   Toast Notification System
   ========================================================================== */
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
        iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
    } else if (type === 'error') {
        iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    } else {
        iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `
        <span class="toast-icon">${iconSvg}</span>
        <span class="toast-message">${escapeHtml(message)}</span>
        <button type="button" class="toast-close" aria-label="Close notification">&times;</button>
    `;

    toastContainer.appendChild(toast);

    const closeBtn = toast.querySelector('.toast-close');
    const dismissToast = () => {
        toast.classList.add('toast-hiding');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 250);
    };

    closeBtn.addEventListener('click', dismissToast);

    // Auto dismiss after 4 seconds
    setTimeout(dismissToast, 4000);
}

/* ==========================================================================
   Helper Utilities
   ========================================================================== */
function getInitials(name) {
    if (!name) return 'ST';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function setupEventListeners() {
    themeToggleBtn.addEventListener('click', toggleTheme);
}