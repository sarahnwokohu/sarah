/* ============================================
   SARAH NWOKOHU PORTFOLIO
   Interactive Functionality
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    
    // ==========================================
    // NAVIGATION
    // ==========================================
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
        
        // Close mobile menu on link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }
    
    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
        } else {
            navbar.style.boxShadow = 'none';
        }
        
        lastScroll = currentScroll;
    });
    
    // ==========================================
    // ACADEMIC PLANNER
    // ==========================================
    const taskForm = document.getElementById('taskForm');
    const taskList = document.getElementById('taskList');
    const emptyState = document.getElementById('emptyState');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    // Initialize tasks array from localStorage or empty
    let tasks = JSON.parse(localStorage.getItem('academicTasks')) || [];
    
    // Pre-populate with sample tasks if empty
    if (tasks.length === 0) {
        tasks = [
            {
                id: Date.now() + 1,
                title: 'Complete COS 106 Term Project',
                subject: 'Introduction to Web Technologies',
                priority: 'high',
                due: new Date().toISOString().split('T')[0],
                completed: false,
                createdAt: new Date().toISOString()
            },
            {
                id: Date.now() + 2,
                title: 'Prepare Financial Analysis Report',
                subject: 'Business Administration',
                priority: 'medium',
                due: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                completed: false,
                createdAt: new Date().toISOString()
            }
        ];
        saveTasks();
    }
    
    let currentFilter = 'all';
    
    function saveTasks() {
        localStorage.setItem('academicTasks', JSON.stringify(tasks));
    }
    
    function updateStats() {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const pending = total - completed;
        
        const totalEl = document.getElementById('totalTasks');
        const pendingEl = document.getElementById('pendingTasks');
        const completedEl = document.getElementById('completedTasks');
        
        if (totalEl) totalEl.textContent = total;
        if (pendingEl) pendingEl.textContent = pending;
        if (completedEl) completedEl.textContent = completed;
    }
    
    function renderTasks() {
        if (!taskList) return;
        
        taskList.innerHTML = '';
        
        let filteredTasks = tasks;
        if (currentFilter === 'pending') {
            filteredTasks = tasks.filter(t => !t.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = tasks.filter(t => t.completed);
        }
        
        // Sort by priority and due date
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        filteredTasks.sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            return new Date(a.due) - new Date(b.due);
        });
        
        if (filteredTasks.length === 0) {
            if (emptyState) emptyState.classList.add('visible');
        } else {
            if (emptyState) emptyState.classList.remove('visible');
            
            filteredTasks.forEach(task => {
                const li = document.createElement('li');
                li.className = `task-item ${task.completed ? 'completed' : ''}`;
                li.innerHTML = `
                    <div class="task-checkbox" onclick="toggleTask(${task.id})"></div>
                    <div class="task-info">
                        <div class="task-title">${escapeHtml(task.title)}</div>
                        <div class="task-meta">
                            <span>${escapeHtml(task.subject)}</span>
                            <span>•</span>
                            <span>Due: ${formatDate(task.due)}</span>
                            <span class="task-priority priority-${task.priority}">${task.priority}</span>
                        </div>
                    </div>
                    <button class="task-delete" onclick="deleteTask(${task.id})" title="Delete task">×</button>
                `;
                taskList.appendChild(li);
            });
        }
        
        updateStats();
    }
    
    // Make functions globally accessible for onclick handlers
    window.toggleTask = function(id) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
        }
    };
    
    window.deleteTask = function(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            tasks = tasks.filter(t => t.id !== id);
            saveTasks();
            renderTasks();
        }
    };
    
    if (taskForm) {
        // Set default date to today
        const dueInput = document.getElementById('taskDue');
        if (dueInput) {
            dueInput.value = new Date().toISOString().split('T')[0];
            dueInput.min = new Date().toISOString().split('T')[0];
        }
        
        taskForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const title = document.getElementById('taskTitle').value.trim();
            const subject = document.getElementById('taskSubject').value.trim();
            const priority = document.getElementById('taskPriority').value;
            const due = document.getElementById('taskDue').value;
            
            if (!title || !subject || !due) return;
            
            const newTask = {
                id: Date.now(),
                title,
                subject,
                priority,
                due,
                completed: false,
                createdAt: new Date().toISOString()
            };
            
            tasks.push(newTask);
            saveTasks();
            renderTasks();
            
            // Reset form
            taskForm.reset();
            if (dueInput) dueInput.value = new Date().toISOString().split('T')[0];
            document.getElementById('taskPriority').value = 'medium';
            
            // Show feedback
            const btn = taskForm.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            btn.textContent = 'Task Added!';
            btn.style.background = '#22c55e';
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = '';
            }, 1500);
        });
    }
    
    // Filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            renderTasks();
        });
    });
    
    // Initial render
    renderTasks();
    
    // ==========================================
    // CONTACT FORM VALIDATION
    // ==========================================
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Clear previous errors
            document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
            document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
            document.getElementById('formSuccess').classList.remove('visible');
            
            const name = document.getElementById('contactName');
            const email = document.getElementById('contactEmail');
            const phone = document.getElementById('contactPhone');
            const message = document.getElementById('contactMessage');
            
            let isValid = true;
            
            // Name validation
            if (!name.value.trim()) {
                showError(name, 'nameError', 'Name is required');
                isValid = false;
            } else if (name.value.trim().length < 2) {
                showError(name, 'nameError', 'Name must be at least 2 characters');
                isValid = false;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email.value.trim()) {
                showError(email, 'emailError', 'Email is required');
                isValid = false;
            } else if (!emailRegex.test(email.value.trim())) {
                showError(email, 'emailError', 'Please enter a valid email address');
                isValid = false;
            }
            
            // Phone validation - digits only
            const phoneRegex = /^[0-9+\-\s()]+$/;
            if (!phone.value.trim()) {
                showError(phone, 'phoneError', 'Phone number is required');
                isValid = false;
            } else if (!phoneRegex.test(phone.value.trim())) {
                showError(phone, 'phoneError', 'Phone number must contain only digits');
                isValid = false;
            } else if (phone.value.replace(/[^0-9]/g, '').length < 7) {
                showError(phone, 'phoneError', 'Phone number is too short');
                isValid = false;
            }
            
            // Message validation
            if (!message.value.trim()) {
                showError(message, 'messageError', 'Message is required');
                isValid = false;
            } else if (message.value.trim().length < 10) {
                showError(message, 'messageError', 'Message must be at least 10 characters');
                isValid = false;
            }
            
            if (isValid) {
                // Simulate form submission
                const btn = contactForm.querySelector('button[type="submit"]');
                const originalText = btn.textContent;
                btn.textContent = 'Sending...';
                btn.disabled = true;
                
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.disabled = false;
                    contactForm.reset();
                    document.getElementById('formSuccess').classList.add('visible');
                }, 1500);
            }
        });
        
        // Real-time validation on blur
        ['contactName', 'contactEmail', 'contactPhone', 'contactMessage'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('blur', function() {
                    // Clear error for this field
                    const errorId = id.replace('contact', '').toLowerCase() + 'Error';
                    const errorEl = document.getElementById(errorId);
                    if (errorEl) errorEl.textContent = '';
                    this.classList.remove('error');
                });
            }
        });
    }
    
    function showError(input, errorId, message) {
        input.classList.add('error');
        const errorEl = document.getElementById(errorId);
        if (errorEl) errorEl.textContent = message;
    }
    
    // ==========================================
    // SMOOTH SCROLL ANIMATIONS
    // ==========================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for fade-in
    document.querySelectorAll('.info-card, .skill-category, .interest-card, .project-card, .timeline-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // ==========================================
    // UTILITY FUNCTIONS
    // ==========================================
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }
});
